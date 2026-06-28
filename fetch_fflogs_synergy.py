"""FFLogs上位ランキング(ジョブ別ランク100まで)から、シナジー(バフ)単位の
given(与えた)/taken(受けた)DPS内訳をCSV出力する。

シナジー(バフ)分析の原理:
  report.table(dataType: DamageDone) の各プレイヤーentryには
    - given: 自分が他者に与えたバフによるrDPS上昇(バフ名ごと) <- 与シナジー
    - taken: 他者から受けたバフによるrDPS上昇(バフ名ごと)     <- 受シナジー
  どちらも値は戦闘全体の合計ダメージ量なので、そのpullのdurationで割ってDPSに変換する。

使い方:
  python fetch_fflogs_synergy.py --encounter-id 103 --top-per-job 100
"""
import argparse
import csv
import json
import os
import time

import requests

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE_DIR = os.path.join(HERE, "cache")
OUTPUT_DIR = os.path.join(HERE, "output")
DELAY_SEC = 0.3

os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

JOB_SLUGS = [
    "Astrologian", "Bard", "BlackMage", "DarkKnight", "Dragoon", "Machinist",
    "Monk", "Ninja", "Paladin", "Scholar", "Summoner", "Warrior", "WhiteMage",
    "RedMage", "Samurai", "Dancer", "Gunbreaker", "Reaper", "Sage", "Viper",
    "Pictomancer",
]


def load_env():
    env = dict(os.environ)
    env_path = os.path.join(HERE, ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                env.setdefault(k.strip(), v.strip())
    return env


def get_token(client_id, client_secret):
    last_err = None
    for attempt in range(5):
        try:
            resp = requests.post(
                "https://www.fflogs.com/oauth/token",
                data={"grant_type": "client_credentials"},
                auth=(client_id, client_secret),
                timeout=20,
            )
            resp.raise_for_status()
            return resp.json()["access_token"]
        except requests.exceptions.RequestException as e:
            last_err = e
            time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"token取得失敗: {last_err}")


def gql(token, query, variables=None):
    last_err = None
    for attempt in range(10):
        try:
            resp = requests.post(
                "https://www.fflogs.com/api/v2/client",
                json={"query": query, "variables": variables or {}},
                headers={"Authorization": f"Bearer {token}"},
                timeout=30,
            )
            if resp.status_code == 429:
                wait = 60 * (attempt + 1)
                print(f"  429 レート制限 - {wait}秒待機してリトライ ({attempt+1}/10)...")
                time.sleep(wait)
                continue
            if resp.status_code in (502, 503, 504):
                raise requests.exceptions.HTTPError(f"{resp.status_code} from server")
            resp.raise_for_status()
            data = resp.json()
            if "errors" in data:
                raise RuntimeError(data["errors"])
            time.sleep(DELAY_SEC)
            return data["data"]
        except RuntimeError:
            raise
        except requests.exceptions.RequestException as e:
            last_err = e
            time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"gql failed after retries: {last_err}")


def find_zone(token, name_substring):
    query = """
    {
      worldData {
        expansions {
          zones { id name encounters { id name } }
        }
      }
    }
    """
    data = gql(token, query)
    needle = name_substring.lower()
    for exp in data["worldData"]["expansions"]:
        for zone in exp["zones"]:
            if needle in zone["name"].lower():
                return zone
    raise RuntimeError(f"ゾーンが見つかりません: {name_substring}")


def resolve_partitions(token, zone_id, patch):
    """同名の"Standard Comps (X.Y)"が複数あるのは地域別(全世界/CN/KR)に分かれているため。
    地域を網羅するため、patchに一致する全partitionを返す(1つだけ選ばない)。"""
    query = """
    query($zoneId: Int!) {
      worldData {
        zone(id: $zoneId) { partitions { id name default } }
      }
    }
    """
    data = gql(token, query, {"zoneId": zone_id})
    partitions = data["worldData"]["zone"]["partitions"]
    if patch is None:
        defaults = [p for p in partitions if p["default"]]
        return [(p["id"], p["name"]) for p in defaults] or [(None, "(zone default)")]
    candidates = [
        p for p in partitions
        if f"({patch})" in p["name"] and p["name"].startswith("Standard")
    ]
    if not candidates:
        raise RuntimeError(f"patch {patch} に対応するpartitionが見つかりません: {partitions}")
    candidates.sort(key=lambda p: p["id"])
    return [(p["id"], p["name"]) for p in candidates]


def fetch_rankings_for_job(token, encounter_id, metric, partition_id, top_n, spec_name):
    """characterRankingsは1ページ最大100件までしか返らないため、top_nが100を超える場合は
    pageを増やしながら複数回問い合わせて結合する。結果はキャッシュする。"""
    cache_key = f"rankings_{encounter_id}_{metric}_{partition_id}_{spec_name}_{top_n}.json"
    cache_path = os.path.join(CACHE_DIR, cache_key)
    if os.path.exists(cache_path):
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            os.remove(cache_path)

    query = """
    query($encId: Int!, $metric: CharacterRankingMetricType!, $partition: Int, $spec: String, $page: Int!) {
      worldData {
        encounter(id: $encId) {
          characterRankings(metric: $metric, page: $page, partition: $partition, className: "Global", specName: $spec)
        }
      }
    }
    """
    rankings = []
    page = 1
    while len(rankings) < top_n:
        variables = {"encId": encounter_id, "metric": metric, "spec": spec_name, "page": page}
        if partition_id is not None:
            variables["partition"] = partition_id
        data = gql(token, query, variables)
        result = data["worldData"]["encounter"]["characterRankings"]
        page_rankings = result.get("rankings", [])
        if not page_rankings:
            break
        rankings.extend(page_rankings)
        if not result.get("hasMorePages"):
            break
        page += 1
    result = rankings[:top_n]
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(result, f)
    return result


def fetch_table(token, code, fight_id, data_type):
    safe_code = code.replace(":", "_")
    cache_path = os.path.join(CACHE_DIR, f"table_{safe_code}_{fight_id}_{data_type}.json")
    if os.path.exists(cache_path):
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            os.remove(cache_path)
    query = """
    query($code: String!, $fightId: Int!, $dataType: TableDataType!) {
      reportData {
        report(code: $code) {
          table(fightIDs: [$fightId], dataType: $dataType)
        }
      }
    }
    """
    data = gql(token, query, {"code": code, "fightId": fight_id, "dataType": data_type})
    table = data["reportData"]["report"]["table"]
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(table, f, ensure_ascii=False)
    return table


def entries_by_name(table):
    if not table:
        return {}
    entries = table.get("data", {}).get("entries", [])
    return {e["name"]: e for e in entries}


def main():
    parser = argparse.ArgumentParser(description="FFLogsジョブ別ランキングのアビリティ/シナジー別given・taken集計")
    parser.add_argument("--zone", default="Heavyweight", help="ゾーン名の部分一致")
    parser.add_argument("--encounter-id", type=int, required=True, help="対象encounter ID(例: 103 = The Tyrant)")
    parser.add_argument("--patch", default="7.4", help="パッチ番号(例: 7.4)")
    parser.add_argument("--metrics", default="rdps", help="ランキング指標(カンマ区切りで複数指定可。例: rdps,adps,ndps,cdps)")
    parser.add_argument("--top-per-job", type=int, default=100, help="ジョブ×メトリクス×地域ごとに見る上位ランキング件数")
    parser.add_argument("--tag", default="", help="出力ファイル名に付ける識別子(パターン比較用)")
    parser.add_argument("--jobs", default="", help="対象ジョブをカンマ区切りで限定(省略時は全ジョブ。お試し実行用)")
    args = parser.parse_args()
    metrics = [m.strip() for m in args.metrics.split(",") if m.strip()]
    job_slugs = [j.strip() for j in args.jobs.split(",") if j.strip()] or JOB_SLUGS

    env = load_env()
    token = get_token(env["FFLOGS_CLIENT_ID"], env["FFLOGS_CLIENT_SECRET"])

    zone = find_zone(token, args.zone)
    partitions = resolve_partitions(token, zone["id"], args.patch)
    enc_name = next((e["name"] for e in zone["encounters"] if e["id"] == args.encounter_id), str(args.encounter_id))
    print(f"ゾーン: {zone['name']} / encounter: {enc_name} / partition: {partitions}")

    print(f"使用メトリクス: {metrics} / 対象ジョブ: {job_slugs}")
    all_rankings = []
    for job in job_slugs:
        job_total = 0
        for metric in metrics:
            for partition_id, _ in partitions:
                rankings = fetch_rankings_for_job(token, args.encounter_id, metric, partition_id, args.top_per_job, job)
                job_total += len(rankings)
                for i, r in enumerate(rankings, start=1):
                    r["_job"] = job
                    r["_rank_in_job"] = i  # 各partition(地域)×metric内でのランク
                    r["_metric"] = metric
                    all_rankings.append(r)
        print(f"  {job}: {job_total}件 (全地域×全メトリクス合計)")

    # rank_lookupには「ランク100以内に入ったプレイヤー」の情報のみが入る。
    # 同じログの他のパーティメンバー(ランク外)はここに無いので、出力時はjob名をtableのtype欄から補う。
    rank_lookup = {}
    pull_duration_ms = {}
    unique_pulls = {}
    for r in all_rankings:
        key = (r["report"]["code"], r["report"]["fightID"])
        unique_pulls[key] = None
        pull_duration_ms[key] = r["duration"]
        server = r.get("server", {})
        rank_lookup[(key, r["name"])] = {
            "job": r["_job"],
            "rank_in_job": r["_rank_in_job"],
            "amount": r["amount"],
            "ranked_metric": r["_metric"],
            "region": server.get("region", ""),
            "server": server.get("name", ""),
        }
    # 1ログ内の全員は同じデータセンター(=同じregion)に居るので、そのログ内で誰か1人でも
    # ランクインしていればregionが分かる。これを全パーティメンバーに展開する。
    pull_region = {}
    for (key, _name), info in rank_lookup.items():
        if info.get("region"):
            pull_region[key] = info["region"]

    print(f"\nユニークログ数: {len(unique_pulls)}")

    for i, (code, fight_id) in enumerate(unique_pulls, start=1):
        try:
            given_table = fetch_table(token, code, fight_id, "DamageDone")
            unique_pulls[(code, fight_id)] = entries_by_name(given_table)
        except RuntimeError as e:
            print(f"  スキップ({code}#{fight_id}): {e}")
            unique_pulls[(code, fight_id)] = {}
        if i % 20 == 0 or i == len(unique_pulls):
            print(f"  ログ取得: [{i}/{len(unique_pulls)}]")

    tag_suffix = f"_{args.tag}" if args.tag else ""
    prefix = os.path.join(OUTPUT_DIR, f"{args.encounter_id}_{enc_name.replace(' ', '_')}{tag_suffix}")

    with open(f"{prefix}_given_synergy.csv", "w", encoding="utf-8-sig", newline="") as f2, \
         open(f"{prefix}_taken_synergy.csv", "w", encoding="utf-8-sig", newline="") as f3:

        w2 = csv.writer(f2)
        w2.writerow(["job", "player", "region", "server", "is_own_ranked_log", "rank_in_job", "ranked_metric", "amount", "buff_given", "buff_icon", "dps_value", "duration_sec", "party_comp_others", "report_code", "fight_id"])
        w3 = csv.writer(f3)
        w3.writerow(["job", "player", "region", "server", "is_own_ranked_log", "rank_in_job", "ranked_metric", "amount", "buff_received", "buff_icon", "from_job", "dps_value", "duration_sec", "party_comp_others", "report_code", "fight_id"])

        for key, entries in unique_pulls.items():
            code, fight_id = key
            duration_sec = pull_duration_ms[key] / 1000
            region_for_pull = pull_region.get(key, "")
            for name, entry in entries.items():
                info = rank_lookup.get((key, name))
                is_own_ranked_log = info is not None
                info = info or {}
                job = info.get("job", entry.get("type", ""))
                rank_in_job = info.get("rank_in_job", "")
                ranked_metric = info.get("ranked_metric", "")
                amount = info.get("amount", "")
                server_name = info.get("server", "")
                # 自分以外のパーティメンバーのジョブ構成(同ログ内の他エントリのtype)
                others_jobs = sorted(
                    other_entry.get("type", "") for other_name, other_entry in entries.items() if other_name != name
                )
                party_comp_others = ",".join(others_jobs)

                for buff in entry.get("given", []):
                    dps_value = buff["total"] / duration_sec
                    w2.writerow([job, name, region_for_pull, server_name, is_own_ranked_log, rank_in_job, ranked_metric, amount, buff["name"], buff.get("abilityIcon", ""), dps_value, duration_sec, party_comp_others, code, fight_id])
                for buff in entry.get("taken", []):
                    dps_value = buff["total"] / duration_sec
                    w3.writerow([job, name, region_for_pull, server_name, is_own_ranked_log, rank_in_job, ranked_metric, amount, buff["name"], buff.get("abilityIcon", ""), buff.get("type", ""), dps_value, duration_sec, party_comp_others, code, fight_id])

    print(f"\nCSV出力先: {prefix}_*.csv")


if __name__ == "__main__":
    main()

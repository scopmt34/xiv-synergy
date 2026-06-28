"""XIVAPI v2(公式ゲームデータ)からジョブ・シナジー・ボス名の日本語名とアイコンを取得し、
viewer.html に埋め込むJSON辞書を生成する。
"""
import csv
import json
import re
import time

import requests

JOB_ABBR = {
    "Astrologian": "AST", "Bard": "BRD", "BlackMage": "BLM", "DarkKnight": "DRK",
    "Dragoon": "DRG", "Machinist": "MCH", "Monk": "MNK", "Ninja": "NIN",
    "Paladin": "PLD", "Scholar": "SCH", "Summoner": "SMN", "Warrior": "WAR",
    "WhiteMage": "WHM", "RedMage": "RDM", "Samurai": "SAM", "Dancer": "DNC",
    "Gunbreaker": "GNB", "Reaper": "RPR", "Sage": "SGE", "Viper": "VPR",
    "Pictomancer": "PCT",
}

BOSS_BNPC_ROWS = {
    "Vamp_Fatale": [14300],
    "Red_Hot_and_Deep_Blue": [14370, 14369],
    "The_Tyrant": [14305],
    "Lindwurm": [14378],
    "Lindwurm_II": [14379],
}


def get(url, params):
    for attempt in range(3):
        r = requests.get(url, params=params, timeout=15)
        if r.status_code == 200:
            return r.json()
        time.sleep(1)
    raise RuntimeError(f"failed: {url} {params} -> {r.status_code} {r.text[:200]}")


def asset_url(path):
    return f"https://v2.xivapi.com/api/asset?path={path}&format=png"


def collect_buff_icon_numbers():
    """既存CSVから buff名 -> FFLogsアイコン番号 のマップを作る(Action検索の曖昧さ解消用)"""
    mapping = {}
    with open("output/ALL_top50_taken_by_job_and_synergy.csv", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            icon = row.get("buff_icon", "")
            m = re.match(r"(\d+)-(\d+)\.png", icon or "")
            if m and row["buff_received"] not in mapping:
                mapping[row["buff_received"]] = int(m.group(2))
    with open("output/ALL_top50_given_by_job_and_synergy.csv", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            icon = row.get("buff_icon", "")
            m = re.match(r"(\d+)-(\d+)\.png", icon or "")
            if m and row["buff_given"] not in mapping:
                mapping[row["buff_given"]] = int(m.group(2))
    return mapping


def main():
    result = {"jobs": {}, "buffs": {}, "bosses": {}}

    # ---- jobs ----
    # ClassJob自体にはUIアイコンが無いため、ソウルクリスタル(ItemSoulCrystal)のアイコンを代用する
    en_data = get("https://v2.xivapi.com/api/sheet/ClassJob",
                   params={"language": "en", "fields": "Name,Abbreviation,ItemSoulCrystal"})
    ja_data = get("https://v2.xivapi.com/api/sheet/ClassJob",
                   params={"language": "ja", "fields": "Name,Abbreviation"})
    ja_by_abbr = {row["fields"]["Abbreviation"]: row["fields"]["Name"] for row in ja_data["rows"]}

    for job, abbr in JOB_ABBR.items():
        row = next((r for r in en_data["rows"] if r["fields"]["Abbreviation"] == abbr), None)
        if not row:
            print(f"WARN: job not found {job}")
            continue
        crystal = row["fields"].get("ItemSoulCrystal")
        icon_path = crystal["fields"]["Icon"]["path"] if crystal and crystal.get("fields") else None
        result["jobs"][job] = {
            "ja": ja_by_abbr.get(abbr, job),
            "abbr": abbr,
            "icon": asset_url(icon_path) if icon_path else "",
        }
        print(f"job {job}: {result['jobs'][job]['ja']}")

    # ---- buffs (Action sheet、見つからなければStatus sheet) ----
    icon_hint = collect_buff_icon_numbers()
    for buff_name, icon_num in icon_hint.items():
        if buff_name == "Medicated":
            continue
        best = None
        best_sheet = "Action"
        for sheet in ["Action", "Status"]:
            search = get("https://v2.xivapi.com/api/search",
                          params={"query": f'Name="{buff_name}"', "sheets": sheet})
            results = search.get("results", [])
            for r in results:
                icon_id = r["fields"].get("Icon", {}).get("id")
                if icon_id == icon_num:
                    best = r
                    best_sheet = sheet
                    break
            if best:
                break
            if results and best is None:
                best = results[0]
                best_sheet = sheet
        if best is None:
            print(f"WARN: buff not found {buff_name}")
            continue
        row_id = best["row_id"]
        ja_row = get(f"https://v2.xivapi.com/api/sheet/{best_sheet}/{row_id}", params={"language": "ja", "fields": "Name"})
        icon_path = best["fields"]["Icon"]["path"]
        result["buffs"][buff_name] = {
            "ja": ja_row["fields"]["Name"],
            "icon": asset_url(icon_path),
        }
        print(f"buff {buff_name}: {result['buffs'][buff_name]['ja']}")

    # ---- bosses (BNpcName sheet) ----
    for boss, row_ids in BOSS_BNPC_ROWS.items():
        names = []
        for rid in row_ids:
            ja_row = get(f"https://v2.xivapi.com/api/sheet/BNpcName/{rid}", params={"language": "ja", "fields": "Singular"})
            names.append(ja_row["fields"]["Singular"])
        result["bosses"][boss] = "&".join(names) if len(names) > 1 else names[0]
        print(f"boss {boss}: {result['bosses'][boss]}")

    with open("official_translations.json", "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print("\n書き出し: official_translations.json")


if __name__ == "__main__":
    main()

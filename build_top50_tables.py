"""全ボスのgiven/taken_synergy.csvから「ジョブ×シナジー×ランク50」表を作る(given/taken両方)。
API呼び出しは行わず、既存CSVのみを使ったローカル集計。

使い方:
  python build_top50_tables.py
"""
import csv
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(HERE, "output")

# (tier_key, tier_label, [(encounter_id, boss_name_in_filename), ...])
TIER_BOSSES = [
    ("light_heavyweight", "AAC Light-Heavyweight", [
        (93,  "Black_Cat"),
        (94,  "Honey_B._Lovely"),
        (95,  "Brute_Bomber"),
        (96,  "Wicked_Thunder"),
    ]),
    ("cruiserweight", "AAC Cruiserweight", [
        (97,  "Dancing_Green"),
        (98,  "Sugar_Riot"),
        (99,  "Brute_Abombinator"),
        (100, "Howling_Blade"),
    ]),
    ("heavyweight", "AAC Heavyweight", [
        (101, "Vamp_Fatale"),
        (102, "Red_Hot_and_Deep_Blue"),
        (103, "The_Tyrant"),
        (104, "Lindwurm"),
        (105, "Lindwurm_II"),
    ]),
]

TOP_N = 100


def load_boss(boss_id, name, direction, tier_key):
    path = os.path.join(OUTPUT_DIR, f"{boss_id}_{name}_{direction}_synergy.csv")
    with open(path, encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    for r in rows:
        r["dps_value"] = float(r["dps_value"])
        r["_boss"] = name
        r["_boss_id"] = boss_id
        r["_tier"] = tier_key
    return rows


def build(direction, buff_col):
    out_path = os.path.join(OUTPUT_DIR, f"ALL_top100_{direction}_by_job_and_synergy.csv")
    with open(out_path, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["tier", "boss_id", "boss", "job", buff_col, "buff_icon", "rank", "player",
                    "dps_value", "region", "server", "is_own_ranked_log", "duration_sec",
                    "party_comp_others", "report_code", "fight_id"])

        for tier_key, tier_label, bosses in TIER_BOSSES:
            for boss_id, name in bosses:
                path = os.path.join(OUTPUT_DIR, f"{boss_id}_{name}_{direction}_synergy.csv")
                if not os.path.exists(path):
                    print(f"[{direction}] SKIP (未取得): {name}")
                    continue
                rows = load_boss(boss_id, name, direction, tier_key)
                print(f"[{direction}] {name}: {len(rows)}行 読み込み")

                groups = {}
                for r in rows:
                    groups.setdefault((r["job"], r[buff_col]), []).append(r)
                for (job, buff), grp in groups.items():
                    grp.sort(key=lambda r: r["dps_value"], reverse=True)
                    for i, r in enumerate(grp[:TOP_N], start=1):
                        w.writerow([tier_key, boss_id, name, job, buff, r.get("buff_icon", ""),
                                    i, r["player"], r["dps_value"], r["region"], r["server"],
                                    r["is_own_ranked_log"], r["duration_sec"],
                                    r["party_comp_others"], r["report_code"], r["fight_id"]])
    print(f"出力: {out_path}")


def main():
    build("taken", "buff_received")
    build("given", "buff_given")


if __name__ == "__main__":
    main()

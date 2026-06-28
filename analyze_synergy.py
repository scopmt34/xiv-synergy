"""given_synergy.csv / taken_synergy.csv から、特定のバフ(シナジー)に絞って
ジョブ別ランキングと個人ランキングを表示する。API呼び出しは行わずローカルCSVのみ参照する。

使い方:
  python analyze_synergy.py output/103_The_Tyrant_taken_synergy.csv --buff Divination
  python analyze_synergy.py output/103_The_Tyrant_given_synergy.csv --buff Divination
"""
import argparse
import csv
import os
import statistics


def main():
    parser = argparse.ArgumentParser(description="特定シナジーのジョブ別/個人別ランキング表示")
    parser.add_argument("csv_path", help="given_synergy.csv または taken_synergy.csv のパス")
    parser.add_argument("--buff", required=True, help="絞り込むバフ名(例: Divination)")
    parser.add_argument("--top", type=int, default=20, help="個人ランキングの表示件数")
    parser.add_argument("--own-only", action="store_true", help="本人がランク100以内に入ったログのみに絞り込む")
    args = parser.parse_args()

    with open(args.csv_path, "r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))

    buff_col = "buff_given" if "buff_given" in rows[0] else "buff_received"
    matched = [r for r in rows if r[buff_col] == args.buff]
    if args.own_only:
        matched = [r for r in matched if r.get("is_own_ranked_log") == "True"]
    if not matched:
        names = sorted({r[buff_col] for r in rows})
        print(f"'{args.buff}' は見つかりませんでした。候補: {names}")
        return

    for r in matched:
        r["dps_value"] = float(r["dps_value"])
    matched.sort(key=lambda r: r["dps_value"], reverse=True)

    by_job = {}
    for r in matched:
        by_job.setdefault(r["job"], []).append(r["dps_value"])

    lines = []
    lines.append(f"=== {args.buff} ({buff_col}) ジョブ別集計 (平均DPS降順) ===")
    job_stats = []
    for job, values in by_job.items():
        job_stats.append((job, len(values), statistics.mean(values), max(values), statistics.median(values)))
    job_stats.sort(key=lambda x: x[2], reverse=True)
    lines.append(f"{'job':<14}{'n':>5}{'avg':>14}{'median':>14}{'max':>14}")
    for job, n, avg, mx, med in job_stats:
        lines.append(f"{job:<14}{n:>5}{avg:>14.1f}{med:>14.1f}{mx:>14.1f}")

    lines.append(f"\n=== {args.buff} 個人ランキング 上位{args.top} ===")
    lines.append("is_own_ranked_log: その人自身がランク100以内に入ったログかどうか(Falseは他人のログに同席していただけ)")
    lines.append(f"{'rank':<6}{'player':<20}{'job':<14}{'dps_value':>12}{'duration_sec':>14}{'own_log':>9}  report_url")
    for i, r in enumerate(matched[:args.top], start=1):
        duration_sec = float(r.get("duration_sec", 0) or 0)
        own_log = r.get("is_own_ranked_log", "")
        report_url = f"https://www.fflogs.com/reports/{r.get('report_code', '')}#fight={r.get('fight_id', '')}"
        lines.append(f"{i:<6}{r['player']:<20}{r['job']:<14}{r['dps_value']:>12.1f}{duration_sec:>14.1f}{own_log:>9}  {report_url}")

    suffix = "_ownonly" if args.own_only else ""
    out_path = os.path.splitext(args.csv_path)[0] + f"_{args.buff}{suffix}_analysis.txt"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"結果を出力しました: {out_path}")


if __name__ == "__main__":
    main()

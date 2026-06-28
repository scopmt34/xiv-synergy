// ===== 翻訳・メタデータ(viewer.html / summary.html 共通) =====

// ティア定義(どの零式か)
const TIERS = [
  { key: "heavyweight",       label: "ヘビー級(7.4)",    bosses: ["Vamp_Fatale", "Red_Hot_and_Deep_Blue", "The_Tyrant", "Lindwurm", "Lindwurm_II"] },
  { key: "cruiserweight",     label: "クルーザー級(7.2)", bosses: ["Dancing_Green", "Sugar_Riot", "Brute_Abombinator", "Howling_Blade"] },
  { key: "light_heavyweight", label: "LH級(7.05)",       bosses: ["Black_Cat", "Honey_B._Lovely", "Brute_Bomber", "Wicked_Thunder"] },
];
const BOSS_ORDER = TIERS.flatMap(t => t.bosses);
function tierOfBoss(boss) {
  return TIERS.find(t => t.bosses.includes(boss))?.key || "";
}

const BOSS_JP = {
  "Black_Cat":            "ブラックキャット",
  "Honey_B._Lovely":      "ハニー・B・ラブリー",
  "Brute_Bomber":         "ブルートボンバー",
  "Wicked_Thunder":       "ウィケッドサンダー",
  "Dancing_Green":        "ダンシング・グリーン",
  "Sugar_Riot":           "シュガー・ライオット",
  "Brute_Abombinator":    "ブルートアボミネーター",
  "Howling_Blade":        "ハウリング・ブレイド",
  "Vamp_Fatale":          "ヴァンプ・ファタール",
  "Red_Hot_and_Deep_Blue":"エクストリームズ",
  "The_Tyrant":           "ザ・タイラント",
  "Lindwurm":             "リントブルム 前半",
  "Lindwurm_II":          "リントブルム 後半",
};
// ボスアイコンはFFLogsのCDN(encounter_id基準)から取得
const BOSS_ICON = {
  "Black_Cat":            "https://assets.rpglogs.com/img/ff/bosses/93-icon.jpg",
  "Honey_B._Lovely":      "https://assets.rpglogs.com/img/ff/bosses/94-icon.jpg",
  "Brute_Bomber":         "https://assets.rpglogs.com/img/ff/bosses/95-icon.jpg",
  "Wicked_Thunder":       "https://assets.rpglogs.com/img/ff/bosses/96-icon.jpg",
  "Dancing_Green":        "https://assets.rpglogs.com/img/ff/bosses/97-icon.jpg",
  "Sugar_Riot":           "https://assets.rpglogs.com/img/ff/bosses/98-icon.jpg",
  "Brute_Abombinator":    "https://assets.rpglogs.com/img/ff/bosses/99-icon.jpg",
  "Howling_Blade":        "https://assets.rpglogs.com/img/ff/bosses/100-icon.jpg",
  "Vamp_Fatale":          "https://assets.rpglogs.com/img/ff/bosses/101-icon.jpg",
  "Red_Hot_and_Deep_Blue":"https://assets.rpglogs.com/img/ff/bosses/102-icon.jpg",
  "The_Tyrant":           "https://assets.rpglogs.com/img/ff/bosses/103-icon.jpg",
  "Lindwurm":             "https://assets.rpglogs.com/img/ff/bosses/104-icon.jpg",
  "Lindwurm_II":          "https://assets.rpglogs.com/img/ff/bosses/105-icon.jpg",
};

// ジョブの並び順(タンク<ヒーラー<メレー<物理レンジ<キャスター)は公式ジョブガイド準拠
// https://jp.finalfantasyxiv.com/jobguide/battle/
const ROLE_GROUPS = [
  { key: "tank", label: "タンク", jobs: ["Paladin", "Warrior", "DarkKnight", "Gunbreaker"] },
  { key: "healer", label: "ヒーラー", jobs: ["WhiteMage", "Scholar", "Astrologian", "Sage"] },
  { key: "melee", label: "メレー", jobs: ["Monk", "Dragoon", "Ninja", "Samurai", "Reaper", "Viper"] },
  { key: "ranged", label: "レンジ", jobs: ["Bard", "Machinist", "Dancer"] },
  { key: "caster", label: "キャス", jobs: ["BlackMage", "Summoner", "RedMage", "Pictomancer"] },
];
const JOB_ORDER = ROLE_GROUPS.flatMap(g => g.jobs);
function jobOrderIndex(job) {
  const i = JOB_ORDER.indexOf(job);
  return i === -1 ? 999 : i;
}
// FFLogsが各ジョブ表示に使っている色(出典: xivanalysis リポジトリの src/data/JOBS.ts、
// FFLogs由来の色と一致することを確認済み)
const JOB_COLOR = {
  Paladin: "#a8d2e6", Warrior: "#cf2621", DarkKnight: "#d126cc", Gunbreaker: "#796d30",
  WhiteMage: "#fff0dc", Scholar: "#8657ff", Astrologian: "#ffe74a", Sage: "#80a0f0",
  Monk: "#d69c00", Dragoon: "#4164cd", Ninja: "#af1964", Samurai: "#e46d04",
  Reaper: "#965a90", Viper: "#30a230", Bard: "#91ba5e", Machinist: "#6ee1d6",
  Dancer: "#e2b0af", BlackMage: "#a579d6", Summoner: "#2d9b78", RedMage: "#e87b7b",
  Pictomancer: "#ffa2f1",
};
function jobColor(job) {
  return JOB_COLOR[job] || "#e6e8ec";
}

// アイコンは公式ジョブガイド(上記URL)に掲載されているカラーアイコンをそのまま使用
const JOB_META = {
  Paladin:     { jp: "ナイト",         abbr: "PLD", icon: "https://lds-img.finalfantasyxiv.com/promo/h/V/NUXU4h6iXzF8HS4BxHKYf7vOa0.png" },
  Warrior:     { jp: "戦士",           abbr: "WAR", icon: "https://lds-img.finalfantasyxiv.com/promo/h/0/U3f8Q98TbAeGvg_vXiHGOaa2d4.png" },
  DarkKnight:  { jp: "暗黒騎士",       abbr: "DRK", icon: "https://lds-img.finalfantasyxiv.com/promo/h/9/5JT3hJnBNPZSLAijAF9u7zrueQ.png" },
  Gunbreaker:  { jp: "ガンブレイカー", abbr: "GNB", icon: "https://lds-img.finalfantasyxiv.com/promo/h/8/fc5PYpEFGrg4qPYDq_YBbCy1X0.png" },
  WhiteMage:   { jp: "白魔道士",       abbr: "WHM", icon: "https://lds-img.finalfantasyxiv.com/promo/h/G/Na619RGtVtbEvNn1vyFoSlvZ84.png" },
  Scholar:     { jp: "学者",           abbr: "SCH", icon: "https://lds-img.finalfantasyxiv.com/promo/h/s/2r8fm3U0Io7Pw1XT1tvnjPthp4.png" },
  Astrologian: { jp: "占星術師",       abbr: "AST", icon: "https://lds-img.finalfantasyxiv.com/promo/h/E/g7JY4S1D-9S26VarEuIkPGIrFM.png" },
  Sage:        { jp: "賢者",           abbr: "SGE", icon: "https://lds-img.finalfantasyxiv.com/promo/h/e/G0lQTD01LdCGk5pECSc7fbbmbM.png" },
  Monk:        { jp: "モンク",         abbr: "MNK", icon: "https://lds-img.finalfantasyxiv.com/promo/h/C/Ce_VQB6VPPJKTGJwxf3h5iujp4.png" },
  Dragoon:     { jp: "竜騎士",         abbr: "DRG", icon: "https://lds-img.finalfantasyxiv.com/promo/h/1/zWRkXGJIJhN7WHGGv1gVscRxmA.png" },
  Ninja:       { jp: "忍者",           abbr: "NIN", icon: "https://lds-img.finalfantasyxiv.com/promo/h/N/EXvdQYvr1Rn4En8AKssbVwwcac.png" },
  Samurai:     { jp: "侍",             abbr: "SAM", icon: "https://lds-img.finalfantasyxiv.com/promo/h/J/Ra2GV79gVQhy6SwCrU19boTghc.png" },
  Reaper:      { jp: "リーパー",       abbr: "RPR", icon: "https://lds-img.finalfantasyxiv.com/promo/h/p/y8GHAXX4qhY7D-yqnCqtEPkjoo.png" },
  Viper:       { jp: "ヴァイパー",     abbr: "VPR", icon: "https://lds-img.finalfantasyxiv.com/promo/h/p/sS2MK2LmSHGjziXHE6DIOw7_4U.png" },
  Bard:        { jp: "吟遊詩人",       abbr: "BRD", icon: "https://lds-img.finalfantasyxiv.com/promo/h/b/d7BM1x8OZRZU-9fTk-D7g1t2oc.png" },
  Machinist:   { jp: "機工士",         abbr: "MCH", icon: "https://lds-img.finalfantasyxiv.com/promo/h/2/oHLJxTt_OLDK_eQkRTBVNwwxeE.png" },
  Dancer:      { jp: "踊り子",         abbr: "DNC", icon: "https://lds-img.finalfantasyxiv.com/promo/h/0/ZzzbixB1HHW9FaxNXdfY7Y7lvw.png" },
  BlackMage:   { jp: "黒魔道士",       abbr: "BLM", icon: "https://lds-img.finalfantasyxiv.com/promo/h/A/7JuT00VSwaFqTfcTYUCUnGPFQE.png" },
  Summoner:    { jp: "召喚士",         abbr: "SMN", icon: "https://lds-img.finalfantasyxiv.com/promo/h/b/ZwJFxv3XnfqB5N6tKbgXKnj6BU.png" },
  RedMage:     { jp: "赤魔道士",       abbr: "RDM", icon: "https://lds-img.finalfantasyxiv.com/promo/h/C/NRnqJxzRtbDKR1ZHzxazWBBR2Y.png" },
  Pictomancer: { jp: "ピクトマンサー", abbr: "PCT", icon: "https://lds-img.finalfantasyxiv.com/promo/h/e/t0iiQ-ja8O8YNZaVimL5Qb6Tnw.png" },
};

// シナジー(バフ)を付与するジョブ。並び順をジョブ順に揃えるために使用
const BUFF_JOB = {
  "Divination": "Astrologian",
  "The Spear": "Astrologian",
  "The Balance": "Astrologian",
  "Chain Stratagem": "Scholar",
  "Searing Light": "Summoner",
  "Battle Litany": "Dragoon",
  "Brotherhood": "Monk",
  "Dokumori": "Viper",
  "Arcane Circle": "Reaper",
  "Radiant Finale": "Bard",
  "Battle Voice": "Bard",
  "The Wanderer's Minuet": "Bard",
  "Mage's Ballad": "Bard",
  "Army's Paeon": "Bard",
  "Technical Finish": "Dancer",
  "Devilment": "Dancer",
  "Standard Finish": "Dancer",
  "Embolden": "RedMage",
  "Starry Muse": "Pictomancer",
};
function buffJobOrderIndex(buff) {
  return jobOrderIndex(BUFF_JOB[buff] || "");
}

const BUFF_JP = {
  "Divination": "ディヴィネーション",
  "Chain Stratagem": "連環計",
  "Radiant Finale": "光神のフィナーレ",
  "Starry Muse": "イマジンスカイ",
  "Battle Voice": "バトルボイス",
  "The Wanderer's Minuet": "旅神のメヌエット",
  "Mage's Ballad": "賢人のバラード",
  "Army's Paeon": "軍神のパイオン",
  "The Spear": "ハルオーネの槍",
  "The Balance": "アーゼマの均衡",
  "Battle Litany": "バトルリタニー",
  "Dokumori": "毒盛の術",
  "Searing Light": "シアリングライト",
  "Technical Finish": "テクニカルフィニッシュ",
  "Devilment": "攻めのタンゴ",
  "Standard Finish": "スタンダードフィニッシュ",
  "Brotherhood": "桃園結義：攻撃",
  "Arcane Circle": "アルケインサークル",
  "Embolden": "エンボルデン",
};
const BUFF_ICON = {
  "Divination": "https://v2.xivapi.com/api/asset?path=ui/icon/213000/213245.tex&format=png",
  "Chain Stratagem": "https://v2.xivapi.com/api/asset?path=ui/icon/212000/212809.tex&format=png",
  "Radiant Finale": "https://v2.xivapi.com/api/asset?path=ui/icon/212000/212624.tex&format=png",
  "Starry Muse": "https://v2.xivapi.com/api/asset?path=ui/icon/213000/213808.tex&format=png",
  "Battle Voice": "https://v2.xivapi.com/api/asset?path=ui/icon/212000/212601.tex&format=png",
  "The Wanderer's Minuet": "https://v2.xivapi.com/api/asset?path=ui/icon/212000/212610.tex&format=png",
  "Mage's Ballad": "https://v2.xivapi.com/api/asset?path=ui/icon/212000/212603.tex&format=png",
  "Army's Paeon": "https://v2.xivapi.com/api/asset?path=ui/icon/212000/212605.tex&format=png",
  "The Spear": "https://v2.xivapi.com/api/asset?path=ui/icon/213000/213207.tex&format=png",
  "The Balance": "https://v2.xivapi.com/api/asset?path=ui/icon/213000/213204.tex&format=png",
  "Battle Litany": "https://v2.xivapi.com/api/asset?path=ui/icon/212000/212578.tex&format=png",
  "Dokumori": "https://v2.xivapi.com/api/asset?path=ui/icon/212000/212920.tex&format=png",
  "Searing Light": "https://v2.xivapi.com/api/asset?path=ui/icon/212000/212699.tex&format=png",
  "Technical Finish": "https://v2.xivapi.com/api/asset?path=ui/icon/213000/213709.tex&format=png",
  "Devilment": "https://v2.xivapi.com/api/asset?path=ui/icon/213000/213714.tex&format=png",
  "Standard Finish": "https://v2.xivapi.com/api/asset?path=ui/icon/213000/213708.tex&format=png",
  "Brotherhood": "https://v2.xivapi.com/api/asset?path=ui/icon/212000/212532.tex&format=png",
  "Arcane Circle": "https://v2.xivapi.com/api/asset?path=ui/icon/212000/212936.tex&format=png",
  "Embolden": "https://v2.xivapi.com/api/asset?path=ui/icon/213000/213410.tex&format=png",
};

function jobMeta(job) {
  return JOB_META[job] || { jp: job, abbr: job.slice(0, 3).toUpperCase(), icon: "" };
}
function buffJp(name) {
  return BUFF_JP[name] || name;
}
function bossJp(name) {
  return BOSS_JP[name] || name;
}
function bossIcon(name) {
  return BOSS_ICON[name] || '';
}
function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function jobChip(job, mini, self, filterType = 'job', extraClass = '') {
  const m = jobMeta(job);
  const color = self ? '#ffd24a' : jobColor(job);
  const icon = m.icon
    ? `<img class="jobicon${mini ? ' mini' : ''}${self ? ' self' : ''}" src="${m.icon}" title="${m.jp}${self ? '(本人)' : ''}">`
    : `<span class="jobdot${mini ? ' mini' : ''}" style="background:#666">${m.abbr.slice(0,2)}</span>`;
  const label = mini ? '' : `<span style="color:${color}">${m.jp}</span>`;
  const ec = extraClass ? ' ' + extraClass : '';
  return `<span class="jobchip cell-filter${self ? ' self' : ''}${ec}" data-filter-type="${filterType}" data-filter-value="${escapeAttr(job)}">${icon}${label}</span>`;
}
function formatDuration(sec) {
  sec = Math.round(parseFloat(sec) || 0);
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
function partyCompFullHtml(selfJob, othersCsv, compCounts) {
  const others = othersCsv ? othersCsv.split(',').filter(j => JOB_ORDER.includes(j)) : [];
  const list = others.map(j => ({ job: j, self: false })).concat([{ job: selfJob, self: true }]);
  // 同ジョブが複数いる場合はselfを先頭に(selfの金色枠を1つ目ハイライトとして扱う)
  list.sort((a, b) => {
    const d = jobOrderIndex(a.job) - jobOrderIndex(b.job);
    return d !== 0 ? d : (a.self ? -1 : 1);
  });
  const occurrences = new Map();
  return `<span class="partycomp">${list.map(it => {
    const occ = occurrences.get(it.job) || 0;
    occurrences.set(it.job, occ + 1);
    const reqCount = compCounts ? (compCounts.get(it.job) || 0) : 0;
    let extraClass = '';
    let filterType = 'comp';
    if (reqCount > 0) {
      if (occ < reqCount) {
        if (it.self) {
          filterType = 'comp';     // self(黄色): クリック → トグル
        } else {
          extraClass = 'comp-filtered';
          filterType = 'comp-dec'; // 青色: クリック → −1(count=1なら削除)
        }
      } else {
        filterType = 'comp-inc';   // 非強調・同ジョブ: クリック → +1
      }
    }
    return jobChip(it.job, true, it.self, filterType, extraClass);
  }).join('')}</span>`;
}
function buffIconUrl(icon) {
  return icon ? `https://assets.rpglogs.com/img/ff/abilities/${icon}` : '';
}
function reportUrl(code, fightId) {
  if (!code) return '';
  return `https://ja.fflogs.com/reports/${code}?fight=${fightId}&translate=true`;
}
function ownBadge(v) {
  if (v === 'True') return '<span class="badge own">本人</span>';
  if (v === 'False') return '<span class="badge">同席</span>';
  return '';
}

// ===== CSV読み込み =====
function stripBOM(text) {
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') {
        if (field !== '' || row.length) { row.push(field); rows.push(row); }
        row = []; field = '';
      } else if (c === '\r') { /* skip */ }
      else field += c;
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}
function toObjects(rows) {
  const header = rows[0];
  return rows.slice(1).filter(r => r.length === header.length).map(r => {
    const obj = {};
    header.forEach((h, i) => obj[h] = r[i]);
    return obj;
  });
}
function uniqueSorted(rows, key) {
  return Array.from(new Set(rows.map(r => r[key]))).sort();
}
function csvPath(m) {
  return `output/ALL_top100_${m}_by_job_and_synergy.csv`;
}
// "Medicated"(薬品効果)は食事/薬の被ダメ補正であり、ジョブ間シナジーではないため除外。
// 同様に付与元ジョブが特定できない"Unknown"の行も除外する。
function cleanRows(rows, mode) {
  const buffCol = mode === 'taken' ? 'buff_received' : 'buff_given';
  return rows.filter(r => r.job !== 'Unknown' && r[buffCol] !== 'Medicated');
}
async function fetchCsvRows(mode) {
  const res = await fetch(csvPath(mode), { cache: 'no-store' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const text = await res.text();
  return cleanRows(toObjects(parseCSV(stripBOM(text))), mode);
}

// ===== アイコン付きカスタムドロップダウン(複数選択 or 単一選択) =====
function createMultiDropdown(containerId, opts) {
  opts = opts || {};
  const root = document.getElementById(containerId);
  root.innerHTML = `<button type="button" class="dd-btn"><span class="dd-current">すべて</span><span class="dd-arrow">▾</span></button>
    <div class="dd-menu">
      ${opts.roleGroups ? '<div class="dd-rolebar"></div>' : ''}
      ${opts.single ? '' : '<div class="dd-actions"><button type="button" class="dd-clear">すべて解除</button></div>'}
      <div class="dd-list"></div>
    </div>`;
  const dd = {
    values: new Set(),
    items: [],
    roleGroups: opts.roleGroups || null,
    single: !!opts.single,
    withCounts: !!opts.withCounts,
    counts: new Map(),
    maxCount: opts.maxCount || 3,
    root,
    btn: root.querySelector('.dd-btn'),
    menu: root.querySelector('.dd-menu'),
    list: root.querySelector('.dd-list'),
    onChange: () => {},
  };
  dd.btn.addEventListener('click', e => {
    e.stopPropagation();
    document.querySelectorAll('.dd-menu.open').forEach(m => { if (m !== dd.menu) m.classList.remove('open'); });
    dd.menu.classList.toggle('open');
    if (dd.menu.classList.contains('open')) {
      dd.menu.style.top = '100%'; dd.menu.style.bottom = 'auto';
      const rect = dd.menu.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) { dd.menu.style.top = 'auto'; dd.menu.style.bottom = '100%'; }
    }
  });
  dd.menu.addEventListener('click', e => e.stopPropagation());
  const clearBtn = dd.menu.querySelector('.dd-clear');
  if (clearBtn) clearBtn.addEventListener('click', () => {
    dd.values.clear();
    dd.counts.clear();
    updateDropdownUI(dd);
    dd.onChange();
  });
  if (opts.roleGroups) {
    const bar = dd.menu.querySelector('.dd-rolebar');
    bar.innerHTML = opts.roleGroups.map(g => `<button type="button" class="dd-role" data-role="${g.key}">${g.label}</button>`).join('');
    bar.querySelectorAll('.dd-role').forEach(btn => btn.addEventListener('click', () => {
      const group = opts.roleGroups.find(g => g.key === btn.dataset.role);
      const allSelected = group.jobs.every(j => dd.values.has(j));
      group.jobs.forEach(j => {
        if (allSelected) { dd.values.delete(j); dd.counts.delete(j); }
        else { dd.values.add(j); if (dd.withCounts && !dd.counts.has(j)) dd.counts.set(j, 1); }
      });
      updateDropdownUI(dd);
      dd.onChange();
    }));
  }
  return dd;
}
document.addEventListener('click', () => document.querySelectorAll('.dd-menu.open').forEach(m => m.classList.remove('open')));

function fillMultiDropdown(dd, values, iconFn, labelFn) {
  dd.items = values.map(v => ({ value: v, label: labelFn ? labelFn(v) : v, icon: iconFn ? iconFn(v) : '' }));
  const valueSet = new Set(values);
  Array.from(dd.values).forEach(v => { if (!valueSet.has(v)) dd.values.delete(v); });
  if (dd.single && dd.values.size === 0 && dd.items.length) {
    dd.values.add(dd.items[0].value);
  }
  if (dd.single) {
    dd.list.innerHTML = dd.items.map(it => `<div class="dd-item" data-value="${escapeAttr(it.value)}">
      ${it.icon ? `<img src="${it.icon}">` : '<span class="dd-noicon"></span>'}<span>${it.label}</span>
    </div>`).join('');
    dd.list.querySelectorAll('.dd-item').forEach(el => el.addEventListener('click', () => {
      dd.values = new Set([el.dataset.value]);
      updateDropdownUI(dd);
      dd.menu.classList.remove('open');
      dd.onChange();
    }));
  } else {
    dd.list.innerHTML = dd.items.map(it => `<label class="dd-item">
      <input type="checkbox" data-value="${escapeAttr(it.value)}">
      ${it.icon ? `<img src="${it.icon}">` : '<span class="dd-noicon"></span>'}<span>${it.label}</span>
      ${dd.withCounts ? `<button type="button" class="dd-count" data-value="${escapeAttr(it.value)}"></button>` : ''}
    </label>`).join('');
    dd.list.querySelectorAll('input[type=checkbox]').forEach(cb => {
      cb.addEventListener('change', () => {
        const v = cb.dataset.value;
        if (cb.checked) { dd.values.add(v); if (dd.withCounts && !dd.counts.has(v)) dd.counts.set(v, 1); }
        else { dd.values.delete(v); dd.counts.delete(v); }
        updateDropdownUI(dd);
        dd.onChange();
      });
    });
    if (dd.withCounts) {
      dd.list.querySelectorAll('.dd-count').forEach(btn => {
        btn.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();
          const v = btn.dataset.value;
          const cur = dd.counts.get(v) || 1;
          dd.counts.set(v, cur >= dd.maxCount ? 1 : cur + 1);
          updateDropdownUI(dd);
          dd.onChange();
        });
      });
    }
  }
  updateDropdownUI(dd);
}

function updateDropdownUI(dd) {
  if (dd.single) {
    dd.list.querySelectorAll('.dd-item').forEach(el => {
      el.classList.toggle('selected', dd.values.has(el.dataset.value));
    });
  } else {
    dd.list.querySelectorAll('input[type=checkbox]').forEach(cb => {
      cb.checked = dd.values.has(cb.dataset.value);
    });
    if (dd.withCounts) {
      dd.list.querySelectorAll('.dd-count').forEach(btn => {
        const v = btn.dataset.value;
        const checked = dd.values.has(v);
        btn.style.display = checked ? '' : 'none';
        btn.textContent = (dd.counts.get(v) || 1) + '人以上';
      });
    }
  }
  if (dd.roleGroups) {
    dd.menu.querySelectorAll('.dd-role').forEach(btn => {
      const group = dd.roleGroups.find(g => g.key === btn.dataset.role);
      const active = group.jobs.length > 0 && group.jobs.every(j => dd.values.has(j));
      btn.classList.toggle('active', active);
    });
  }
  const cur = dd.btn.querySelector('.dd-current');
  const n = dd.values.size;
  if (n === 0) {
    cur.textContent = 'すべて';
  } else if (n === 1) {
    const v = Array.from(dd.values)[0];
    const it = dd.items.find(x => x.value === v);
    if (it && it.icon) {
      const count = dd.withCounts ? (dd.counts.get(v) || 1) : 1;
      cur.innerHTML = count > 1
        ? Array(count).fill(`<img src="${it.icon}" title="${escapeAttr(it.label)}">`).join('')
        : `<img src="${it.icon}">${it.label}`;
    } else {
      cur.innerHTML = it ? it.label : v;
    }
  } else {
    const sel = dd.items.filter(it => dd.values.has(it.value));
    if (sel.some(it => it.icon)) {
      if (dd.roleGroups) {
        // ロール内の全ジョブが選択済みならロール名バッジで集約し、残りはアイコン表示
        const covered = new Set();
        const parts = [];
        for (const rg of dd.roleGroups) {
          const inItems = rg.jobs.filter(j => dd.items.some(it => it.value === j));
          if (inItems.length > 0 && inItems.every(j => dd.values.has(j))) {
            parts.push(`<span class="dd-role-badge">${rg.label}</span>`);
            inItems.forEach(j => covered.add(j));
          }
        }
        const remaining = sel.filter(it => !covered.has(it.value));
        cur.innerHTML = parts.join('') + remaining.map(it => `<img src="${it.icon}" title="${escapeAttr(it.label)}">`).join('');
      } else {
        // アイコンあり: countぶん繰り返して表示
        cur.innerHTML = sel.map(it => {
          const count = dd.withCounts ? (dd.counts.get(it.value) || 1) : 1;
          const img = `<img src="${it.icon}" title="${escapeAttr(it.label)}">`;
          return Array(count).fill(img).join('');
        }).join('');
      }
    } else {
      // アイコンなし: ラベルを並べて表示
      cur.textContent = sel.map(it => it.label).join(' · ');
    }
  }
}
function setDropdownToSingle(dd, value) {
  dd.values = new Set([value]);
  updateDropdownUI(dd);
}

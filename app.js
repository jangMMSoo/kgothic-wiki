// 벽사록 — 게임 데이터 위키. wiki_data.js(window.WIKI_DATA)를 읽어 그린다. 빌드 도구 없이 파일 셋으로 돈다.
"use strict";
const D = window.WIKI_DATA || {};
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (n, d = 2) => {
  if (n === null || n === undefined || n === "") return "—";
  if (typeof n !== "number") return esc(n);
  const r = Math.round(n * 10 ** d) / 10 ** d;
  return String(r);
};
const pct = (x) => (x >= 0 ? "+" : "") + Math.round(x * 100) + "%";
const mult = (x) => "x" + fmt(x);
const RARITY = ["예사", "신령", "신내림"];
const KO = {
  Chase: "추격", Flee: "달아남", Hoard: "혼불 삼킴", "Light Shy": "빛 가장자리", Orbit: "맴돌기", Scavenge: "혼불 먹기",
  Bolt: "탄 — 옆으로 비킨다", Chant: "영창 — 원 밖으로 / 끊기", Cone: "부채꼴 — 옆이나 뒤로", Ground: "장판 — 표식 밖으로", Lunge: "돌진 — 옆으로",
  Mirror: "업경 — 고개를 돌린다", Summon: "부르기", Tether: "줄 — 선에서 비킨다",
  "Level Cap": "레벨 상한", "Lift Penalty": "불이익 지움", "Replace Stat": "스탯 치환", "Scale Values": "수치 배수", Ward: "상극 지움", "Weapon Trait": "무기 특성",
  "Attack Tempo": "공격 쉼", "Cast Tempo": "전조", "Enemy Count": "물량", "Enemy Hp": "귀신 체력", "Lantern Fuel": "기름", "Lantern Light": "등불 밝기",
  Auto: "자동", Manual: "반자동", Special: "특수기",
};
const ko = (v) => KO[v] || v;
const RARITY_CLASS = ["blue", "violet", "red"];

// --- 색인 ---
const IDX = {};
for (const k of Object.keys(D)) if (Array.isArray(D[k])) { IDX[k] = {}; for (const r of D[k]) if (r && r.id) IDX[k][r.id] = r; }
const REF_CAT = {
  SkillDefinition: "skills", EnemyDefinition: "enemies", WeaponDefinition: "weapons", MutationDefinition: "mutations",
  BigiDefinition: "bigi", CharacterDefinition: "characters", StageDefinition: "stages", DeityDefinition: "deities",
  JewelDefinition: "jewels", HapsinDefinition: "hapsin", EvolutionRecipe: "evolutions",
};
const get = (cat, id) => (IDX[cat] || {})[id];

// 귀신이 어디 나오는가 — 막의 방 웨이브 · 보스 · 저승 층.
const APPEARS = {};
const addAppear = (id, where) => { if (!id) return; (APPEARS[id] = APPEARS[id] || []); if (!APPEARS[id].some((w) => w.text === where.text)) APPEARS[id].push(where); };
for (const s of D.stages || []) {
  (s.rooms || []).forEach((room, i) => {
    for (const e of (room.wave && room.wave.entries) || []) if (e.enemy) addAppear(e.enemy.ref, { text: `막 ${s.act_number} 「${s.display_name_ko}」 · ${room.is_boss_room ? "보스 방" : "방 " + (i + 1)}`, href: `#/c/stages/${s.id}` });
  });
  addAppear(s.final_boss_id, { text: `막 ${s.act_number} 「${s.display_name_ko}」 보스`, href: `#/c/stages/${s.id}` });
}
const UW = D.underworld || {};
(UW.floor_native_entries || []).forEach((e, i) => e && e.enemy && addAppear(e.enemy.ref, { text: `저승 ${i + 1}층 「${(UW.floor_names_ko || [])[i] || ""}」`, href: "#/underworld" }));
(UW.floor_hungry_entries || []).forEach((e, i) => e && e.enemy && addAppear(e.enemy.ref, { text: `저승 ${i + 1}층 「${(UW.floor_names_ko || [])[i] || ""}」`, href: "#/underworld" }));
(UW.floor_boss_ids || []).forEach((id, i) => id && addAppear(id, { text: `저승 ${i + 1}층 주인`, href: "#/underworld" }));
for (const p of UW.floor_boss_pools || []) for (const id of p.enemy_ids || []) addAppear(id, { text: `저승 ${p.floor_index + 1}층 주인 후보`, href: "#/underworld" });
const BESTIARY_OF = {};
for (const b of D.bestiary || []) for (const id of b.enemy_ids || []) BESTIARY_OF[id] = b;

// 스킬을 누가 쓰나.
const USED_BY = {};
const addUse = (skill, text, href) => { if (!skill || !skill.ref) return; (USED_BY[skill.ref] = USED_BY[skill.ref] || []).push({ text, href }); };
for (const w of D.weapons || []) { addUse(w.skill, `무기 「${w.display_name_ko}」 기본 공격`, `#/c/weapons/${w.id}`); addUse(w.special_skill, `무기 「${w.display_name_ko}」 특수기`, `#/c/weapons/${w.id}`); }
for (const e of D.evolutions || []) addUse(e.result_skill, `진화 「${e.display_name_ko}」`, `#/c/evolutions/${e.id}`);
for (const b of D.bigi || []) { addUse(b.skill, `패시브 「${b.display_name_ko}」`, `#/c/bigi/${b.id}`); addUse(b.follow_skill, `패시브 「${b.display_name_ko}」`, `#/c/bigi/${b.id}`); }
for (const m of D.mutations || []) addUse(m.act_skill, `변형 「${m.display_name_ko}」`, `#/c/mutations/${m.id}`);
for (const c of D.characters || []) { addUse(c.dash_slash_skill, `캐릭터 「${c.display_name_ko}」 특성`, `#/c/characters/${c.id}`); addUse(c.orbit_touch_skill, `캐릭터 「${c.display_name_ko}」 특성`, `#/c/characters/${c.id}`); addUse(c.orbit_burst_skill, `캐릭터 「${c.display_name_ko}」 특성`, `#/c/characters/${c.id}`); }
for (const d of D.deities || []) { addUse(d.ward_skill, `신령 「${d.display_name_ko}」 가호`, `#/c/deities/${d.id}`); addUse(d.ward_break_skill, `신령 「${d.display_name_ko}」 가호`, `#/c/deities/${d.id}`); }
for (const s of D.skills || []) for (const k of ["chain_skill", "impact_skill"]) addUse(s[k], `기술 「${s.display_name_ko}」`, `#/c/skills/${s.id}`);

// --- 조각 ---
const link = (ref) => {
  if (!ref) return "—";
  if (typeof ref === "string") return esc(ref);
  const cat = REF_CAT[ref.type];
  const name = ref.name || (get(cat, ref.ref) || {}).display_name_ko || ref.ref;
  return cat && get(cat, ref.ref) ? `<a href="#/c/${cat}/${esc(ref.ref)}">${esc(name)}</a>` : esc(name);
};
const linkId = (cat, id) => { const r = get(cat, id); return r ? `<a href="#/c/${cat}/${esc(id)}">${esc(r.display_name_ko || id)}</a>` : esc(id || "—"); };
const img = (src, cls = "") => (src ? `<img src="${esc(src)}" class="${cls}" loading="lazy" alt="">` : "");
const stat = (label, value) => `<div class="stat"><i>${esc(label)}</i><b>${value}</b></div>`;
const badge = (text, cls = "") => (text ? `<span class="badge ${cls}">${esc(text)}</span>` : "");
const paper = (text, prose = false) => (text ? `<div class="paper${prose ? " prose" : ""}">${prose ? text : esc(text)}</div>` : "");
const lines = (arr) => (arr && arr.length ? `<ul class="lines">${arr.map((l) => typeof l === "string" ? `<li>${esc(l)}</li>` : `<li class="${l.sign < 0 || l.bad ? "bad" : "good"}">${esc(l.text)}</li>`).join("")}</ul>` : "");
const modLines = (mods) => lines((mods || []).map((m) => ({ text: m.text, bad: m.bad, sign: m.bad ? -1 : 1 })));
const raw = (row) => `<details class="raw"><summary>원본 데이터 (JSON)</summary><pre>${esc(JSON.stringify(row, null, 2))}</pre></details>`;
const thumbOf = (row) => row.portrait || row.icon || (row._type === "WeaponDefinition" && get("skills", row.skill && row.skill.ref) || {}).icon || "";
const initial = (name) => esc((name || "?").slice(0, 1));
const usedList = (arr) => (arr && arr.length ? `<ul class="lines">${arr.map((u) => `<li><a href="${u.href}">${esc(u.text)}</a></li>`).join("")}</ul>` : "<p class='lead'>—</p>");

function card(cat, row, sub = "", tags = []) {
  const t = thumbOf(row);
  const pix = t && t.endsWith(".png");
  return `<a class="card${row.on_hold ? " held" : ""}" href="#/c/${cat}/${esc(row.id)}">
    <div class="thumb">${t ? img(t, pix ? "pix" : "") : initial(row.display_name_ko)}</div>
    <div><b>${esc(row.display_name_ko || row.id)}</b>${tags.map((x) => `<span class="tag">${esc(x)}</span>`).join("")}<small>${esc(sub)}</small></div></a>`;
}

// --- 갈래 ---
const enemyRank = (e) => (e.is_unique ? "보스" : e.is_elite ? "정예" : "잡귀");
const weaponOf = (id) => get("weapons", id);
const CATS = {
  weapons: { title: "무기", group: "전투", desc: "로비에서 하나를 골라 그 판 내내 그 무기로만 싸운다. 리듬 · 등불과의 관계 · 특수기 · 대시 연계가 무기마다 다르다.",
    sub: (r) => r.tagline_ko, tags: (r) => [r.rhythm_ko] },
  characters: { title: "캐릭터", group: "전투", desc: "체력 · 걸음 · 대시와 고유 능력이 다르다.", sub: (r) => r.description_ko, tags: (r) => [] },
  skills: { title: "기술", group: "전투", desc: "무기의 기본 공격 · 특수기 · 진화 · 패시브와 신령이 쓰는 기술. 레벨별 수치.", sub: (r) => r.description_ko, tags: (r) => [r.cast_kind === "Area Burst" ? "광역" : "투사체", r.substance === "Spirit" ? "영(靈)" : "물(物)"] },
  evolutions: { title: "진화", group: "전투", desc: "무기에 사방신이 깃드는 순간. 촉매 변형 하나 또는 주무기 레벨로 연다.", sub: (r) => `${(r.base_skill || {}).name || ""} → ${(r.result_skill || {}).name || ""}`, tags: () => [] },
  bigi: { title: "패시브", group: "카드", desc: "방 보상 카드 — \"이럴 때 → 이런 일\". 등급은 방 성적이 정한다. 흐린 것은 보류(지금 안 뜸).",
    sub: (r) => `${r.trigger_ko}${r.condition_ko ? " · " + r.condition_ko : ""}`, tags: (r) => [RARITY[r.rarity] || ""],
    filters: [{ label: "등급", values: [["전체", null], ["예사", 0], ["신령", 1], ["신내림", 2]], test: (r, v) => r.rarity === v }] },
  mutations: { title: "변형", group: "카드", desc: "무기의 동작 하나를 바꾸는 카드. 칸(평타 · 특수기 · 대시 · 등불)마다 하나, 판당 둘.",
    sub: (r) => `${r.when_ko} → ${r.what_ko}`, tags: (r) => [(weaponOf(r.weapon_id) || {}).display_name_ko || "", r.slot_ko],
    filters: [{ label: "무기", values: [["전체", null], ...(D.weapons || []).map((w) => [w.display_name_ko, w.id])], test: (r, v) => r.weapon_id === v }] },
  enemies: { title: "귀신", group: "적", desc: "막과 저승에 나오는 귀신. 잡귀는 기준선, 정예와 보스는 전조가 있는 수를 쓴다.",
    sub: (r) => `체력 ${fmt(r.max_hp)} · 걸음 ${fmt(r.move_speed)}${(r.attack_pattern ? " · " + r.attack_pattern.display_name_ko : "")}`, tags: (r) => [enemyRank(r)],
    filters: [{ label: "계급", values: [["전체", null], ["잡귀", "잡귀"], ["정예", "정예"], ["보스", "보스"]], test: (r, v) => enemyRank(r) === v }],
    sort: (a, b) => (a.is_unique - b.is_unique) || (a.is_elite - b.is_elite) || a.display_name_ko.localeCompare(b.display_name_ko, "ko") },
  stages: { title: "막", group: "판", desc: "한 판 = 막 하나(방 3 + 보스). 앞 막의 보스를 잡으면 다음 막이 열린다.", sub: (r) => r.tagline_ko, tags: (r) => ["막 " + r.act_number],
    sort: (a, b) => a.act_number - b.act_number, thumb: (r) => (get("enemies", r.final_boss_id) || {}).portrait },
  pacts: { title: "저주", group: "판", desc: "판을 시작하기 전에 스스로 켜는 불리한 조건. 켠 수가 보스 노리개의 등급 상한을 연다.", sub: (r) => r.axis_ko, tags: () => [] },
  preps: { title: "시작 아이템", group: "판", desc: "판을 시작할 때 혼을 내고 그 판에만 쓴다.", sub: (r) => `${r.description_ko} · 혼 ${r.soul_cost}`, tags: () => [] },
  meta_upgrades: { title: "영구 강화", group: "성장", desc: "혼으로 사는 판 밖 강화.", sub: (r) => `최대 Lv${r.max_level} · 혼 ${(r.costs || []).join(" / ")}`, tags: () => [] },
  jewels: { title: "노리개 (유니크)", group: "성장", desc: "보스가 떨구는 판 밖 전리품. 하(下)는 수치, 중(中)은 치환, 상(上)은 무기가 하는 일을 바꾼다.",
    sub: (r) => r.description_ko, tags: (r) => [r.tier_ko ? r.tier_ko + "(" + { "하": "下", "중": "中", "상": "上" }[r.tier_ko] + ")" : ""],
    filters: [{ label: "등급", values: [["전체", null], ["하", "하"], ["중", "중"], ["상", "상"]], test: (r, v) => r.tier_ko === v }] },
  deities: { title: "신령", group: "엔드게임", desc: "몸주신 신단의 다섯 자리(오방)에 앉히는 신령. 자리가 \"이럴 때\"를, 신령이 \"이런 일\"을 정한다.", sub: (r) => r.lore_ko, tags: (r) => [r.obang_ko.split(" ")[0]] },
  hapsin: { title: "합신", group: "엔드게임", desc: "두 신령을 이웃 자리에 앉히면 깨어나는 셋째 일.", sub: (r) => r.rule_ko, tags: () => [] },
};
const PAGES = [
  { href: "#/tree", title: "특성 트리", group: "성장", count: () => ((D.tree || {}).nodes || []).length },
  { href: "#/jewel-affixes", title: "노리개 접사", group: "성장", count: () => (D.jewel_affixes || []).length },
  { href: "#/underworld", title: "저승", group: "엔드게임", count: () => (UW.floor_names_ko || []).length + "층" },
  { href: "#/uber", title: "우버 · 저주패", group: "엔드게임", count: () => "" },
];
const GROUPS = ["전투", "카드", "적", "판", "성장", "엔드게임"];

// --- 옆 메뉴 ---
function renderSide(active) {
  let h = `<a href="#/" class="${active === "home" ? "on" : ""}">처음</a>`;
  for (const g of GROUPS) {
    h += `<h4>${g}</h4>`;
    for (const [k, c] of Object.entries(CATS)) if (c.group === g) h += `<a href="#/c/${k}" class="${active === k ? "on" : ""}">${c.title}<span>${(D[k] || []).length}</span></a>`;
    for (const p of PAGES) if (p.group === g) h += `<a href="${p.href}" class="${active === p.href ? "on" : ""}">${p.title}<span>${p.count()}</span></a>`;
  }
  $("#side").innerHTML = h;
}

// --- 첫 화면 ---
function home() {
  let tiles = "";
  for (const [k, c] of Object.entries(CATS)) tiles += `<a class="tile" href="#/c/${k}"><span class="n">${(D[k] || []).length}</span><b>${c.title}</b><small>${esc(c.desc.split(".")[0])}</small></a>`;
  for (const p of PAGES) tiles += `<a class="tile" href="${p.href}"><span class="n">${p.count()}</span><b>${p.title}</b><small>${p.group}</small></a>`;
  return `<section class="hero"><h1>벽사록 辟邪錄</h1>
    <p>1인칭 공포 서바이벌 <b>벽사 (K-Gothic Survivors)</b>의 데이터 위키입니다. 부적을 붙인 샷건으로 창귀 · 처녀귀신 · 총각귀신을 사냥하는 일제강점기 × 서부 퓨전 서바이벌 액션.</p>
    <p>무기 · 귀신 · 카드 · 특성 트리 · 신령 · 저승까지 한곳에 모았습니다.</p></section>
    <div class="tiles">${tiles}</div>`;
}

// --- 목록 ---
const filterState = {};
function list(cat) {
  const c = CATS[cat];
  let rows = (D[cat] || []).slice();
  if (c.sort) rows.sort(c.sort);
  const fs = filterState[cat] || (filterState[cat] = {});
  let fh = "";
  (c.filters || []).forEach((f, fi) => {
    fh += `<div class="filters">` + f.values.map(([label, v]) => `<span class="chip${fs[fi] === v || (fs[fi] === undefined && v === null) ? " on" : ""}" data-f="${fi}" data-v='${JSON.stringify(v)}'>${esc(label)}</span>`).join("") + `</div>`;
    if (fs[fi] !== undefined && fs[fi] !== null) rows = rows.filter((r) => f.test(r, fs[fi]));
  });
  const cards = rows.map((r) => {
    const t = c.thumb ? { ...r, portrait: c.thumb(r) } : r;
    return card(cat, t, c.sub(r) || "", (c.tags(r) || []).filter(Boolean));
  }).join("");
  return `<div class="crumbs"><a href="#/">처음</a> › ${c.title}</div><h1>${c.title}</h1><p class="lead">${esc(c.desc)}</p>${fh}<div class="grid">${cards}</div>`;
}
document.addEventListener("click", (ev) => {
  const chip = ev.target.closest(".chip[data-f]");
  if (!chip) return;
  const cat = location.hash.split("/")[2];
  filterState[cat][chip.dataset.f] = JSON.parse(chip.dataset.v);
  route();
});

// --- 상세 ---
function head(cat, row, portrait, badges, sub = "") {
  const pix = portrait && portrait.endsWith(".png");
  return `<div class="crumbs"><a href="#/">처음</a> › <a href="#/c/${cat}">${CATS[cat].title}</a> › ${esc(row.display_name_ko)}</div>
    <div class="detail-head">${portrait ? `<div class="portrait${pix ? " icon" : ""}">${img(portrait)}</div>` : ""}
    <div class="head-text"><h1>${esc(row.display_name_ko || row.id)}</h1>${row.display_name_en ? `<div class="subname">${esc(row.display_name_en)}</div>` : sub ? `<div class="subname">${esc(sub)}</div>` : ""}
    <div class="badges">${badges.join("")}</div>`;
}

function skillTable(sk) {
  const lv = sk.levels || [];
  if (!lv.length) return "";
  const cols = [["damage", "위력"], ["cooldown_sec", "쿨다운(초)"], ["projectile_count", "발수"], ["pierce", "관통"], ["spread_deg", "확산(°)"],
    ["burst_radius", "반경(m)"], ["projectile_speed", "탄속"], ["knockback", "넉백"], ["falloff_start_m", "감쇠 시작(m)"], ["falloff_end_m", "감쇠 끝(m)"], ["duration_sec", "지속(초)"]];
  const used = cols.filter(([k]) => { const vals = lv.map((l) => l[k]); return vals.some((v) => v !== vals[0]) || (vals[0] && vals[0] !== 0 && vals[0] < 900); });
  return `<div class="scroll-x"><table class="t"><tr><th>Lv</th>${used.map(([, n]) => `<th>${n}</th>`).join("")}<th>강화</th></tr>` +
    lv.map((l, i) => `<tr><td>${i + 1}</td>${used.map(([k]) => `<td class="num">${l[k] >= 900 ? "—" : fmt(l[k])}</td>`).join("")}<td>${esc(l.upgrade_text_ko || "")}</td></tr>`).join("") + `</table></div>`;
}

function patternBlock(p, label = "") {
  if (!p) return "";
  const meta = [];
  meta.push(`전조 ${fmt(p.telegraph_sec)}초`);
  if (p.damage) meta.push(`피해 ${fmt(p.damage)}`);
  if (p.cooldown_sec) meta.push(`쉼 ${fmt(p.cooldown_sec)}초`);
  if (p.recovery_sec) meta.push(`빈틈 ${fmt(p.recovery_sec)}초`);
  if (p.range_m) meta.push(`사거리 ${fmt(p.range_m)}m`);
  if (p.kind) meta.push(ko(p.kind));
  let h = `<div class="pattern" style="--mark:${esc(p.mark_color || "#c8432b")}"><b>${esc(p.display_name_ko || p.id)}</b> ${label ? badge(label, "gold") : ""}
    <div>${esc(p.hint_ko || "")}</div><div class="meta">${meta.join(" · ")}</div></div>`;
  if (p.combo_next) h += patternBlock(p.combo_next, "연타");
  return h;
}

const DETAIL = {
  weapons(r) {
    const sk = get("skills", (r.skill || {}).ref);
    const evo = (D.evolutions || []).find((e) => e.base_skill && r.skill && e.base_skill.ref === r.skill.ref);
    const muts = (D.mutations || []).filter((m) => m.weapon_id === r.id);
    const unlock = (D.stages || []).find((s) => s.clear_reward_weapon_id === r.id);
    const weak = (D.stages || []).filter((s) => s.weak_weapon_id === r.id);
    return head("weapons", r, r.portrait, [badge("리듬 · " + r.rhythm_ko, "gold"), badge("등불 · " + (r.lantern_ko || [])[0], "blue"), unlock ? badge(`막 ${unlock.act_number} 첫 클리어로 해금`) : r.unlocked_by_default ? badge("처음부터") : ""]) +
      `<p class="lead">${esc(r.description_ko || r.tagline_ko)}</p></div></div>
      <div class="stats">${stat("기본 공격", link(r.skill))}${stat("특수기", link(r.special_skill))}${stat("특수기 쿨다운", fmt(r.special_cooldown_sec) + "초")}${stat("결정타", esc(r.strike_name_ko || "—"))}</div>
      <h2>설명</h2>${paper(r.help_ko)}
      <h2>신단 · 결정타와 깃듦</h2>${lines([`결정타 「${r.strike_name_ko}」 — ${r.strike_line_ko}`, `신령이 깃든다 — ${r.imbue_line_ko}`])}
      ${sk ? `<h2>기본 공격 「${esc(sk.display_name_ko)}」 레벨별</h2>${skillTable(sk)}` : ""}
      ${evo ? `<h2>진화</h2><p>${link(evo.result_skill)} — 촉매 ${(evo.required_mutations || []).map(link).join(", ") || "없음"} 또는 주무기 Lv${evo.free_base_level}. <a href="#/c/evolutions/${evo.id}">자세히</a></p>` : ""}
      ${weak.length ? `<h2>상극 막</h2>${lines(weak.map((s) => `막 ${s.act_number} 「${s.display_name_ko}」 — ${s.weak_note_ko}`))}` : ""}
      <h2>변형 카드 (${muts.length})</h2><div class="grid">${muts.map((m) => card("mutations", m, `${m.when_ko} → ${m.what_ko}`, [m.slot_ko, m.mastery_rank ? "숙련 " + m.mastery_rank : ""].filter(Boolean))).join("")}</div>
      <h2>숙련</h2><p class="lead">판이 끝나면 처치 + 클리어 보너스(${r.mastery_clear_bonus})가 쌓인다. 단계 문턱 ${(r.mastery_xp || []).join(" · ")} — 단계마다 그 무기 전용 변형이 풀린다.</p>` + raw(r);
  },
  characters(r) {
    return head("characters", r, r.portrait, [r.unlocked_by_default ? badge("처음부터") : badge("막 첫 클리어로 해금"), ...(r.trait_names_ko || []).map((t) => badge(t, "gold"))]) +
      `<p class="lead">${esc(r.description_ko)}</p></div></div>
      <div class="stats">${stat("체력", fmt(r.base_max_hp))}${stat("걸음", fmt(r.base_move_speed))}${stat("혼불 끌어오는 거리", fmt(r.base_pickup_radius) + "m")}${stat("대시 쿨다운", fmt(r.dash_cooldown_sec) + "초")}${stat("치명타 배율", mult(r.base_crit_multiplier))}${stat("시작 기술", link(r.starting_skill))}</div>
      <h2>고유 능력</h2>${(r.trait_names_ko || []).map((n, i) => `<h3>${esc(n)}</h3><p>${esc((r.trait_lines_ko || [])[i] || "")}</p>`).join("")}
      ${r.fuel_drain_mult && r.fuel_drain_mult !== 1 ? `<p class="lead">대가 — 켜 둔 등불 기름 ${mult(r.fuel_drain_mult)}</p>` : ""}
      <h2>이야기 — ${esc(r.story_title_ko || "")}</h2>${paper(r.story_ko)}
      ${r.act_entry_ko && r.act_entry_ko.length ? `<h3>막에 들어설 때</h3>${lines(r.act_entry_ko.map((l, i) => `막 ${i + 1} — ${l}`))}` : ""}
      ${r.boss_encounter_ko && r.boss_encounter_ko.length ? `<h3>보스 앞에서</h3>${lines(r.boss_encounter_ko.map((l, i) => `막 ${i + 1} — ${l}`))}` : ""}
      ${r.epilogue_ko ? `<h3>끝맺음</h3>${paper(r.epilogue_ko)}` : ""}
      <h2>특성 트리 시작점 곁</h2>${modLines(r.tree_start_minors)}` + raw(r);
  },
  skills(r) {
    return head("skills", r, r.icon, [badge(r.cast_kind === "Area Burst" ? "광역" : "투사체", "gold"), badge(r.substance === "Spirit" ? "영(靈) — 담장을 지나간다" : "물(物) — 담장에 막힌다", "blue"), r.iron ? badge("쇠") : "", badge(ko(r.trigger_mode))]) +
      `<p class="lead">${esc(r.description_ko)}</p></div></div>
      <div class="stats">${r.strong_damage_mult && r.strong_damage_mult !== 1 ? stat("정예 · 보스에게", mult(r.strong_damage_mult)) : ""}${r.chain_skill ? stat("튀는 번개", link(r.chain_skill) + ` ×${r.chain_count}`) : ""}${r.impact_skill ? stat("꽂힌 자리", link(r.impact_skill)) : ""}${r.volley_repeats ? stat("박 수", r.volley_repeats + 1) : ""}${r.burst_hold_sec ? stat("붙듦", fmt(r.burst_hold_sec) + "초") : ""}</div>
      <h2>레벨별</h2>${skillTable(r)}<h2>쓰는 곳</h2>${usedList(USED_BY[r.id])}` + raw(r);
  },
  evolutions(r) {
    return head("evolutions", r, (get("skills", (r.result_skill || {}).ref) || {}).icon, [badge("진화", "gold")]) + `</div></div>
      <div class="stats">${stat("바탕", link(r.base_skill))}${stat("결과", link(r.result_skill))}${stat("촉매", (r.required_mutations || []).map(link).join(", ") || "—")}${stat("촉매 없이", r.free_base_level ? "주무기 Lv" + r.free_base_level : "—")}</div>
      <p class="lead">그 무기의 촉매 변형 하나를 받으면(레벨 무관) 또는 촉매 없이 주무기가 Lv${r.free_base_level}에 닿으면 다음 보상에 진화 카드가 뜬다.</p>
      ${get("skills", (r.result_skill || {}).ref) ? `<h2>결과 기술</h2><p>${esc(get("skills", r.result_skill.ref).description_ko)}</p>${skillTable(get("skills", r.result_skill.ref))}` : ""}` + raw(r);
  },
  bigi(r) {
    const deity = (D.deities || []).find((d) => d.bigi && d.bigi.ref === r.id);
    const hap = (D.hapsin || []).find((h) => h.bigi && h.bigi.ref === r.id);
    return head("bigi", r, "", [badge(RARITY[r.rarity] || "", RARITY_CLASS[r.rarity]), r.on_hold ? badge("보류 — 지금 보상에 안 뜸", "red") : "", deity ? badge("신령의 일") : "", hap ? badge("합신의 일") : ""]) +
      `<p class="lead">${esc(r.description_ko)}</p></div></div>
      <div class="stats">${stat("언제", esc(r.trigger_ko))}${r.condition_ko ? stat("조건", esc(r.condition_ko)) : ""}${r.cooldown_sec ? stat("쿨다운", fmt(r.cooldown_sec) + "초") : ""}${r.skill ? stat("기술", link(r.skill)) : ""}</div>
      <h2>하는 일</h2>${lines(r.lines_ko)}
      ${deity ? `<p>신령 ${linkId("deities", deity.id)}의 일이다.</p>` : ""}${hap ? `<p>합신 ${linkId("hapsin", hap.id)}의 일이다.</p>` : ""}` + raw(r);
  },
  mutations(r) {
    const evo = (D.evolutions || []).find((e) => (e.required_mutations || []).some((m) => m.ref === r.id));
    return head("mutations", r, "", [badge((weaponOf(r.weapon_id) || {}).display_name_ko, "gold"), badge("칸 · " + r.slot_ko, "blue"), r.mastery_rank ? badge("숙련 " + r.mastery_rank, "violet") : "", evo ? badge("진화의 촉매", "red") : "", r.on_hold ? badge("보류 — 지금 보상에 안 뜸", "red") : ""]) +
      `<p class="lead">${esc(r.description_ko)}</p></div></div>
      <div class="paper prose"><b>${esc(r.when_ko)}</b> → ${esc(r.what_ko)}</div>
      <div class="stats">${stat("무기", linkId("weapons", r.weapon_id))}${r.act_skill ? stat("기술", link(r.act_skill)) : ""}${r.act_cooldown_sec ? stat("쿨다운", fmt(r.act_cooldown_sec) + "초") : ""}</div>
      ${(r.modifiers || []).length ? `<h2>수치</h2>${modLines(r.modifiers)}` : ""}
      ${evo ? `<h2>진화</h2><p>이 카드를 받으면 ${link(evo.result_skill)}(으)로 진화할 수 있다. <a href="#/c/evolutions/${evo.id}">자세히</a></p>` : ""}` + raw(r);
  },
  enemies(r) {
    const b = BESTIARY_OF[r.id];
    const rules = [];
    if (r.eats_iron) rules.push(`쇠를 먹는다 — 산탄 · 사인검 같은 쇠로 맞으면 ${pct(r.iron_damage_scale - 1)} 피해만 들고 커진다`);
    if (r.devour_growth) rules.push(`바닥의 혼불을 먹을수록 커진다`);
    if (r.movement_kind === "Scavenge") rules.push(`바닥의 혼불을 먼저 먹으러 간다 — 먹힌 혼불은 기름도 혼도 안 준다`);
    if (r.movement_kind === "Hoard") rules.push(`멀면 혼불을 삼키고 가까우면 달아난다 — 베면 삼킨 것 + ${r.hoard_bonus} 을 쏟는다`);
    if (r.movement_kind === "Flee") rules.push(`달아난다 — ${fmt(r.flee_escape_sec)}초 안에 못 베면 빠져나가고 방 성적이 깎인다`);
    if (r.shroud_lit_m) rules.push(`등불 안에서만 보인다 — 켜면 ${fmt(r.shroud_lit_m)}m · 끄면 ${fmt(r.shroud_dark_m)}m`);
    if (r.reveals_into) rules.push(`둔갑해 있다 — 맞거나 켠 등불로 ${fmt(r.reveal_light_m)}m 안을 비추면 ${linkId("enemies", r.reveals_into)}(으)로 드러난다`);
    if (r.leads_id) rules.push(`베면 둘레 ${fmt(r.scatter_radius_m)}m 의 ${linkId("enemies", r.leads_id)}가 ${fmt(r.scatter_sec)}초 흩어진다`);
    if (r.plague_on_contact) rules.push(`닿으면 역병 ${r.plague_on_contact}겹`);
    if (r.gaze_growth) rules.push(`마주 보면 커지고 내려다보면 줄어든다 — 다 크면 ${fmt(r.gaze_crush_radius_m)}m 안을 깔아 뭉갠다`);
    if (r.heads) rules.push(`머리 ${r.heads}개 — 체력이 깎일 때마다 막 쓴 수의 머리가 떨어진다. ${fmt(r.head_regrow_sec)}초 안에 밟지 않으면 도로 붙는다`);
    if ((r.judge_names || []).length) rules.push(`열 왕이 차례로 앉는다 — ${r.judge_names.join(" · ")}`);
    if (r.shield_wall_min) rules.push(`창벽 — ${r.shield_wall_min}마리 이상 모이면 정면 ${fmt(r.shield_wall_half_deg)}° 에서 오는 탄을 막는다`);
    if (r.lured_by_food) rules.push(`떡 · 체에 홀린다 — 보스라도 하던 수를 끊는다`);
    if (r.lifts_plague) rules.push(`쓰러지면 역병이 걷힌다`);
    if (r.bane_weapon_id) rules.push(`${linkId("weapons", r.bane_weapon_id)}에 약하다 (${mult(r.bane_damage_mult)})`);
    if (r.opening_damage_mult > 1) rules.push(`빈틈에 ${mult(r.opening_damage_mult)} 로 맞는다`);
    if (r.phase_two_hp_ratio) rules.push(`체력 ${Math.round(r.phase_two_hp_ratio * 100)}% 아래로 2단계`);
    const pats = [r.attack_pattern, ...(r.extra_patterns || [])].filter(Boolean);
    return head("enemies", r, r.portrait, [badge(enemyRank(r), r.is_unique ? "red" : r.is_elite ? "violet" : ""), b ? badge(b.rank_ko) : "", badge(ko(r.movement_kind))]) +
      `${b ? `<p class="lead">${esc(b.lore_ko)}</p>` : ""}</div></div>
      <div class="stats">${stat("체력", fmt(r.max_hp))}${stat("걸음", fmt(r.move_speed))}${stat("닿으면", fmt(r.contact_damage))}${stat("혼", r.soul_drop_amount)}${stat("방 성적 무게", r.score_weight)}${r.attack_tempo !== 1 ? stat("공격 박자", mult(r.attack_tempo)) : ""}</div>
      ${rules.length ? `<h2>규칙</h2><ul class="lines">${rules.map((x) => `<li>${x}</li>`).join("")}</ul>` : ""}
      ${pats.length ? `<h2>수</h2>${pats.map((p) => patternBlock(p)).join("")}` : ""}
      ${(r.phase_two_patterns || []).length ? `<h2>2단계에 붙는 수</h2>${r.phase_two_patterns.map((p) => patternBlock(p, "2단계")).join("")}` : ""}
      ${b ? `<h2>도감</h2><div class="paper">출전 — ${esc(b.source_ko)}\n\n과제 — ${b.kill_goal}마리 베기 · 등불을 끈 채 ${b.dark_goal}마리 베기</div>` : ""}
      <h2>나오는 곳</h2>${usedList(APPEARS[r.id])}` + raw(r);
  },
  stages(r) {
    const boss = get("enemies", r.final_boss_id);
    const rooms = (r.rooms || []).map((room, i) => {
      const ens = [...new Set(((room.wave || {}).entries || []).map((e) => e.enemy && e.enemy.ref).filter(Boolean))];
      const goals = [room.allow_purge && room.purge_kills ? `전멸 ${room.purge_kills}` : "", room.allow_kindle && room.brazier_count ? `등불 ${room.brazier_count}` : "", room.patjuk_gates ? `팥죽 ${room.patjuk_gates}그릇` : "", room.cairn_stones ? `돌무더기 ${room.cairn_stones}` : "", room.is_boss_room ? "보스" : ""].filter(Boolean).join(" · ");
      return `<tr><td>${room.is_boss_room ? "보스" : i + 1}</td><td>${esc(room.display_name_ko)}</td><td>${goals}</td><td class="num">${room.time_limit_sec ? fmt(room.time_limit_sec) + "초" : "무제한"}</td><td class="num">${room.soul_budget}</td><td>${ens.map((id) => linkId("enemies", id)).join(", ")}</td></tr>`;
    }).join("");
    const extras = [];
    if (r.weak_weapon_id) extras.push(`상극 — ${linkId("weapons", r.weak_weapon_id)}: ${esc(r.weak_note_ko)}`);
    if (r.clear_reward_weapon_id) extras.push(`첫 클리어 — 무기 ${linkId("weapons", r.clear_reward_weapon_id)}`);
    if (r.clear_reward_character_id) extras.push(`첫 클리어 — 캐릭터 ${linkId("characters", r.clear_reward_character_id)}`);
    if (r.fuel_drain_mult !== 1) extras.push(`불이 귀하다 — 켜 둔 등불 기름 ${mult(r.fuel_drain_mult)}`);
    if (r.jowang_fuel_mult !== 1) extras.push(`조왕 부뚜막 — 빌면 그 방 동안 혼불 기름 ${mult(r.jowang_fuel_mult)}`);
    if (r.guide_thread) extras.push(`명주실 길잡이 — 바닥의 붉은 실이 갈 곳을 잇는다`);
    if (r.revive_ratio) extras.push(`바리공주의 축복 — 한 판에 한 번 체력 ${Math.round(r.revive_ratio * 100)}% 로 일어선다`);
    if (r.unlocked_by) extras.push(`열림 — ${linkId("stages", r.unlocked_by)}의 보스를 잡으면`);
    return head("stages", r, boss && boss.portrait, [badge("막 " + r.act_number, "gold"), r.in_preparation ? badge("준비 중", "red") : ""], "") +
      `<p class="lead">${esc(r.tagline_ko)}</p></div></div>
      <div class="stats">${stat("보스", linkId("enemies", r.final_boss_id))}${stat("귀신 체력", mult(r.enemy_hp_mult))}${stat("귀신 피해", mult(r.enemy_damage_mult))}${stat("동시 상한", r.max_active_enemies)}</div>
      ${extras.length ? `<h2>이 막의 규칙</h2><ul class="lines">${extras.map((x) => `<li>${x}</li>`).join("")}</ul>` : ""}
      <h2>방</h2><div class="scroll-x"><table class="t"><tr><th>#</th><th>이름</th><th>조건</th><th>제한</th><th>혼 상한</th><th>귀신</th></tr>${rooms}</table></div>` + raw(r);
  },
  pacts(r) { return head("pacts", r, "", [badge(ko(r.axis))]) + `</div></div>${paper(r.description_ko)}<p class="lead">${esc(r.axis_ko)}</p>` + raw(r); },
  preps(r) { return head("preps", r, "", [badge("혼 " + r.soul_cost, "gold")]) + `</div></div>${paper(r.description_ko)}` + raw(r); },
  meta_upgrades(r) {
    return head("meta_upgrades", r, "", [badge("최대 Lv" + r.max_level)]) + `</div></div><table class="t"><tr><th>Lv</th><th>값(혼)</th><th>효과</th></tr>` +
      (r.levels || []).map((l, i) => `<tr><td>${i + 1}</td><td class="num">${(r.costs || [])[i] ?? ""}</td><td>${(l.modifiers || []).map((m) => esc(m.text)).join(" · ")}</td></tr>`).join("") + `</table>` + raw(r);
  },
  jewels(r) {
    return head("jewels", r, "", [badge("유니크"), badge(r.tier_ko, r.tier_ko === "상" ? "red" : r.tier_ko === "중" ? "violet" : "blue"), badge(ko(r.effect))]) + `</div></div>
      ${paper(r.description_ko)}<div class="stats">${stat("얻는 곳", esc(r.source_ko || "—"))}${r.ward_stage_id ? stat("상극을 지운다", linkId("stages", r.ward_stage_id)) : ""}${r.from_stat ? stat("치환", esc((D.stat_names[r.from_stat] || r.from_stat) + " → " + (D.stat_names[r.to_stat] || r.to_stat))) : ""}</div>` + raw(r);
  },
  deities(r) {
    const bigi = get("bigi", (r.bigi || {}).ref);
    const haps = (D.hapsin || []).filter((h) => h.deity_a === r.id || h.deity_b === r.id);
    const tiers = (r.effects_ko || []).map((e, i) => `<tr><td>${i + 1}${i >= 3 ? " (공양)" : ""}</td><td>${esc(e)}</td><td>${esc((r.wards_ko || [])[i] || "")}</td></tr>`).join("");
    return head("deities", r, r.portrait, [badge(r.obang_ko, "gold"), badge(r.emblem, "red")]) + `<p class="lead">${esc(r.lore_ko)}</p></div></div>
      <h2>단계별</h2><p class="lead">같은 색 자리에 앉으면 한 단계 세다. 4 · 5단계는 노잣돈 공양으로만 오른다. 서쪽(가호) 자리에 앉으면 터지는 일 대신 가호를 준다.</p>
      <div class="scroll-x"><table class="t"><tr><th>단계</th><th>터지는 일</th><th>서쪽 자리 — 가호</th></tr>${tiers}</table></div>
      <h2>대가</h2>${lines((r.costs_ko || []).map((t) => ({ text: t.replace(/^▼ /, ""), sign: -1 })))}
      ${haps.length ? `<h2>합신</h2>${lines(haps.map((h) => `${h.display_name_ko} — ${h.rule_ko}`))}<p>${haps.map((h) => linkId("hapsin", h.id)).join(" · ")}</p>` : ""}
      ${bigi ? `<p class="lead">일의 원본: ${linkId("bigi", bigi.id)}</p>` : ""}` + raw(r);
  },
  hapsin(r) {
    return head("hapsin", r, "", [badge("합신", "gold")]) + `<p class="lead">${esc(r.lore_ko)}</p></div></div>
      <div class="stats">${stat("짝", linkId("deities", r.deity_a) + " + " + linkId("deities", r.deity_b))}</div>
      <div class="paper">${esc(r.rule_ko)}</div><p class="lead">두 신령을 이웃 자리(가운데는 넷 모두와, 둘레는 옆끼리)에 앉히면 깨어난다.</p>` + raw(r);
  },
};

// --- 따로 그리는 쪽 ---
function affixPage() {
  const rows = (D.jewel_affixes || []).map((a) => `<tr><td>${esc(a.display_name_ko)}</td><td>${a.slot === "Prefix" ? "접두" : "접미"}</td><td>${esc(D.stat_names[a.stat] || a.stat)}</td><td>${a.tiers_ko.map((t, i) => `<b>${i + 1}</b> ${esc(t)}`).join("<br>")}</td><td class="num">${a.weight}</td></tr>`).join("");
  return `<div class="crumbs"><a href="#/">처음</a> › 노리개 접사</div><h1>노리개 접사</h1>
    <p class="lead">매직(접사 1~2) · 레어(3~4) 노리개가 굴리는 접사. 접두는 공격, 접미는 몸 · 걸음 · 재물.</p>
    <div class="scroll-x"><table class="t"><tr><th>이름</th><th>자리</th><th>스탯</th><th>단계별</th><th>무게</th></tr>${rows}</table></div>
    <h2>규칙</h2>${paper(D.jewel_rules_ko)}`;
}

function underworldPage() {
  const u = UW;
  const floors = (u.floors_ko || []).map((f, i) => {
    const boss = (u.floor_boss_ids || [])[i];
    const pools = (u.floor_boss_pools || []).filter((p) => p.floor_index === i);
    const hells = (u.floor_hells || []).filter((h) => h.floor_index === i);
    const natives = [(u.floor_native_entries || [])[i], (u.floor_hungry_entries || [])[i]].filter((e) => e && e.enemy);
    const frag = (u.fragments_to_open || [])[i];
    return `<h2>${i + 1}층 · ${esc(f.name)}</h2><p class="lead">${esc(f.rule)}</p>
      <div class="stats">${frag !== undefined ? stat("여는 데 필요한 적패지 조각", frag) : ""}${boss ? stat("층 주인", linkId("enemies", boss)) : ""}${natives.length ? stat("이 층의 귀신", natives.map((e) => link(e.enemy)).join(", ")) : ""}</div>
      ${pools.length ? `<h3>층 주인 후보 (갈 때마다 바뀐다)</h3>${lines(pools.map((p) => p.label_ko))}<p>${pools.flatMap((p) => p.enemy_ids).map((id) => linkId("enemies", id)).join(" · ")}</p>` : ""}
      ${hells.length ? `<h3>지옥 (방마다 하나)</h3><table class="t"><tr><th>지옥</th><th>규칙</th></tr>${hells.map((h) => `<tr><td>${esc(h.display_name_ko)}</td><td>${esc(h.rule_ko)}</td></tr>`).join("")}</table>` : ""}`;
  }).join("");
  const kinds = (u.kinds_ko || []).map((k) => `<tr><td>${esc(k.name)}</td><td>${esc(k.help)}</td></tr>`).join("");
  const unlocks = (u.unlock_names_ko || []).map((n, i) => `<tr><td>${esc(n)}</td><td class="num">${(u.unlock_costs || [])[i] ?? ""}</td><td>${esc((u.unlock_lines_ko || [])[i] || "")}</td></tr>`).join("");
  const asc = (u.ascension_names_ko || []).map((n, i) => `<tr><td>${i + 1}</td><td>${esc(n)}</td><td>${esc((u.ascension_rules_ko || [])[i] || "")}</td></tr>`).join("");
  return `<div class="crumbs"><a href="#/">처음</a> › 저승</div><h1>저승 — 명부</h1>
    <p class="lead">마지막 막을 깨면 열리는 엔드게임. 갈림길을 골라 내려가는 노드 지도 · 노드 하나가 큰 방 하나 · 층 다섯. 층 주인을 잡으면 적패지 조각을 얻어 다음 층이 열린다. 저승 판의 혼은 노잣돈이 되어 주막 · 공양 · 길 넓히기에 쓴다. 빌드(무기 레벨 · 변형 · 패시브)는 노드 사이를 넘어간다.</p>
    <div class="stats">${stat("층마다 귀신 체력", "+" + Math.round((u.floor_hp_step || 0) * 100) + "%")}${stat("층마다 귀신 피해", "+" + Math.round((u.floor_damage_step || 0) * 100) + "%")}${stat("층 주인 방 체력", mult(u.boss_hp_mult || 1))}${stat("쓰러지면 노잣돈", Math.round((u.noja_keep_on_death || 0) * 100) + "% 남김")}</div>
    ${floors}
    <h2>노드 종류</h2><table class="t"><tr><th>종류</th><th>무엇</th></tr>${kinds}</table>
    <h2>주막 값 (노잣돈)</h2><div class="stats">${stat("패시브", u.shop_bigi_price)}${stat("변형", u.shop_mutation_price)}${stat("주무기 +2", u.shop_level_price)}${stat("체력 반", u.shop_heal_price)}${stat("기력(최대 체력 +" + u.shop_vigor_max_hp + ")", u.shop_vigor_price)}</div>
    <h2>저승 길 넓히기</h2><table class="t"><tr><th>항목</th><th>노잣돈</th><th>무엇</th></tr>${unlocks}</table>
    <h2>신령 공양</h2><p class="lead">4 · 5단계는 노잣돈으로만 오른다 — ${(u.offering_costs || []).join(" · ")}</p>
    <h2>저승 단계 (시왕)</h2><p class="lead">다섯째 층 주인까지 그 단계로 건너면 다음 단계가 열린다. 쌓인다.</p><table class="t"><tr><th>#</th><th>이름</th><th>더해지는 것</th></tr>${asc}</table>`;
}

function uberPage() {
  const t = D.tablet_rules || {};
  return `<div class="crumbs"><a href="#/">처음</a> › 우버 · 저주패</div><h1>우버 · 저주패</h1>
    <p class="lead">마지막 막을 깨면 막 화면에 우버 토글이 선다. 켜면 그 막의 저주패(단계 1~${t.max_tier})로 나선다. 본편 저주 여섯을 전부 바닥으로 깔고, 단계 ${t.tiers_per_pact}마다 저주가 하나 박히고, 단계마다 귀신 체력 · 피해가 +${Math.round((t.hp_per_tier || 0) * 100)}% 씩 오른다. 우버가 열리면 막의 상극이 사라진다.</p>
    <div class="stats">${stat("단계 상한", t.max_tier)}${stat("잡귀 체력", mult(t.uber_trash_hp))}${stat("정예 체력", mult(t.uber_elite_hp))}${stat("보스 체력", mult(t.uber_boss_hp))}${stat("물량", mult(t.uber_horde))}${stat("방마다 정예", `${t.uber_elite_min} + 방마다 ${t.uber_elite_per_room}`)}${stat("다시 뽑기", "혼 " + t.reroll_cost)}</div>
    <h2>오르내림</h2><ul class="lines"><li class="good">보스를 잡으면 그대로 + 조건 하나당 +1 (최대 +${t.max_climb})</li><li class="bad">쓰러지면 −1 — 깬 가장 높은 단계(굳은 바닥) 아래로는 안 간다</li>
    <li>조건 — 무사망 · 기름 ${Math.round((t.fuel_keep_ratio || 0) * 100)}% 남기고 · 신내림 방 ${t.divine_rooms_needed}개</li>
    <li>첫 돌파 — 혼 ${t.first_break_souls_base} + ${t.first_break_souls_per_tier}×단계</li>
    <li>신단 자리가 열리는 단계 — ${(t.slot_break_tiers || []).join(" · ")} · 신령을 고르는 단계 — ${(t.deity_break_tiers || []).join(" · ")}</li></ul>`;
}

// --- 특성 트리 ---
function treePage() {
  const T = D.tree || { nodes: [] };
  const regions = [...new Set(T.nodes.map((n) => n.region).filter(Boolean))];
  return `<div class="crumbs"><a href="#/">처음</a> › 특성 트리</div><h1>특성 트리</h1>
    <p class="lead">판 밖 성장. 혼으로 포인트를 사서(살수록 비싸다, 상한 ${T.max_points}점) 시작점에서 이어 찍는다. 구역이 축을 말하고 점의 색이 성향(위력 · 술법 · 몸 · 걸음 · 재물)을 말한다. 끌어서 옮기고 휠 · 두 손가락으로 확대, 올리면 설명.</p>
    <div class="tree-legend"><span style="--c:#d6a84a">관문(키스톤)</span><span style="--c:#c8b48a">중형</span><span style="--c:#888">소형(성향색)</span><span style="--c:#6fb49a">노리개 고리</span><span style="--c:#fff">시작점</span> · 구역: ${regions.map(esc).join(" · ")}</div>
    <div class="tree-wrap" id="tree"><div class="tree-tip" id="tree-tip" hidden></div></div>
    <h2>관문 · 중형 노드</h2><div class="scroll-x"><table class="t"><tr><th>이름</th><th>종류</th><th>구역</th><th>효과</th></tr>${T.nodes.filter((n) => n.kind === "KEYSTONE" || n.kind === "NOTABLE").sort((a, b) => (a.kind > b.kind ? -1 : 1)).map((n) => `<tr><td>${esc(n.name)}</td><td>${n.kind === "KEYSTONE" ? "관문" : "중형"}</td><td>${esc(n.region)}</td><td>${n.summary ? esc(n.summary) + "<br>" : ""}${lines(n.lines)}</td></tr>`).join("")}</table></div>`;
}
function mountTree() {
  const T = D.tree; const wrap = $("#tree"); if (!wrap || !T) return;
  const byId = {}; for (const n of T.nodes) byId[n.id] = n;
  const xs = T.nodes.map((n) => n.x), ys = T.nodes.map((n) => n.y);
  const minX = Math.min(...xs) - 60, maxX = Math.max(...xs) + 60, minY = Math.min(...ys) - 60, maxY = Math.max(...ys) + 60;
  let vb = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  const R = { MINOR: 7, NOTABLE: 13, KEYSTONE: 18, SOCKET: 11, START: 12 };
  let edges = "", seen = new Set();
  for (const n of T.nodes) for (const l of n.links) { const m = byId[l]; if (!m) continue; const k = [n.id, l].sort().join("|"); if (seen.has(k)) continue; seen.add(k);
    edges += `<line x1="${n.x}" y1="${n.y}" x2="${m.x}" y2="${m.y}"/>`; }
  let nodes = "";
  for (const n of T.nodes) {
    const r = R[n.kind] || 7;
    const fill = n.kind === "KEYSTONE" ? "#d6a84a" : n.kind === "NOTABLE" ? "#c8b48a" : n.kind === "SOCKET" ? "#0d0b10" : n.kind === "START" ? "#ffffff" : (n.color || "#888");
    const stroke = n.kind === "SOCKET" ? "#6fb49a" : n.kind === "KEYSTONE" ? "#7a1e12" : "#000";
    const shape = n.kind === "KEYSTONE" ? `<rect x="${n.x - r}" y="${n.y - r}" width="${r * 2}" height="${r * 2}" rx="3" fill="${fill}" stroke="${stroke}" stroke-width="3"/>` : `<circle cx="${n.x}" cy="${n.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${n.kind === "SOCKET" ? 3 : 2}"/>`;
    nodes += `<g data-id="${esc(n.id)}" class="tn">${shape}</g>`;
  }
  const labels = {};
  for (const n of T.nodes) if (n.region) { const L = labels[n.region] || (labels[n.region] = { x: 0, y: 0, c: 0 }); L.x += n.x; L.y += n.y; L.c++; }
  let lab = ""; for (const [k, L] of Object.entries(labels)) lab += `<text x="${L.x / L.c}" y="${L.y / L.c}" text-anchor="middle" fill="#ffffff22" font-size="64" font-family="MaruBuri, serif" font-weight="700">${esc(k)}</text>`;
  const svgNS = `<svg viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" xmlns="http://www.w3.org/2000/svg"><g>${lab}</g><g stroke="#5c4a3a" stroke-width="3" opacity=".9">${edges}</g><g>${nodes}</g></svg>`;
  wrap.insertAdjacentHTML("afterbegin", svgNS);
  const svg = wrap.querySelector("svg"), tip = $("#tree-tip");
  const setVB = () => svg.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  const toWorld = (cx, cy) => { const b = svg.getBoundingClientRect(); const s = Math.max(vb.w / b.width, vb.h / b.height); const ox = (b.width * s - vb.w) / 2, oy = (b.height * s - vb.h) / 2;
    return { x: vb.x - ox + (cx - b.left) * s, y: vb.y - oy + (cy - b.top) * s, s }; };
  const zoom = (cx, cy, f) => { const p = toWorld(cx, cy); const nw = Math.min(Math.max(vb.w * f, 150), (maxX - minX) * 2); const k = nw / vb.w;
    vb.x = p.x - (p.x - vb.x) * k; vb.y = p.y - (p.y - vb.y) * k; vb.w = nw; vb.h *= k; setVB(); };
  wrap.addEventListener("wheel", (e) => { e.preventDefault(); zoom(e.clientX, e.clientY, e.deltaY > 0 ? 1.15 : 1 / 1.15); }, { passive: false });
  const pts = new Map(); let last = null, pinch = 0;
  wrap.addEventListener("pointerdown", (e) => { wrap.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); last = { x: e.clientX, y: e.clientY }; });
  wrap.addEventListener("pointermove", (e) => {
    if (pts.has(e.pointerId)) {
      const prev = pts.get(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) { const [a, b] = [...pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) zoom((a.x + b.x) / 2, (a.y + b.y) / 2, pinch / d); pinch = d; }
      else { const p = toWorld(0, 0); vb.x -= (e.clientX - prev.x) * p.s; vb.y -= (e.clientY - prev.y) * p.s; setVB(); }
      tip.hidden = true; return;
    }
    const g = e.target.closest && e.target.closest(".tn");
    if (!g) { tip.hidden = true; return; }
    showTip(byId[g.dataset.id], e);
  });
  const end = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = 0; };
  wrap.addEventListener("pointerup", (e) => { const moved = last && Math.hypot(e.clientX - last.x, e.clientY - last.y) > 6; end(e);
    if (!moved) { const g = document.elementFromPoint(e.clientX, e.clientY); const t = g && g.closest && g.closest(".tn"); if (t) showTip(byId[t.dataset.id], e); else tip.hidden = true; } });
  wrap.addEventListener("pointercancel", end);
  function showTip(n, e) {
    if (!n) return;
    const kind = { MINOR: "소형", NOTABLE: "중형", KEYSTONE: "관문", SOCKET: "노리개 고리", START: "시작점" }[n.kind] || n.kind;
    tip.innerHTML = `<b>${esc(n.name)}</b><small>${kind} · ${esc(n.region)}</small>${n.summary ? `<div>${esc(n.summary)}</div>` : ""}${n.lines.map((l) => `<div class="${l.sign < 0 ? "bad" : "good"}">${l.sign < 0 ? "▼" : "▲"} ${esc(l.text)}</div>`).join("")}${n.socket ? `<div>노리개를 끼우는 칸 — 반경 안 노드를 바꾼다</div>` : ""}`;
    tip.hidden = false;
    const b = wrap.getBoundingClientRect();
    let x = e.clientX - b.left + 14, y = e.clientY - b.top + 14;
    if (x + 300 > b.width) x = e.clientX - b.left - 310;
    if (y + tip.offsetHeight > b.height) y = b.height - tip.offsetHeight - 6;
    tip.style.left = Math.max(4, x) + "px"; tip.style.top = Math.max(4, y) + "px";
  }
}

// --- 찾기 ---
const SEARCH = [];
for (const [k, c] of Object.entries(CATS)) for (const r of D[k] || []) SEARCH.push({ name: r.display_name_ko || r.id, en: (r.display_name_en || "") + " " + r.id, cat: c.title, href: `#/c/${k}/${r.id}`, thumb: k === "stages" ? c.thumb(r) : thumbOf(r) });
for (const n of ((D.tree || {}).nodes || [])) if (n.kind === "KEYSTONE" || n.kind === "NOTABLE") SEARCH.push({ name: n.name, en: n.id, cat: "특성 트리", href: "#/tree" });
const box = $("#search"), res = $("#search-results");
let sel = -1;
box.addEventListener("input", () => {
  const q = box.value.trim().toLowerCase();
  if (!q) { res.hidden = true; return; }
  const hits = SEARCH.filter((s) => s.name.toLowerCase().includes(q) || s.en.toLowerCase().includes(q)).slice(0, 30);
  sel = -1;
  res.innerHTML = hits.length ? hits.map((s) => `<a href="${s.href}">${s.thumb ? `<img src="${esc(s.thumb)}" style="width:26px;height:26px;object-fit:cover;border-radius:4px">` : ""}${esc(s.name)}<span class="cat">${esc(s.cat)}</span></a>`).join("") : `<a>없음</a>`;
  res.hidden = false;
});
box.addEventListener("keydown", (e) => {
  const items = [...res.querySelectorAll("a[href]")];
  if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length; items.forEach((a, i) => a.classList.toggle("on", i === sel)); }
  if (e.key === "Enter" && items.length) { location.hash = (items[Math.max(sel, 0)]).getAttribute("href"); res.hidden = true; box.blur(); }
  if (e.key === "Escape") { res.hidden = true; box.blur(); }
});
document.addEventListener("click", (e) => { if (!e.target.closest(".search-wrap")) res.hidden = true; });
res.addEventListener("click", () => { res.hidden = true; box.value = ""; });
$("#menu-toggle").addEventListener("click", () => $("#side").classList.toggle("open"));

// --- 길 ---
function route() {
  const parts = location.hash.replace(/^#\/?/, "").split("/");
  let html = "", active = "home", title = "벽사록";
  if (parts[0] === "c" && CATS[parts[1]]) {
    active = parts[1];
    const row = parts[2] && get(parts[1], decodeURIComponent(parts[2]));
    if (row) { html = (DETAIL[parts[1]] || ((r) => head(parts[1], r, thumbOf(r), []) + "</div></div>" + raw(r)))(row); title = row.display_name_ko + " — " + CATS[parts[1]].title; }
    else { html = list(parts[1]); title = CATS[parts[1]].title; }
  } else if (parts[0] === "tree") { active = "#/tree"; html = treePage(); title = "특성 트리"; }
  else if (parts[0] === "jewel-affixes") { active = "#/jewel-affixes"; html = affixPage(); title = "노리개 접사"; }
  else if (parts[0] === "underworld") { active = "#/underworld"; html = underworldPage(); title = "저승"; }
  else if (parts[0] === "uber") { active = "#/uber"; html = uberPage(); title = "우버 · 저주패"; }
  else html = home();
  $("#main").innerHTML = html;
  renderSide(active);
  document.title = title === "벽사록" ? "벽사록 — 게임 데이터 위키" : title + " · 벽사록";
  $("#side").classList.remove("open");
  if (active === "#/tree") mountTree();
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);
$("#built").textContent = D.meta ? `데이터 ${String(D.meta.built).slice(0, 10)} 기준` : "";
route();

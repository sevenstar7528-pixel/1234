javascript:(()=>{try{

/* ============================================================
   整合 Bookmarklet V2
   ============================================================

   ① 鍛造 V6
      - 必定橙色
      - 已抽中的詞條 MAX
      - 三孔
      - artifact 排除

   ② 僕從任務 V10
      - 打掃：50,000 靈石
      - 餵養靈獸：500 獸丹
      - 種植：500 靈草
      - 整理武學：500 武學積分
      - 礦脈：50,000 礦石

   ③ grantQuestRewards Hook
      - 任務實際結算時再次套用獎勵

   ④ 修煉效率 V4
      - 基礎修煉倍率固定 10
      - 移除狐狸倍率
      - 移除龍倍率
      - 移除悟道倍率
      - 支援不同空白 / 換行格式
*/


const STATE=
window.__INTEGRATED_BOOKMARKLET_V2__||
{};

const log=(...args)=>{
try{
console.log(
"[Integrated Bookmarklet]",
...args
);
}catch(e){}
};


/* ============================================================
   ① 鍛造 V6
   ============================================================ */

if(!STATE.forge){

const F=window.forgeEquipment;

if(typeof F==="function"){

const OLD=F;
const OLD_RANDOM=Math.random;

const MAX={

strPct:0.05,
conPct:0.05,
intPct:0.05,
sprPct:0.05,
chaPct:0.05,

atkPct:0.04,
hpPct:0.05,

def:3,
eva:2,

ice:5,
fire:5,
poison:5,
metal:5,
thunder:5,

"fx:法爆":0.05,
"fx:手敵":0.05,
"fx:回春":0.008,
"fx:回靈":0.01,
"fx:噬魂":0.02,
"fx:聚財":0.06,
"fx:悟道":0.03,
"fx:積德":0.08,
"fx:尋鐵":0.08,
"fx:獸魂":0.08

};

window.__FORGE_MAX_V6_OLD__=OLD;

window.forgeEquipment=function(qty=1){

let first=true;

Math.random=function(){

if(first){

first=false;

return 0.01;

}

return OLD_RANDOM.apply(
this,
arguments
);

};

let before=0;

try{

if(
window.player&&
Array.isArray(player.equipInventory)
){

before=
player.equipInventory.length;

}

}catch(e){}

let result;

try{

result=
OLD.call(
this,
qty
);

}finally{

Math.random=
OLD_RANDOM;

}

try{

if(
!window.player||
!Array.isArray(player.equipInventory)
){

return result;

}

const made=
player.equipInventory.slice(
before
);

made.forEach(eq=>{

if(!eq){
return;
}

if(eq.category==="artifact"){
return;
}


/* 橙色 */
eq.quality="橙色";


/* 已抽中的詞條 MAX */

if(Array.isArray(eq.subs)){

eq.subs.forEach(sub=>{

if(!Array.isArray(sub)){
return;
}

const key=sub[0];

if(
Object.prototype.hasOwnProperty.call(
MAX,
key
)
){

sub[1]=MAX[key];

}

});

}


/* 三孔 */

eq.sockets=[
null,
null,
null
];

});


try{

if(
typeof updateUI==="function"
){

updateUI();

}

}catch(e){}

}catch(e){

log(
"Forge error:",
e
);

}

return result;

};

STATE.forge=true;

log(
"Forge V6 installed"
);

}else{

log(
"forgeEquipment not found"
);

}

}


/* ============================================================
   ② 僕從任務 V10
   ============================================================ */

const applyQuestRewardRules=
function(def){

try{

if(
!def||
!def.rewards
){

return;

}

const name=
String(def.name||"");


if(name==="打掃清潔"){

def.rewards.coins=
50000;

}


if(name==="餵養靈獸"){

def.rewards.beastCore=
500;

}


if(name==="種植靈草"){

def.rewards.spiritGrass=
500;

}


if(name==="整理武學秘典"){

def.rewards.martialPoints=
500;

}


if(name==="礦脈採礦"){

def.rewards.ore=
50000;

}

}catch(e){

log(
"Quest reward error:",
e
);

}

};


/* ============================================================
   ③ 修改 questData
   ============================================================ */

try{

if(
typeof questData!=="undefined"
){

/* 打掃 */
if(
questData.clean&&
questData.clean[1]
){

questData.clean[1].rewards={
coins:50000
};

}


/* 餵養 */
if(
questData.clean&&
questData.clean[2]
){

questData.clean[2].rewards={
beastCore:500
};

}


/* 種植 */

if(questData.plant){

[1,2,3].forEach(
tier=>{

if(
questData.plant[tier]
){

questData.plant[tier].rewards={
spiritGrass:500
};

}

}
);

}


/* 武學 */

if(questData.book){

[1,2,3].forEach(
tier=>{

if(
questData.book[tier]
){

questData.book[tier].rewards={
martialPoints:500
};

}

}
);

}


/* 礦脈 */

if(questData.mine){

[2,3].forEach(
tier=>{

if(
questData.mine[tier]
){

questData.mine[tier].rewards={
ore:50000
};

}

}
);

}

}

}catch(e){

log(
"questData error:",
e
);


/* ============================================================
   ④ grantQuestRewards Hook
   ============================================================ */

try{

if(
!STATE.questHook&&
typeof grantQuestRewards==="function"
){

const originalGrant=
grantQuestRewards;

window.__integrated_original_grantQuestRewards__=
originalGrant;

window.grantQuestRewards=
function(def,servant){

try{

applyQuestRewardRules(def);

}catch(e){}

return originalGrant.call(
this,
def,
servant
);

};

STATE.questHook=true;

}

}catch(e){

log(
"Quest hook error:",
e
);


/* UI */

try{

if(
typeof renderQuestButtons==="function"
){

renderQuestButtons();

}

}catch(e){}

try{

if(
typeof updateQuestUI==="function"
){

updateQuestUI();

}

}catch(e){}


/* ============================================================
   ⑤ 修煉效率 V4
   ============================================================ */

if(
!STATE.cultivation
){

try{

if(
typeof window.gainExp!=="function"
){

log(
"gainExp not found"
);

}else{

const original=
window.gainExp;

let src=
Function.prototype.toString.call(
original
);


/* ------------------------------------------------------------
   先處理可能存在的 URL encoding
   ------------------------------------------------------------ */

try{

const decoded=
decodeURIComponent(src);

if(
decoded!==src&&
(
decoded.includes("finalAmount")||
decoded.includes("expMult")
)
){

src=decoded;

}

}catch(e){}


/* ------------------------------------------------------------
   移除狐狸倍率
   支援：
   if(hasLiveBeast('fox')) finalAmount *= 1.1;
   if (hasLiveBeast("fox")) finalAmount *= 1.1;
   ------------------------------------------------------------ */

src=
src.replace(
/if\s*\(\s*hasLiveBeast\s*\(\s*['"]fox['"]\s*\)\s*\)\s*finalAmount\s*\*=\s*1\.1\s*;?/g,
""
);


/* ------------------------------------------------------------
   移除龍倍率
   ------------------------------------------------------------ */

src=
src.replace(
/if\s*\(\s*hasLiveBeast\s*\(\s*['"]dragon['"]\s*\)\s*\)\s*finalAmount\s*\*=\s*1\.2\s*;?/g,
""
);


/* ------------------------------------------------------------
   移除悟道倍率

   支援：
   finalAmount *= 1 + gearFx("悟道");
   finalAmount*=1+gearFx('悟道');
   ------------------------------------------------------------ */

src=
src.replace(
/finalAmount\s*\*=\s*1\s*\+\s*gearFx\s*\(\s*['"]悟道['"]\s*\)\s*;?/g,
""
);


/* ------------------------------------------------------------
   修煉倍率核心修正

   原本可能是：

   let finalAmount =
   amount *
   (player.sect ? player.sect.expMult : 1.0);

   或：

   let finalAmount = amount * (
       player.sect
       ? player.sect.expMult
       : 1.0
   );

   或單行格式。
   ------------------------------------------------------------ */


/* 格式 A */

let changed=false;

let reA=
/(let\s+finalAmount\s*=\s*amount\s*\*\s*)\(\s*player\.sect\s*\?\s*player\.sect\.expMult\s*:\s*1\.0\s*\)/;

if(
reA.test(src)
){

src=
src.replace(
reA,
"$1 10"
);

changed=true;

}


/* 格式 B */

if(!changed){

let reB=
/(let\s+finalAmount\s*=\s*amount\s*\*\s*)player\.sect\s*\?\s*player\.sect\.expMult\s*:\s*1\.0/;

if(
reB.test(src)
){

src=
src.replace(
reB,
"$1 10"
);

changed=true;

}

}


/* 格式 C：可能有 const */

if(!changed){

let reC=
/((?:let|const|var)\s+finalAmount\s*=\s*amount\s*\*\s*)\(\s*player\.sect\s*\?\s*player\.sect\.expMult\s*:\s*1(?:\.0)?\s*\)/;

if(
reC.test(src)
){

src=
src.replace(
reC,
"$1 10"
);

changed=true;

}

}


/* 格式 D：直接搜尋 finalAmount 起始倍率 */

if(!changed){

let reD=
/((?:let|const|var)\s+finalAmount\s*=\s*amount\s*\*\s*)\(\s*player\.sect\s*\?\s*player\.sect\.expMult\s*:\s*1(?:\.0)?\s*\)/;

if(
reD.test(src)
){

src=
src.replace(
reD,
"$1 10"
);

changed=true;

}

}


/* ------------------------------------------------------------
   如果找到 finalAmount，但原本倍率格式不同，
   嘗試把 player.sect.expMult 改成固定 10
   ------------------------------------------------------------ */

if(!changed){

let reE=
/player\.sect\.expMult/g;

if(
reE.test(src)&&
src.includes("finalAmount")
){

src=
src.replace(
reE,
"10"
);

changed=true;

}

}


/* ------------------------------------------------------------
   建立新的 gainExp
   ------------------------------------------------------------ */

if(changed){

try{

const fn=
Function(
"return ("+
src+
")"
)();


if(
typeof fn==="function"
){

window.__cult10_original=
original;

window.gainExp=
fn;

STATE.cultivation=true;

STATE.cultivationMethod=
"source-rewrite";

log(
"修煉效率 ×10 已安裝"
);

}else{

log(
"gainExp 重建失敗"
);

}

}catch(e){

log(
"gainExp rebuild error:",
e
);

}

}else{

/*
 * 沒有找到時不假裝成功
 */
STATE.cultivation=false;

STATE.cultivationFailed=true;

log(
"找不到 gainExp 修煉倍率"
);

}

}

}catch(e){

log(
"Cultivation error:",
e
);

}

}


/* ============================================================
   ⑥ 儲存狀態
   ============================================================ */

window.__INTEGRATED_BOOKMARKLET_V2__=
STATE;


/* ============================================================
   ⑦ 顯示結果
   ============================================================ */

const status=[

"鍛造 V6："+
(
STATE.forge
?"✓"
:"✗"
),

"僕從任務 V10："+
(
typeof questData!=="undefined"
?"✓"
:"✗"
),

"任務發放 Hook："+
(
STATE.questHook
?"✓"
:"✗"
),

"修煉效率 ×10："+
(
STATE.cultivation
?"✓"
:"✗"
)

].join("\n");


if(
STATE.cultivation
){

alert(

"✅ 整合 Bookmarklet V2\n\n"+

status+

"\n\n"+

"修煉效率：10 倍\n"+
"宗門倍率：已排除\n"+
"狐狸倍率：已排除\n"+
"龍倍率：已排除\n"+
"悟道倍率：已排除"

);

}else{

alert(

"⚠️ 整合 Bookmarklet V2 已執行\n\n"+

status+

"\n\n"+

"⚠️ 修煉效率沒有找到可修改的 gainExp 格式。\n\n"+

"其他功能仍會照常執行。"

);

}


}catch(e){

alert(

"❌ 整合 Bookmarklet V2 執行失敗\n\n"+
e.name+
"\n"+
e.message

);

}})();

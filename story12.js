// SKORBININ CRIME CITY 12.0 — chapter add-on inside the existing game closure.
(()=>{
const MISS=[
 {name:"Тёмная сделка",icon:"🤝",at:{x:760,y:760},payout:100000,t:330},
 {name:"Король асфальта",icon:"🏁",at:{x:2200,y:2200},payout:175000,t:120},
 {name:"Золотой маршрут",icon:"🚚",at:{x:2680,y:1240},payout:350000,t:330},
 {name:"Чужая территория",icon:"🏭",at:{x:760,y:2680},payout:200000,t:340},
 {name:"Новый хозяин",icon:"👑",at:{x:1930,y:2440},payout:500000,t:290}
];
const race=[{x:2200,y:2200},{x:2200,y:1720},{x:2680,y:1720},{x:2680,y:2200},{x:2200,y:2680},{x:1720,y:2200}];
const locations=[{x:1240,y:2680},{x:760,y:2200},{x:1240,y:2200}];
let career={done:0,rep:0,territory:false},active=null,step=0,elapsed=0,left=0,van=null,rivals=[];
const K='crimecitystory12';
try{const d=JSON.parse(localStorage.getItem(K)||'{}');career.done=Math.max(0,Math.min(5,Number(d.done??d.completed)||0));career.rep=Math.max(0,Number(d.rep??d.reputation)||0);career.territory=!!(d.territory??d.unlocked);}catch(e){}
function save(){try{localStorage.setItem(K,JSON.stringify(career))}catch(e){}}
const label=document.createElement('div');
label.id='story12hud';label.style.cssText='position:fixed;top:calc(env(safe-area-inset-top) + 122px);left:7px;right:7px;max-width:600px;margin:auto;z-index:7;background:#0a1c30e8;color:#ffe6ad;border:1px solid #d7b57888;border-radius:13px;padding:8px;font:bold 11px/1.35 system-ui;text-align:center;pointer-events:none;box-shadow:0 4px 16px #0008';
document.body.appendChild(label);
function current(){return MISS[Math.min(career.done,4)]}
function target(){
 if(active===null)return current().at;
 if(active===0)return step===0?{x:1720,y:760}:{x:2200,y:1240};
 if(active===1)return race[Math.min(5,step+1)];
 if(active===2)return step<2?van:{x:1930,y:2510};
 if(active===3)return locations[Math.min(2,step)];
 if(active===4)return step===0?{x:2200,y:2440}:{x:1240,y:760};
 return null;
}
function objective(){
 if(active===0)return step===0?'Забери дипломат пешком':'Доставь дипломат на склад';
 if(active===1)return 'Гонка: контрольная точка '+(step+1)+'/5';
 if(active===2)return ['Догони движущийся фургон','Выйди из авто и забери груз','Доставь груз в укрытие'][step];
 if(active===3)return 'Промзона: поручение '+(step+1)+'/3';
 if(active===4)return step===0?'Встреча у особняка':'Уходи от преследования к гаражу';
 return '';
}
function hud(){
 if(active===null){label.textContent=career.done===5?'👑 ГЛАВА I ПРОЙДЕНА · РЕПУТАЦИЯ '+career.rep:'📖 ГЛАВА I · '+career.done+'/5 · '+current().name;return}
 const p=target(),d=p?Math.round(Math.hypot(player.x-p.x,player.y-p.y)):0;
 label.textContent='📖 '+MISS[active].name+' · '+Math.ceil(left)+' c · '+objective()+' · '+d+' м';
 objectiveEl.textContent='📖 '+objective();
}
function startStory(){
 if(active!==null||selectedMode!==3)return;
 active=career.done<5?career.done:0;step=0;elapsed=0;left=MISS[active].t;van=null;rivals=[];
 if(active===1)rivals=[{time:73,color:'#c04754'},{time:90,color:'#42a3c6'}];
 if(active===2)van={x:2680,y:760};
 showToast('📖 СЮЖЕТ: '+MISS[active].name.toUpperCase());hud();
}
function advance(msg){step++;sfx('cash');showToast('📖 '+msg);hud()}
function success(){
 const i=active,first=i>=career.done;
 const prize=first?MISS[i].payout:Math.round(MISS[i].payout*.35);
 wallet+=prize;
 if(first){career.done=Math.min(5,i+1);career.rep++;}
 if(i===3){career.territory=true;districtCount=Math.max(districtCount,1);saveEmpire();}
 if(i===2){empire9.heists++;saveCity9();}
 if(i===4){wanted=0;police.length=0;}
 active=null;rivals=[];van=null;save();saveProgress();updateHUD();sfx('win');
 showToast('🏆 СЮЖЕТ ПРОЙДЕН · +'+fmt(prize));hud();
}
function fail(reason){
 if(active===null)return;
 active=null;van=null;rivals=[];showToast('❌ СЮЖЕТ: '+reason+' · покупки сохранены');hud();
}
function tick(dt){
 if(selectedMode!==3||state!=='play')return;
 if(active===null){hud();return}
 elapsed+=dt;left-=dt;
 if(left<=0){fail('время истекло');return}
 const p=target();
 const near=p&&Math.hypot(player.x-p.x,player.y-p.y)<86;
 if(active===0){
  if(step===0&&near&&!player.inCar)advance('ДИПЛОМАТ ЗАБРАН');
  else if(step===1&&near)success();
 }else if(active===1){
  if(rivals.some(r=>elapsed>=r.time)){fail('соперники финишировали раньше');return}
  if(near&&player.inCar){advance('ЧЕКПОИНТ '+step+'/5');if(step>=5)success();}
 }else if(active===2){
  if(step===0&&van){
   const path=[{x:2680,y:760},{x:2200,y:760},{x:1720,y:760},{x:1240,y:760},{x:1240,y:1240},{x:1720,y:1240},{x:2200,y:1240},{x:2680,y:1240}];
   const dist=elapsed*105,i=Math.floor(dist/480)%path.length,f=(dist%480)/480,a=path[i],b=path[(i+1)%path.length];
   van.x=a.x+(b.x-a.x)*f;van.y=a.y+(b.y-a.y)*f;
   if(player.inCar&&Math.hypot(player.x-van.x,player.y-van.y)<80){advance('ФУРГОН ОСТАНОВЛЕН');wanted=Math.max(3,wanted);wantedTimer=13}
  }else if(step===1&&!player.inCar&&near){advance('ГРУЗ ЗАБРАН');wanted=Math.max(3,wanted);wantedTimer=13}
  else if(step===2&&near)success();
 }else if(active===3){
  if(near){advance('ПОРУЧЕНИЕ ВЫПОЛНЕНО');if(step>=3)success()}
 }else if(active===4){
  if(step===0&&near){advance('ЗАСАДА! УХОДИ!');wanted=Math.max(3,wanted);wantedTimer=20}
  else if(step===1&&near)success();
 }
 hud();
}
function marker(t){
 if(selectedMode!==3||state!=='play')return;
 const p=target();if(!p)return;
 ctx.save();ctx.translate(-cam.x,-cam.y);
 ctx.beginPath();ctx.arc(p.x,p.y,48+4*Math.sin(t*.006),0,Math.PI*2);
 ctx.lineWidth=5;ctx.strokeStyle=active===null?'#f8c976':'#72f4cb';ctx.shadowBlur=16;ctx.shadowColor=ctx.strokeStyle;ctx.stroke();ctx.shadowBlur=0;
 ctx.fillStyle='#f6e4b9';ctx.font='bold 14px system-ui';ctx.textAlign='center';
 ctx.fillText(active===null?'📖 '+current().name.toUpperCase():objective(),p.x,p.y-62);
 if(active===2&&van){ctx.fillStyle='#87949f';ctx.fillRect(van.x-23,van.y-40,46,80);ctx.fillStyle='#28394a';ctx.fillRect(van.x-18,van.y-30,36,25);}
 if(active===1)rivals.forEach((r,j)=>{
  const pos=Math.min(4.999,elapsed/r.time*5),i=Math.floor(pos),f=pos-i,a=race[i],b=race[i+1];
  const x=a.x+(b.x-a.x)*f,y=a.y+(b.y-a.y)*f+(j?24:-24);
  ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(b.y-a.y,b.x-a.x)+Math.PI/2);
  ctx.fillStyle=r.color;ctx.fillRect(-14,-29,28,58);ctx.fillStyle='#1b2e40';ctx.fillRect(-10,-16,20,23);ctx.restore();
 });
 ctx.restore();
}
const originalInteract=worldInteract;
worldInteract=function(){
 if(selectedMode===3&&active===null&&Math.hypot(player.x-current().at.x,player.y-current().at.y)<102){startStory();return}
 originalInteract();
};
const originalMarkerUpdate=worldMarkerUpdate;
worldMarkerUpdate=function(){
 originalMarkerUpdate();
 if(selectedMode===3&&active===null&&Math.hypot(player.x-current().at.x,player.y-current().at.y)<102){
  worldActionBtn.textContent='📖 НАЧАТЬ СЮЖЕТ · '+current().name.toUpperCase();worldActionBtn.style.display='block';
 }
};
const originalUpdate=update;
update=function(dt){originalUpdate(dt);tick(dt)};
const originalEnd=end;
end=function(win){if(selectedMode===3&&active!==null)fail('попытка провалена');originalEnd(win)};
const originalRender=render;
render=function(t){originalRender(t);marker(t)};
const originalMap=cityMapDraw;
cityMapDraw=function(){
 originalMap();
 const mc=worldMapCanvas.getContext('2d'),p=target(),scale=worldMapCanvas.width/world.w;
 if(p){mc.beginPath();mc.arc(p.x*scale,p.y*scale,13,0,7);mc.fillStyle='#e9ba61';mc.fill();mc.font='bold 11px system-ui';mc.fillStyle='#fff';mc.textAlign='center';mc.fillText('📖 СЮЖЕТ',p.x*scale,p.y*scale-17);}
};
const exp=document.getElementById('saveToolsExport');
if(exp&&exp.onclick){const before=exp.onclick;exp.onclick=function(){before();try{const box=document.getElementById('saveToolsData'),out=JSON.parse(box.value);out.save[K]=localStorage.getItem(K)||'{}';box.value=JSON.stringify(out)}catch(e){}}}
const imp=document.getElementById('saveToolsImport');
if(imp&&imp.onclick){const before=imp.onclick;imp.onclick=function(){let value;try{value=JSON.parse(document.getElementById('saveToolsData').value).save?.[K]}catch(e){}before();if(value){try{const d=JSON.parse(value);career.done=Math.min(5,Math.max(0,Number(d.done??d.completed)||0));career.rep=Math.max(0,Number(d.rep??d.reputation)||0);career.territory=!!(d.territory??d.unlocked);active=null;save();hud()}catch(e){}}}}
window.addEventListener('pagehide',save);
hud();
})();
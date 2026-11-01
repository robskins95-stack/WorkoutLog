(() => {
  "use strict";
  const filenames = {cardio:"cardio.csv",sets:"sets.csv",exercises:"exercises.csv",historical:"historical_notes.csv"};
  const data = {cardio:[],sets:[],exercises:[],historical:[]};
  const el = id => document.getElementById(id);
  const escape = x => String(x == null ? "" : x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const number = x => x === "" || x == null || !Number.isFinite(Number(x)) ? null : Number(x);
  const fixed = (x,d=1) => x == null ? "—" : x.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});
  const dateText = x => {if(!/^\d{4}-\d{2}-\d{2}$/.test(x||""))return x||"Unknown";const p=x.split("-").map(Number);return new Date(p[0],p[1]-1,p[2]).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});};
  const kind = x => ({outdoor_walk:"Outdoor walk",weighted_vest_walk:"Weighted-vest walk",treadmill_walk:"Treadmill walk"})[x]||String(x||"").replaceAll("_"," ");
  const pace = x => {const t=number(x.duration_seconds),d=number(x.distance_mi);return t!=null&&d>0?t/60/d:null;};
  const paceText = x => {if(x==null)return "—";const sec=Math.round(x*60);return Math.floor(sec/60)+":"+String(sec%60).padStart(2,"0")+"/mi";};
  const duration = x => {const n=number(x);if(n==null)return "—";return n>=3600?Math.floor(n/3600)+"h "+Math.floor(n%3600/60)+"m":Math.floor(n/60)+":"+String(n%60).padStart(2,"0");};
  function parseCSV(text){
    const rows=[];let row=[],cell="",quoted=false;text=text.replace(/^\uFEFF/,"");
    for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){cell+='"';i++;}else if(c==='"')quoted=false;else cell+=c;}else if(c==='"')quoted=true;else if(c===","){row.push(cell);cell="";}else if(c==="\n"||c==="\r"){if(c==="\r"&&text[i+1]==="\n")i++;row.push(cell);if(row.some(v=>v!==""))rows.push(row);row=[];cell="";}else cell+=c;}
    row.push(cell);if(row.some(v=>v!==""))rows.push(row);
    const headings=rows.shift()||[];return rows.map(values=>Object.fromEntries(headings.map((key,i)=>[key.trim(),values[i]??""])));
  }
  function showNotice(message){el("notice").hidden=false;el("notice").textContent=message;}
  function cardioCard(x){
    const vest=x.activity_type==="weighted_vest_walk";
    const metadata=[number(x.avg_heart_rate_bpm)!=null?x.avg_heart_rate_bpm+" bpm avg":"",number(x.cardio_load)!=null?"Load "+x.cardio_load:"",number(x.zone_minutes)!=null?x.zone_minutes+" zone min":""].filter(Boolean).join(" · ");
    return '<article class="item"><div><time>'+escape(dateText(x.date))+'</time><h3>'+escape(kind(x.activity_type))+'</h3><span class="tag'+(vest?' vest':'')+'">'+(vest?escape(x.vest_weight_lb||"?")+" lb vest":"Walk")+'</span> '+(x.data_quality==="partial"?'<span class="tag">Partial</span>':"")+'<p>'+escape(x.notes||"No notes")+'</p><p>'+escape(metadata)+'</p></div><div class="right"><strong>'+(number(x.distance_mi)!=null?fixed(number(x.distance_mi),2)+" mi":"—")+'</strong><span class="sub">'+paceText(pace(x))+' · '+duration(x.duration_seconds)+'</span></div></article>';
  }
  function lineChart(items){
    const pts=items.filter(x=>pace(x)!=null).sort((a,b)=>a.date.localeCompare(b.date));if(!pts.length)return '<div class="empty">No pace data yet</div>';
    const W=620,H=250,L=43,R=16,T=20,B=36,vals=pts.map(pace),min=Math.max(0,Math.floor(Math.min(...vals)-1)),max=Math.ceil(Math.max(...vals)+1),span=Math.max(1,max-min);
    const x=i=>L+(W-L-R)*(pts.length===1?.5:i/(pts.length-1));const y=v=>T+(H-T-B)*(max-v)/span;
    let s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Walking pace in minutes per mile">';
    for(let i=0;i<=4;i++){const v=min+span*i/4,yy=y(v);s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+yy+'" y2="'+yy+'"/><text x="'+(L-8)+'" y="'+(yy+4)+'" text-anchor="end">'+v.toFixed(0)+'</text>';}
    s+='<polyline points="'+pts.map((p,i)=>x(i).toFixed(1)+','+y(pace(p)).toFixed(1)).join(" ")+'"/>';
    pts.forEach((p,i)=>s+='<circle cx="'+x(i)+'" cy="'+y(pace(p))+'" r="5"><title>'+escape(dateText(p.date)+": "+paceText(pace(p))+" · "+kind(p.activity_type))+'</title></circle>');
    s+='<text x="'+L+'" y="'+(H-8)+'">'+escape(pts[0].date.slice(5))+'</text><text x="'+(W-R)+'" y="'+(H-8)+'" text-anchor="end">'+escape(pts[pts.length-1].date.slice(5))+'</text></svg>';return s;
  }
  function weekStart(date){const d=new Date(date+"T12:00:00");d.setDate(d.getDate()-(d.getDay()+6)%7);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  function weekChart(items){
    const totals=new Map();items.forEach(p=>{const d=number(p.distance_mi);if(d==null||!/^\d{4}-\d{2}-\d{2}$/.test(p.date||""))return;const k=weekStart(p.date);totals.set(k,(totals.get(k)||0)+d);});
    const entries=[...totals].sort((a,b)=>a[0].localeCompare(b[0]));if(!entries.length)return '<div class="empty">No distances yet</div>';
    const W=440,H=250,L=36,R=12,T=18,B=38,max=Math.max(1,...entries.map(x=>x[1]))*1.15,barWidth=(W-L-R)/entries.length;
    let s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Recorded miles per week">';
    for(let i=0;i<=4;i++){const yy=H-B-(H-T-B)*i/4;s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+yy+'" y2="'+yy+'"/><text x="'+(L-6)+'" y="'+(yy+4)+'" text-anchor="end">'+(max*i/4).toFixed(0)+'</text>';}
    entries.forEach((e,i)=>{const bh=e[1]/max*(H-T-B),x=L+barWidth*i+barWidth*.17;s+='<rect class="bar" x="'+x+'" y="'+(H-B-bh)+'" width="'+(barWidth*.66)+'" height="'+bh+'" rx="5"><title>Week of '+escape(e[0])+': '+fixed(e[1],1)+' miles logged</title></rect><text x="'+(x+barWidth*.33)+'" y="'+(H-11)+'" text-anchor="middle">'+escape(e[0].slice(5))+'</text>';});
    return s+"</svg>";
  }
  function renderCardio(){
    const type=el("kind-filter").value,query=el("search").value.trim().toLowerCase();
    const filtered=data.cardio.filter(x=>(type==="all"||x.activity_type===type)&&(!query||[x.date,x.notes,x.activity_type].join(" ").toLowerCase().includes(query))).sort((a,b)=>b.date.localeCompare(a.date)||b.session_id.localeCompare(a.session_id));
    el("cardio-list").innerHTML=filtered.length?filtered.map(cardioCard).join(""):'<div class="empty">No sessions match your filters.</div>';
  }
  function renderStrength(){
    const lookup=new Map(data.exercises.map(x=>[x.exercise_id,x])),filter=el("exercise-filter").value;
    const sets=data.sets.filter(x=>filter==="all"||x.exercise_id===filter).sort((a,b)=>b.date.localeCompare(a.date)||b.session_id.localeCompare(a.session_id)||Number(a.set_number)-Number(b.set_number));
    el("sets-table").innerHTML=sets.length?sets.map(x=>'<tr><td>'+escape(dateText(x.date))+'</td><td>'+escape(lookup.get(x.exercise_id)?.exercise_name||x.exercise_id)+'</td><td>'+escape(x.set_number)+'</td><td>'+escape(x.side||"—")+'</td><td>'+(number(x.weight_lb)!=null?escape(x.weight_lb)+" lb":"—")+'</td><td>'+(number(x.reps)!=null?escape(x.reps)+" reps":number(x.duration_seconds)!=null?escape(x.duration_seconds)+" sec":"—")+'</td><td>'+escape([x.effort,x.stop_reason,x.notes].filter(Boolean).join(" · ")||"—")+'</td></tr>').join(""):'<tr><td colspan="7">No sets match this filter.</td></tr>';
    const counts=new Map();data.sets.forEach(x=>{const ex=lookup.get(x.exercise_id);if(!ex)return;ex.primary_muscles.split(";").map(x=>x.trim()).filter(Boolean).forEach(m=>counts.set(m,(counts.get(m)||0)+1));});
    const groups=[...counts].sort((a,b)=>b[1]-a[1]),max=Math.max(1,...groups.map(x=>x[1]));
    el("muscle-chart").innerHTML=groups.length?groups.map(g=>'<div style="margin:15px 0"><div style="display:flex;justify-content:space-between;font-size:13px"><span>'+escape(g[0])+'</span><strong>'+g[1]+'</strong></div><div style="background:#293b4c;height:9px;border-radius:8px;margin-top:6px;overflow:hidden"><div style="background:var(--green);height:100%;width:'+(g[1]/max*100)+'%"></div></div></div>').join(""):'<div class="empty">No completed sets yet.</div>';
    el("historical-list").innerHTML=data.historical.length?data.historical.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(x=>'<article class="item"><div><time>'+escape(dateText(x.date))+'</time><h3>'+escape(lookup.get(x.exercise_id)?.exercise_name||"Dumbbell workout")+'</h3><p>'+escape(x.notes)+'</p><p>Missing: '+escape(x.missing_details)+'</p></div><span class="tag">Unquantified</span></article>').join(""):'<div class="empty">No historical notes.</div>';
  }
  function renderCatalog(){
    el("catalog-list").innerHTML=data.exercises.length?data.exercises.map(x=>'<article class="item"><div><h3>'+escape(x.exercise_name)+'</h3><p>Primary: '+escape(x.primary_muscles||"—")+'</p><p>Secondary: '+escape(x.secondary_muscles||"—")+'</p></div><div class="right"><span class="tag core">'+escape(x.equipment)+'</span><p>'+escape((x.weight_basis||"").replaceAll("_"," "))+'</p></div></article>').join(""):'<div class="empty">No exercise definitions yet.</div>';
  }
  function render(){
    el("loading").hidden=true;el("app").hidden=false;
    el("n-cardio").textContent=data.cardio.length;
    el("n-miles").textContent=fixed(data.cardio.reduce((n,x)=>n+(number(x.distance_mi)||0),0),1);
    el("n-vest").textContent=data.cardio.filter(x=>x.activity_type==="weighted_vest_walk").length;
    el("n-sets").textContent=data.sets.length;
    el("pace-chart").innerHTML=lineChart(data.cardio);el("week-chart").innerHTML=weekChart(data.cardio);
    const recent=data.cardio.slice().sort((a,b)=>b.date.localeCompare(a.date)||b.session_id.localeCompare(a.session_id)).slice(0,5);
    el("recent").innerHTML=recent.length?recent.map(cardioCard).join(""):'<div class="empty">No recent cardio sessions.</div>';
    const filter=el("exercise-filter"),previous=filter.value;filter.innerHTML='<option value="all">All exercises</option>'+data.exercises.map(x=>'<option value="'+escape(x.exercise_id)+'">'+escape(x.exercise_name)+'</option>').join("");if([...filter.options].some(o=>o.value===previous))filter.value=previous;
    renderCardio();renderStrength();renderCatalog();
  }
  document.querySelectorAll("[data-view]").forEach(button=>button.addEventListener("click",()=>{document.querySelectorAll("[data-view]").forEach(b=>b.setAttribute("aria-selected",String(b===button)));document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===button.dataset.view));}));
  el("kind-filter").addEventListener("change",renderCardio);el("search").addEventListener("input",renderCardio);el("exercise-filter").addEventListener("change",renderStrength);
  document.querySelectorAll("[data-csv]").forEach(input=>input.addEventListener("change",async()=>{const file=input.files?.[0];if(!file)return;try{data[input.dataset.csv]=parseCSV(await file.text());render();showNotice("Local CSV loaded. Select the other files to complete your dashboard.");}catch(error){showNotice("Unable to read "+file.name+": "+error.message);}}));
  Promise.all(Object.entries(filenames).map(async pair=>{const response=await fetch("./"+pair[1],{cache:"no-store"});if(!response.ok)throw Error(pair[1]+" returned HTTP "+response.status);return [pair[0],parseCSV(await response.text())];})).then(results=>{results.forEach(r=>data[r[0]]=r[1]);render();}).catch(error=>{el("loading").hidden=true;showNotice("CSV files could not be loaded automatically: "+error.message);el("offline").hidden=false;});
})();

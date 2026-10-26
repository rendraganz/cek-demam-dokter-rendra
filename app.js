(() => {
  "use strict";
  const SYMPTOMS = [
    ["G1","Demam"],["G2","Mual"],["G3","Muntah"],["G4","Lemas"],["G5","Mencret"],
    ["G6","Kejang"],["G7","Tenggorokan sakit"],["G8","Bintik merah"],["G9","Mimisan"],
    ["G10","Nyeri sendi"],["G11","Pusing"],["G12","Leukosit"],["G13","Hematokrit"],["G14","Trombosit"]
  ];
  const INITIAL_CASES = [
    {id:"P1",label:"DBD-I",vector:[1,0,0,0,0,0,0,1,0,0,0,1,1,1],source:"Referensi awal"},
    {id:"P2",label:"DBD-II",vector:[1,0,0,0,0,0,0,1,1,0,0,1,1,1],source:"Referensi awal"},
    {id:"P3",label:"DBD-III",vector:[1,0,0,0,0,0,0,1,1,1,0,1,1,1],source:"Referensi awal"},
    {id:"P4",label:"DBD-IV",vector:[1,0,0,0,0,1,0,0,0,1,0,1,1,1],source:"Referensi awal"}
  ];
  const KEYS = {cases:"vektorcbr_cases_v1",history:"vektorcbr_history_v1"};
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const clone = x => JSON.parse(JSON.stringify(x));
  const load = (key, fallback) => { try { const v=JSON.parse(localStorage.getItem(key)); return v ?? clone(fallback); } catch { return clone(fallback); } };
  let cases = load(KEYS.cases, INITIAL_CASES);
  let history = load(KEYS.history, []);
  let latest = null;

  function persist(){ localStorage.setItem(KEYS.cases,JSON.stringify(cases)); localStorage.setItem(KEYS.history,JSON.stringify(history)); updateStats(); }
  function count(v){ return v.reduce((a,b)=>a+b,0); }
  function cosine(a,b){ const dot=a.reduce((s,n,i)=>s+n*b[i],0); const na=Math.sqrt(a.reduce((s,n)=>s+n*n,0)); const nb=Math.sqrt(b.reduce((s,n)=>s+n*n,0)); return (na===0||nb===0)?0:dot/(na*nb); }
  function pct(n){ return (n*100).toFixed(2)+"%"; }
  function safe(s){ return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function vectorLabels(v){ return SYMPTOMS.filter((_,i)=>v[i]).map(x=>x[1]); }
  function renderSymptoms(){
    $("#symptomGrid").innerHTML=SYMPTOMS.map((s,i)=>`<label class="symptom-option"><input type="checkbox" name="symptom" value="${i}"><span><b>${s[0]}</b> · ${s[1]}</span></label>`).join("");
    $$('input[name="symptom"]').forEach(el=>el.addEventListener("change",()=>$("#selectedCount").textContent=`${$$('input[name="symptom"]:checked').length} indikator dipilih`));
  }
  function navigate(view){
    $$(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${view}`));
    $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
    const names={dashboard:"Dashboard",diagnosis:"Diagnosis",history:"Riwayat Diagnosis",knowledge:"Basis Kasus"};
    $("#pageTitle").textContent=names[view]||"Dashboard";
    $("#sidebar").classList.remove("open");
    if(view==="dashboard")renderDashboard();
    if(view==="history")renderHistory();
    if(view==="knowledge")renderKnowledge();
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function renderDashboard(){
    $("#caseOverview").innerHTML=cases.slice(0,8).map(c=>`<div class="case-chip"><div class="case-tag">${safe(c.id)}</div><div><strong>${safe(c.label)}</strong><small>${safe(c.source||"Kasus tersimpan")}</small></div><span class="count">${count(c.vector)} indikator</span></div>`).join("")||'<div class="empty-state">Belum ada kasus referensi.</div>';
    updateStats();
  }
  function updateStats(){ $("#statCases").textContent=cases.length; $("#statHistory").textContent=history.length; }
  function calculate(vector){
    return cases.map(c=>({caseId:c.id,label:c.label,score:cosine(vector,c.vector),dot:vector.reduce((s,n,i)=>s+n*c.vector[i],0),normNew:Math.sqrt(count(vector)),normOld:Math.sqrt(count(c.vector)),overlap:vector.reduce((s,n,i)=>s+(n&&c.vector[i]?1:0),0),caseVector:c.vector})).sort((a,b)=>b.score-a.score);
  }
  function renderResult(item){
    const rows=item.ranking.map((r,i)=>`<tr class="${i===0?"best-row":""}"><td>${i+1}</td><td><strong>${safe(r.caseId)}</strong></td><td>${safe(r.label)}</td><td><span class="score-track"><span class="score-fill" style="display:block;width:${Math.max(0,Math.min(100,r.score*100))}%"></span></span>${pct(r.score)}</td><td>${r.dot}</td><td>${r.overlap}</td></tr>`).join("");
    $("#resultArea").innerHTML=`<div class="result-card"><div class="result-top"><div><span class="result-kicker">HASIL RETRIEVE & REUSE</span><h3>Kasus paling mirip: ${safe(item.ranking[0]?.label||"Tidak tersedia")}</h3><p class="muted">Kasus referensi terdekat adalah ${safe(item.ranking[0]?.caseId||"—")} berdasarkan cosine similarity.</p></div><div class="result-score">${pct(item.ranking[0]?.score||0)}<small>similarity tertinggi</small></div></div><div class="divider"></div><p class="helper"><strong>Indikator dipilih:</strong> ${safe(vectorLabels(item.vector).join(", ")||"Tidak ada")}. Ini adalah hasil perbandingan matematis pada dataset contoh.</p><div class="result-actions"><button class="btn primary" id="goReview">Lanjut Revise & Retain →</button><button class="btn secondary" id="saveOnly">Simpan ke riwayat</button></div></div><div class="panel"><div class="panel-head"><div><h3>Detail perhitungan cosine similarity</h3><p class="muted">Dot product dibagi hasil kali panjang kedua vektor.</p></div></div><div class="table-wrap"><table><thead><tr><th>Rank</th><th>ID</th><th>Label kasus</th><th>Cosine</th><th>Dot product</th><th>Gejala cocok</th></tr></thead><tbody>${rows}</tbody></table></div><div class="divider"></div><p class="helper">Rumus: sim(x,y) = Σ(xᵢ × yᵢ) / (√Σxᵢ² × √Σyᵢ²). Nilai berkisar 0–1 untuk vektor biner ini. Jika semua indikator tidak dipilih, similarity ditetapkan 0.</p></div>`;
    $("#goReview").addEventListener("click",()=>{navigate("knowledge");renderReview();});
    $("#saveOnly").addEventListener("click",()=>{saveHistory(item);renderResult(item);});
  }
  function saveHistory(item){
    if(item.saved){alert("Hasil ini sudah tersimpan di riwayat.");return;}
    item.saved=true;
    history.unshift({id:"H"+Date.now(),name:item.name,age:item.age,gender:item.gender,date:new Date().toISOString(),selected:item.vector,ranking:item.ranking.map(r=>({caseId:r.caseId,label:r.label,score:r.score})),result:item.ranking[0]?.label||"Tidak tersedia",reviewLabel:item.reviewLabel||"",notes:item.notes||""});
    persist();renderHistory();alert("Hasil disimpan di riwayat lokal browser.");
  }
  function runDiagnosis(e){
    e.preventDefault();
    const vector=Array(14).fill(0); $$('input[name="symptom"]:checked').forEach(el=>vector[Number(el.value)]=1);
    if(count(vector)===0&&!confirm("Belum ada indikator dipilih. Tetap hitung dengan vektor kosong?"))return;
    const item={name:$("#personName").value.trim(),age:Number($("#personAge").value),gender:$("#personGender").value,vector,ranking:calculate(vector),saved:false,reviewLabel:"",notes:""};
    latest=item; renderResult(item);
    $("#resultArea").scrollIntoView({behavior:"smooth",block:"start"});
    renderReview();
  }
  function renderHistory(){
    $("#historyList").innerHTML=history.length?history.map(h=>`<div class="history-item"><div class="case-tag">H</div><div class="history-info"><strong>${safe(h.name)} · ${safe(h.result)}</strong><small>${new Date(h.date).toLocaleString("id-ID")} · ${safe(h.age)} tahun · ${safe(h.gender)} · ${count(h.selected||[])} indikator</small></div><span class="history-score">${pct(h.ranking?.[0]?.score||0)}</span><button data-delete="${safe(h.id)}" title="Hapus riwayat">Hapus</button></div>`).join(""):'<div class="empty-state"><strong>Belum ada riwayat</strong>Jalankan simulasi diagnosis untuk membuat entri pertama.</div>';
    $$("[data-delete]").forEach(b=>b.addEventListener("click",()=>{history=history.filter(h=>h.id!==b.dataset.delete);persist();renderHistory();}));
  }
  function renderKnowledge(){
    $("#knowledgeTable").innerHTML=`<div class="table-wrap"><table><thead><tr><th>ID</th><th>Label</th><th>Jumlah indikator</th><th>Asal kasus</th><th>Indikator aktif</th></tr></thead><tbody>${cases.map(c=>`<tr><td><strong>${safe(c.id)}</strong></td><td>${safe(c.label)}</td><td>${count(c.vector)}</td><td>${safe(c.source||"Retain lokal")}</td><td>${safe(vectorLabels(c.vector).join(", ")||"Tidak ada")}</td></tr>`).join("")}</tbody></table></div>`;
    renderReview();
  }
  function renderReview(){
    if(!latest){$("#reviewContent").innerHTML='<div class="empty-state">Jalankan simulasi diagnosis terlebih dahulu untuk meninjau dan menyimpan kasus.</div>';return;}
    const labels=["DBD-I","DBD-II","DBD-III","DBD-IV","Perlu tinjauan ahli"];
    $("#reviewContent").innerHTML=`<p class="helper" style="margin-bottom:16px">Kasus simulasi: <strong>${safe(latest.name)}</strong> · hasil reuse awal: <strong>${safe(latest.ranking[0]?.label||"—")}</strong> (${pct(latest.ranking[0]?.score||0)}). Tahap ini hanya demonstrasi alur.</p><div class="review-grid"><label>Label setelah tinjauan simulasi<select id="reviewLabel">${labels.map(l=>`<option ${l===(latest.reviewLabel||latest.ranking[0]?.label)?"selected":""}>${l}</option>`).join("")}</select></label><label>Catatan revisi (opsional)<textarea id="reviewNotes" placeholder="Contoh: label untuk demonstrasi kelas">${safe(latest.notes||"")}</textarea></label></div><div class="review-actions"><button class="btn secondary" id="applyRevision">Terapkan revisi</button><button class="btn primary" id="retainCase">Retain ke basis kasus lokal</button></div><p class="helper" style="margin-top:12px">Retain menambah kasus ke localStorage browser ini. Data tidak tersinkron dengan browser lain dan tidak dikirim ke dosen.</p>`;
    $("#applyRevision").addEventListener("click",()=>{latest.reviewLabel=$("#reviewLabel").value;latest.notes=$("#reviewNotes").value;alert("Revisi simulasi diterapkan. Perhitungan similarity asli tetap dapat dilihat di hasil diagnosis.");renderReview();});
    $("#retainCase").addEventListener("click",()=>{
      latest.reviewLabel=$("#reviewLabel").value;latest.notes=$("#reviewNotes").value;
      const id="L"+String(Date.now()).slice(-6);
      cases.push({id,label:latest.reviewLabel,vector:clone(latest.vector),source:"Retain lokal · "+latest.name,notes:latest.notes});
      persist();renderKnowledge();renderDashboard();saveHistory(latest);
      alert("Kasus ditambahkan ke basis kasus lokal browser ini.");
    });
  }
  $("#diagnosisForm").addEventListener("submit",runDiagnosis);
  $$(".nav-item").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.view)));
  $$("[data-go]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.go)));
  $("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
  $("#exportHistory").addEventListener("click",()=>{
    const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),history,cases},null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="dokterrendra-data.json";a.click();URL.revokeObjectURL(url);
  });
  $("#resetCases").addEventListener("click",()=>{if(confirm("Pulihkan basis kasus awal P1–P4? Kasus hasil Retain lokal akan dihapus.")){cases=clone(INITIAL_CASES);persist();renderKnowledge();renderDashboard();}});
  renderSymptoms();renderDashboard();renderHistory();renderKnowledge();persist();
})();
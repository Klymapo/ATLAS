(function atlasGame() {
  "use strict";
  const D = window.ATLAS_DEMO;
  const B = window.ATLAS_BLOCK1;
  const byId = (id) => document.getElementById(id);
  const root = byId("main-content");
  if (!root || !D || D.status !== "DEMO_ONLY_UNVERIFIED") {
    if (root) root.textContent = "No se pudo abrir el expediente de demostración.";
    return;
  }
  const KEY = "atlas-first-case-demo-v03";
  const routes = {office:"MI OFICINA",story:"BLOQUE 1",intro:"BIENVENIDA",learn:"APRENDER",investigation:"INVESTIGACIÓN",memory:"ENTRENAMIENTO",deck:"FICHAS",practice:"PRÁCTICA ESCRITA",progress:"PROGRESO"};
  const LANG = {fr:{name:"Francés",label:"FR",voice:"fr-FR"},de:{name:"Alemán",label:"DE",voice:"de-DE"},ru:{name:"Ruso",label:"RU",voice:"ru-RU"},ja:{name:"Japonés",label:"JA",voice:"ja-JP"}};
  const necessaryClues = D.clues.filter((c) => c.require).map((c) => c.id);
  function newBlock(){return {stage:0,inspected:[],observed:"",asked:[],method:"",alias:"",answer:"",complete:false};}
  function safeBlock(raw){
    const def=newBlock();
    if(!raw||typeof raw!=="object")return def;
    const stages=Array.isArray(B?.scenes)?B.scenes.length:6;
    return {
      stage:Number.isInteger(raw.stage)?Math.max(0,Math.min(stages-1,raw.stage)):0,
      inspected:Array.isArray(raw.inspected)?raw.inspected.filter(x=>["fecha","matasellos","placa","plano"].includes(x)):[],
      observed:["fecha","firma","origen"].includes(raw.observed)?raw.observed:"",
      asked:Array.isArray(raw.asked)?raw.asked.filter(x=>["quien","porqué","donde"].includes(x)):[],
      method:["observador","entrevistador","descifrador"].includes(raw.method)?raw.method:"",
      alias:typeof raw.alias==="string"?raw.alias.slice(0,40):"",
      answer:["libro","llave","sobre"].includes(raw.answer)?raw.answer:"",
      complete:raw.complete===true
    };
  }
  function initial(){return {visited:[],matched:[],turns:0,attempts:0,solved:false,sound:false,introSeen:false,lessonCompleted:false,lessonViewed:[],practiceAttempts:[],block1:newBlock()};}
  function load(){
    try{
      const parsed = JSON.parse(localStorage.getItem(KEY)||"null");
      if(!parsed || !Array.isArray(parsed.visited) || !Array.isArray(parsed.matched)) return initial();
      return {
        visited:parsed.visited.filter((id)=>D.clues.some((c)=>c.id===id)),
        matched:parsed.matched.filter((id)=>D.memoryPairs.some((p)=>p.id===id)),
        turns:Math.min(9999,Math.max(0,Number(parsed.turns)||0)),
        attempts:Math.min(9999,Math.max(0,Number(parsed.attempts)||0)),
        solved:parsed.solved===true,
        sound:parsed.sound===true,
        introSeen:parsed.introSeen===true,
        lessonCompleted:parsed.lessonCompleted===true,
        lessonViewed:Array.isArray(parsed.lessonViewed)?parsed.lessonViewed.filter((id)=>D.concepts.some((c)=>c.id===id)):[],
        practiceAttempts:Array.isArray(parsed.practiceAttempts)?parsed.practiceAttempts.filter(e=>e&&typeof e==="object"&&["fr","de","ru","ja"].includes(e.language)).slice(-500):[],
        block1:safeBlock(parsed.block1)
      };
    }catch(e){return initial();}
  }
  let state=load(),route="office",activeClue=null,answerId=null,flashIndex=0,selectedLang="fr",flipped=false,introStep=0,lessonStep=0,
      selection=[],locked=false,toastTimer=null,practiceIndex=0,practiceFeedback=null,practiceHintUsed=false;
  const pairs=D.memoryPairs.flatMap((p)=>{
    const c=D.concepts.find((x)=>x.id===p.concept);
    return [{id:p.id+"-en",pair:p.id,face:c.en,tag:"EN · base"},
            {id:p.id+"-tr",pair:p.id,face:c[p.lang].w,tag:LANG[p.lang].label}];
  });
  function shuffled(source){
    const a=source.slice();
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));const temp=a[i];a[i]=a[j];a[j]=temp;
    }
    return a;
  }
  let deck=shuffled(pairs);
  const esc=(s)=>String(s??"").replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const mastered=()=>state.matched.length===D.memoryPairs.length;
  const foundAll=()=>necessaryClues.every((id)=>state.visited.includes(id));
  const canSolve=()=>foundAll()&&mastered();
  const pct=()=>Math.round(((Math.min(state.visited.length,3)/3)*.4+(state.matched.length/4)*.4+(state.solved?1:0)*.2)*100);
  const look=(id)=>D.clues.find((c)=>c.id===id);
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){/* Browser storage may be disabled. */}}
  function notify(message) {
    const t=byId("toast"); if(!t)return;
    t.textContent=message; t.classList.add("visible");
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("visible"),3200);
  }
  function chirp(kind="good"){
    if(!state.sound) return;
    try{
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC) return;
      const ctx=new AC(); const oscillator=ctx.createOscillator();const gain=ctx.createGain();
      oscillator.type="sine";oscillator.frequency.value=kind==="good"?560:230;
      gain.gain.setValueAtTime(.025,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.18);
      oscillator.connect(gain);gain.connect(ctx.destination);
      oscillator.start();oscillator.stop(ctx.currentTime+.19);oscillator.onended=()=>ctx.close();
    }catch(e){/* Silent fallback */ }
  }
  const pill=()=>'<span class="status-pill">CASO 001 · '+(state.solved?"CERRADO":"EN CURSO")+'</span>';
  const toolbar=(title,subtitle)=>'<div class="page-heading"><div><span class="eyebrow">El Archivo / expediente de demostración</span><h1>'+esc(title)+'</h1><p class="lede">'+esc(subtitle)+'</p></div>'+pill()+'</div>';
  const progressBar=()=>'<div class="progressbar" aria-label="Progreso de misión"><div style="width:'+pct()+'%"></div></div>';
  function stages(){
    return '<div class="mission-stages" aria-label="Fases de misión">'+
      '<span class="stage '+(state.lessonCompleted?"complete":"current")+'">00 · Preparación '+(state.lessonCompleted?"✓":"")+'</span>'+
      '<span class="stage '+(foundAll()?"complete":state.lessonCompleted?"current":"")+'">01 · Investigación '+(foundAll()?"✓":"")+'</span>'+
      '<span class="stage '+(mastered()?"complete":foundAll()?"current":"")+'">02 · Memoria '+(mastered()?"✓":"")+'</span>'+
      '<span class="stage '+(state.solved?"complete":canSolve()?"current":"")+'">03 · Deducción '+(state.solved?"✓":"")+'</span></div>';
  }
  function footnote(){return '<div class="warning-rail"><span aria-hidden="true">◇</span><span>'+esc(D.disclaimer)+'</span></div>';}

  function introduction(){
    const scene=D.introduction[introStep];
    root.innerHTML=toolbar("Tu primer día en el Archivo","Sede central · Sala de expedientes · 22:40 h. Antes de investigar, necesitas saber quién te ha llamado.")+
      '<section class="intro-layout"><div class="intro-portrait card"><img src="./assets/nora-vale.svg" alt="Nora Vale, archivista del Archivo: ilustración vectorial minimalista"><span class="portrait-name">Nora Vale · Archivista</span></div>'+
      '<div class="card padded"><span class="eyebrow">PRESENTACIÓN · '+(introStep+1)+' DE '+D.introduction.length+'</span><h2>'+esc(scene.title)+'</h2>'+
      '<p class="story-quote intro-quote">«'+esc(scene.dialogue)+'»</p><p class="muted">'+esc(scene.context)+'</p>'+
      '<div class="mission-stages">'+D.introduction.map((_,i)=>'<span class="stage '+(i===introStep?"current":i<introStep?"complete":"")+'">'+(i+1)+'</span>').join("")+'</div>'+
      '<div class="actions"><button class="button" data-action="intro-next">'+(introStep===D.introduction.length-1?"Conocer las cuatro palabras →":"Continuar conversación →")+'</button>'+
      (introStep>0?'<button class="button outline" data-action="intro-prev">← Volver</button>':'')+'</div></div></section>'+footnote();
  }
  function audioButton(id,lang,extraClass=""){
    const word=D.concepts.find((c)=>c.id===id)?.[lang]?.w||"palabra";
    return '<button type="button" class="audio-inline '+extraClass+'" data-speak-word="'+esc(id)+'" data-speak-lang="'+esc(lang)+'" aria-label="Escuchar '+esc(word)+' en '+esc(LANG[lang]?.name||lang)+' (voz del navegador)" title="Escuchar pronunciación sintetizada">▶ <span>Escuchar</span></button>';
  }
  function preparation(){
    const c=D.concepts[lessonStep];
    root.innerHTML=toolbar("Antes de investigar, aprende las pistas","Nora te presenta cuatro conceptos. Cada uno aparece en inglés y sus equivalentes en francés, alemán, ruso y japonés.")+stages()+
      '<div class="lesson-grid"><section class="card padded"><span class="eyebrow">FICHA '+(lessonStep+1)+' DE '+D.concepts.length+' · VOCABULARIO INICIAL</span>'+
      '<div class="lesson-concept"><span class="concept-emblem" aria-hidden="true">'+esc(D.objectSymbols[c.id]||"◇")+'</span><div><span class="eyebrow">ENGLISH · IDIOMA PIVOTE</span><h2>'+esc(c.en)+'</h2><p>En español: <strong>'+esc(c.es)+'</strong></p></div></div>'+
      '<p class="muted">Lee las cuatro equivalencias. Pulsa el audio al lado de cada palabra si tu navegador dispone de voz en ese idioma.</p>'+
      '<div class="translation-list">'+Object.entries(LANG).map(([lang,l])=>'<div class="translation-row"><div><span class="translation-locale">'+l.label+' · '+esc(l.name)+'</span><div class="translation-word">'+esc(c[lang].w)+'</div><span class="translation-reading">'+esc(c[lang].reading||c[lang].hint||"")+'</span></div>'+audioButton(c.id,lang)+'</div>').join("")+'</div>'+
      '<div class="actions"><button class="button" data-action="lesson-next">'+(lessonStep===D.concepts.length-1?"Terminar preparación e investigar →":"Ya la estudié · Siguiente →")+'</button>'+
      (lessonStep>0?'<button class="button outline" data-action="lesson-prev">← Anterior</button>':'')+'</div>'+
      '<p class="muted small">La preparación no es un examen: tendrás las fichas disponibles para repasar cuando quieras.</p></section>'+
      '<aside class="card padded"><span class="eyebrow">NOTAS DE NORA</span><h2>Primero aprender. Después recordar.</h2>'+
      '<p>En el Archivo no te pediré traducir palabras que todavía no has visto.</p>'+
      '<p>Estas cuatro palabras aparecen en las cartas y objetos de nuestro primer caso. Memorízalas de forma visual y compara sus sonidos.</p>'+
      '<div class="divider"></div><p class="muted">Avance de preparación: '+Math.max(state.lessonViewed.length,lessonStep)+'/'+D.concepts.length+' palabras recorridas.</p>'+
      '<button class="button outline small" data-route="deck">Consultar fichas de estudio</button></aside></div>'+footnote();
  }
  function office(){
  const P=window.ATLAS_PRACTICE;
  const summaries=P?P.summary(state.practiceAttempts):{};
  const stats=Object.entries(LANG).map(([id,x])=>({id,label:x.name,count:summaries[id]?.correct_independent||0,attempts:summaries[id]?.attempts||0}));
  const activeCase=!state.solved;
  const alias=state.block1.alias||"Investigador";
  const storyStep=state.block1.complete?"Bloque completado":`Escena ${state.block1.stage+1} de ${B?.scenes.length||6}`;
  const heroAction=state.block1.complete?"Volver al expediente":"Continuar el Bloque 1";
  const caseAction=state.introSeen?(state.lessonCompleted?"investigation":"learn"):"intro";
  const nextLearning=!state.lessonCompleted?
     {label:"Primero, conoce las cuatro palabras",route:"learn",description:"Pronunciación y comparaciones FR / DE / RU / JA"}:
     state.matched.length<4?
     {label:"Pon a prueba tu memoria",route:"memory",description:"Recuerda las cuatro parejas sin consultar las fichas"}:
     {label:"Practica sin ver la respuesta",route:"practice",description:"Escribe vocabulario y artículos; tus errores guían el repaso"};
  const lastText=state.block1.complete?"La primera puerta se abrió. Ahora el expediente de la llave te espera.":
   state.block1.stage===0?"La invitación tiene una fecha imposible. Elige qué investigar.":"Nora aguarda tu próximo movimiento.";
  root.innerHTML=`<div class="hub-wrapper">
    <div class="hub-overline"><span class="hub-live-dot"></span> Sede central · Archivo Internacional · Puerto Umbral <span class="hub-datetime">ESTACIÓN DE INVESTIGACIÓN</span></div>
    <section class="hero hub-hero" aria-label="Portada del Archivo">
      <div class="hero-copy">
        <span class="eyebrow">BIENVENIDO, ${esc(alias.toUpperCase())}</span>
        <h1>Hay una carta<br><em>esperando.</em></h1>
        <div class="goldline"></div>
        <p>Algunos misterios empiezan con una ausencia. El tuyo empezó con una carta fechada mañana.</p>
        <div class="actions">
          <button class="button hub-main-cta" data-route="story">${esc(heroAction)} <span aria-hidden="true">↗</span></button>
          <button class="button outline hub-secondary-cta" data-route="${caseAction}">${state.introSeen?"Ir al caso 001":"Conocer a Nora (guía)"}</button>
        </div>
      </div>
      <div class="hero-art"><img src="./assets/office.svg" alt="Oficina vectorial del Archivo con librería y documentos"><div class="hub-art-stamp">ARCHIVO / Nº 001</div></div>
    </section>
    <div class="hub-section-head"><div><span class="eyebrow">TU MESA DE TRABAJO</span><h2>Todo está listo para continuar</h2></div><span class="hub-caption">${esc(storyStep)}</span></div>
    <div class="hub-grid">
      <section class="card hub-mission hub-large">
        <div class="hub-card-heading"><span class="hub-icon-circle">✦</span><div><span class="eyebrow">HISTORIA EN CURSO</span><h3>${esc(B?.title||"La firma del día siguiente")}</h3></div></div>
        <p>${esc(lastText)}</p>
        <div class="hub-timeline"><span class="hub-meter-label">${esc(storyStep)}</span><div class="progressbar"><div style="width:${state.block1.complete?100:Math.round((state.block1.stage+1)/(B?.scenes.length||6)*100)}%"></div></div></div>
        <button class="button small" data-route="story">${state.block1.complete?"Releer historia":"Abrir expediente narrativo"} →</button>
      </section>
      <section class="card hub-mission">
        <div class="hub-card-heading"><span class="hub-icon-circle">◇</span><div><span class="eyebrow">CASO PRINCIPAL</span><h3>${esc(D.storyline.title)}</h3></div></div>
        <p>Detecta una contradicción y explica qué puedes demostrar con las pruebas disponibles.</p>
        ${progressBar()}<small class="muted">Caso: ${pct()} % · ${state.visited.filter(x=>necessaryClues.includes(x)).length}/3 pistas obligatorias</small>
        <div class="actions"><button class="button outline small" data-route="${caseAction}">${activeCase?"Abrir investigación":"Revisar caso resuelto"} →</button></div>
      </section>
      <section class="card hub-mission">
        <div class="hub-card-heading"><span class="hub-icon-circle">✎</span><div><span class="eyebrow">SIGUIENTE ENTRENAMIENTO</span><h3>${esc(nextLearning.label)}</h3></div></div>
        <p>${esc(nextLearning.description)}</p>
        <div class="actions"><button class="button small" data-route="${nextLearning.route}">Continuar aprendiendo →</button></div>
      </section>
    </div>
    <div class="hub-section-head"><div><span class="eyebrow">TU APRENDIZAJE</span><h2>Cuatro lenguas, una investigación</h2></div><button class="button outline small" data-route="progress">Ver progreso →</button></div>
    <div class="hub-languages">
      ${stats.map(item=>`<button type="button" class="hub-lang-card" data-hub-language="${item.id}" aria-label="Practicar ${esc(item.label)}">
        <span class="hub-lang-code">${item.id.toUpperCase()}</span>
        <span class="hub-lang-name">${esc(item.label)}</span>
        <strong>${item.count}</strong><small>aciertos sin ayuda</small>
        <span class="hub-lang-arrow">↗</span>
      </button>`).join("")}
    </div>
    <div class="hub-lower">
      <section class="card hub-nora"><div class="hub-nora-avatar"><img src="./assets/nora-vale.svg" alt="Nora Vale, archivista del Archivo"></div><div>
        <span class="eyebrow">MENSAJE DE NORA VALE</span><h2>«Una respuesta correcta no es lo mismo que entender».</h2>
        <p>Vamos a revisar lo que sabes, volver sobre los errores y utilizar cada palabra en una investigación de verdad.</p>
        <button class="button outline small" data-route="practice">Practicar recuperación →</button></div></section>
      <section class="card hub-tools"><span class="eyebrow">ACCESO RÁPIDO</span><h3>Herramientas del investigador</h3>
        <button data-route="deck">▤ <span>Fichas y pronunciación</span> <span>→</span></button>
        <button data-route="memory">▦ <span>Juego de memoria</span> <span>→</span></button>
        <button data-route="progress">◷ <span>Progreso y respaldos</span> <span>→</span></button>
        <button data-action="install-pwa">↗ <span>Instalar como aplicación</span> <span>→</span></button>
      </section>
    </div>
    <p class="hub-ethics">Edición de demostración · El contenido narrativo y lingüístico aún está pendiente de revisión. Los aciertos no representan niveles certificados.</p>
  </div>`;
}
  function story(){
  if(!B||!Array.isArray(B.scenes)){root.textContent="El bloque narrativo no está disponible.";return;}
  const st=state.block1,scene=B.scenes[st.stage];
  const hasWrittenRecall=state.practiceAttempts.some(e=>e.correct===true&&e.hint_used===false);
  if(!scene){root.textContent="No existe esta escena.";return;}
  const objIds=Array.isArray(scene.objects)?scene.objects.map(x=>x.id):[];
  const checked=objIds.every(id=>st.inspected.includes(id));
  let interactions="";
  if(scene.id==="sobre"){
    interactions=`<div class="story-investigate"><h3>Examina el sobre</h3><p class="muted">Toca ambas partes de la carta antes de formular tu hipótesis.</p>
      <div class="story-object-grid">${scene.objects.map(x=>`<button class="story-object" data-story-inspect="${x.id}"><span class="story-object-icon">⌕</span><strong>${esc(x.name)}</strong><small>${st.inspected.includes(x.id)?"✓ Examinado":"Inspeccionar →"}</small></button>`).join("")}</div>
      ${scene.objects.filter(x=>st.inspected.includes(x.id)).map(x=>`<div class="story-evidence"><span>${esc(x.name)}</span><strong>${esc(x.headline)}</strong><p>${esc(x.detail)}</p></div>`).join("")}
      ${checked?`<h3>¿Qué anotarías en el cuaderno?</h3><div class="story-choices">${scene.questions.map(q=>`<button class="story-choice ${st.observed===q.id?"selected":""}" data-story-observation="${q.id}">${esc(q.text)}</button>`).join("")}</div>
      ${st.observed?`<div class="story-consequence"><b>${esc(scene.questions.find(x=>x.id===st.observed)?.tag||"")}</b><p>${esc(scene.questions.find(x=>x.id===st.observed)?.reply||"")}</p></div>`:""}`:""}</div>`;
  }else if(scene.id==="puerto"){
    interactions=`<div class="story-investigate"><h3>Explora la entrada del Archivo</h3>
      <div class="story-object-grid">${scene.objects.map(x=>`<button class="story-object" data-story-inspect="${x.id}"><span class="story-object-icon">▣</span><strong>${esc(x.name)}</strong><small>${st.inspected.includes(x.id)?"✓ Examinado":"Examinar →"}</small></button>`).join("")}</div>
      ${scene.objects.filter(x=>st.inspected.includes(x.id)).map(x=>`<div class="story-evidence"><span>${esc(x.name)}</span><strong>${esc(x.headline)}</strong><p>${esc(x.detail)}</p></div>`).join("")}</div>`;
  }else if(scene.id==="nora"){
    interactions=`<div class="story-investigate"><h3>Habla con Nora</h3><p class="muted">Puedes preguntarle varias cosas. Necesitas saber quién es y por qué estás aquí.</p>
      <div class="story-choices">${scene.questions.map(q=>`<button class="story-choice ${st.asked.includes(q.id)?"selected":""}" data-story-question="${q.id}">${esc(q.text)}</button>`).join("")}</div>
      ${scene.questions.filter(q=>st.asked.includes(q.id)).map(q=>`<div class="story-consequence"><b>${esc(q.tag)}</b><p>${esc(q.reply)}</p></div>`).join("")}</div>`;
  }else if(scene.id==="identidad"){
    interactions=`<div class="story-investigate"><h3>Tu ficha de ingreso</h3><label for="story-alias">Nombre o alias (opcional)</label>
      <input id="story-alias" maxlength="40" placeholder="Investigador/a" value="${esc(st.alias)}" autocomplete="off">
      <p class="muted">¿Con qué método prefieres empezar? No restringe ninguna clase o idioma.</p>
      <div class="story-methods">${scene.methods.map(m=>`<button class="story-method ${st.method===m.id?"selected":""}" data-story-method="${m.id}"><strong>${esc(m.name)}</strong><small>${esc(m.desc)}</small></button>`).join("")}</div>
      ${st.method?`<div class="story-consequence">${esc(scene.responses[st.method])}</div>`:""}</div>`;
  }else if(scene.id==="registro"){
    interactions=`<div class="story-investigate"><div class="story-evidence story-register"><span>ARCHIVO CENTRAL · REGISTRO Nº 417</span><strong>INVITACIÓN A INVESTIGADOR AUXILIAR</strong><p>Remitente: [sin consignar] · Entrada: registrada antes de su asignación.</p></div>
      ${!state.lessonCompleted?`<div class="story-learning-gate"><h3>Primero las palabras</h3><p>Antes de usar este registro, Nora quiere que aprendas los cuatro objetos. Las fichas y el audio siguen disponibles.</p><button class="button" data-route="${state.introSeen?"learn":"intro"}">${state.introSeen?"Estudiar las cuatro palabras":"Conocer a Nora y estudiar"} →</button></div>`:
      `<h3>${esc(scene.prompt.question)}</h3><div class="story-choices">${scene.prompt.options.map(o=>`<button class="story-choice ${st.answer===o.id?"selected":""}" data-story-answer="${o.id}">${esc(o.text)}</button>`).join("")}</div>
       ${st.answer?`<div class="story-consequence"><p>${st.answer==="libro"?"Sí. Has identificado el objeto en inglés. Todavía queda interpretar el registro.":"Aún no. «Book» significa «libro». Puedes revisar tus fichas si necesitas ayuda."}</p></div>`:""}`}</div>`;
  }else{
    interactions=`<div class="story-conclusion"><span class="eyebrow">EL EXPEDIENTE CONTINÚA</span><h3>Una puerta se abre. Ninguna respuesta es definitiva.</h3>
      <p>${esc(scene.hook||"")}</p><div class="actions"><button class="button" data-route="investigation">Investigar la llave equivocada →</button>
      <button class="button outline" data-action="story-restart">Releer el Bloque 1</button></div></div>`;
  }
  if(scene.id==="registro"&&state.lessonCompleted){
    interactions+=`<div class="story-learning-gate"><h3>Una recuperación sin mirar</h3><p>${hasWrittenRecall?"✓ Has completado una práctica escrita correcta sin pistas. Es un primer recuerdo, todavía no aprendizaje duradero.":"Antes de cerrar esta parte del expediente, recupera correctamente una palabra de cualquiera de los cuatro idiomas sin usar pistas. No basta con reconocer la tarjeta."}</p><button class="button outline" data-route="practice">${hasWrittenRecall?"Practicar otra vez":"Ir a práctica escrita"} →</button></div>`;
  }
  const allowed=scene.id==="sobre"?checked&&!!st.observed:
    scene.id==="puerto"?checked:
    scene.id==="nora"?st.asked.includes("quien")&&st.asked.includes("porqué"):
    scene.id==="identidad"?!!st.method:
    scene.id==="registro"?state.lessonCompleted&&st.answer==="libro"&&hasWrittenRecall:false;
  root.innerHTML=`<div class="story-page">
    <div class="story-heading"><span class="eyebrow">EL ARCHIVO DE LAS CUATRO VOCES / BLOQUE 1</span><span class="story-count">${st.stage+1} / ${B.scenes.length}</span></div>
    <div class="story-meter"><div style="width:${Math.round((st.stage+1)/B.scenes.length*100)}%"></div></div>
    <div class="story-layout"><article class="story-article"><span class="eyebrow">${esc(scene.eyebrow)}</span>
      <h1>${esc(scene.title)}</h1><span class="story-scenetag">${esc(scene.label)}</span>
      ${scene.paragraphs.map(p=>`<p>${esc(p)}</p>`).join("")}
      ${interactions}
      <div class="story-footer"><button class="button outline" data-route="office">← Volver al HUB</button>
      ${st.stage>0?`<button class="button outline" data-action="story-back">Escena anterior</button>`:""}
      ${scene.id!=="cierre"?`<button class="button" data-action="story-next" ${allowed?"":"disabled"}>Continuar relato →</button>`:""}</div>
      ${!allowed&&scene.id!=="cierre"?'<p class="muted small">Completa la interacción de esta escena para continuar.</p>':""}
      <div class="notes">Narrativa de demostración en revisión. Las decisiones se guardan en tu dispositivo; ningún avance equivale a una certificación lingüística.</div>
    </article><aside class="story-aside"><div class="story-aside-panel">
      <img src="./assets/${scene.id==="nora"?"nora-vale.svg":"office.svg"}" alt="${scene.id==="nora"?"Ilustración vectorial de Nora Vale":"Oficina vectorial del Archivo"}">
      <span class="eyebrow">CUADERNO DEL INVESTIGADOR</span><h3>${esc(st.alias||"Investigador auxiliar")}</h3>
      <p>Puerto Umbral · Archivo Central</p><div class="divider"></div>
      <small class="muted">HECHOS REUNIDOS</small>
      <ul class="story-fieldnotes"><li>Sobre con emisión posterior al matasellos</li>${st.observed?`<li>Primera interpretación: ${esc(st.observed)}</li>`:""}
      ${st.asked.includes("quien")?'<li>Nora Vale, archivista responsable de la inducción</li>':""}
      ${st.method?`<li>Método inicial: ${esc(st.method)}</li>`:""}</ul>
    </div></aside></div></div>`;
}
  function exhibit(clue){
    const e=clue.exhibit;
    if(!e)return "";
    return '<div class="exhibit" aria-label="Prueba visible: '+esc(e.title)+'">'+
      '<span class="exhibit-kicker">'+esc(e.category)+'</span>'+
      '<div class="exhibit-paper exhibit-'+esc(e.kind)+'"><span class="exhibit-stamp">ATLAS · PRUEBA '+esc(clue.id.toUpperCase())+'</span>'+
      '<div class="exhibit-title">'+esc(e.title)+'</div>'+
      '<div class="exhibit-mark">'+esc(e.mark)+'</div>'+
      '<div class="exhibit-annotation">'+esc(e.detail)+'</div></div>'+
      '<p class="exhibit-conclusion">'+esc(clue.text)+'</p></div>';
  }
  function evidence(){
    return '<ul class="evidence-list">'+D.clues.map((c)=>{
      const seen=state.visited.includes(c.id);
      return '<li class="'+(seen?"opened":"locked")+'">'+(seen?'✓ '+esc(c.evidence):'◌ Pista por descubrir')+'</li>';
    }).join("")+'</ul>';
  }
  function investigation(){
    const clue=look(activeClue);
    const sidebar = clue?
       '<div class="message-panel" id="evidence-focus"><div class="meta">EVIDENCIA ENCONTRADA</div><h3>'+esc(clue.name)+'</h3>'+exhibit(clue)+'<span class="muted">Objeto relacionado: <b>'+esc(clue.english)+'</b></span><div class="actions"><button class="button small" data-route="deck">Ver ficha →</button></div></div>'
       :'<div id="evidence-focus"><img class="story-face" src="./assets/nora-vale.svg" alt="Nora Vale, archivista del Archivo"><span class="eyebrow">INSTRUCCIONES DE NORA</span><h3>Inspecciona el lugar</h3><p>Estás en la oficina central del Archivo. Toca las marcas doradas para examinar documentos, una llave y un libro. Las pruebas aparecerán aquí, no solo sus nombres.</p></div>';
    let next='';
    if(state.solved)next='<div class="success-panel"><span class="eyebrow">CASO 001 · CERRADO</span><h2>Una contradicción resuelta</h2><p>'+esc(D.storyline.outro)+'</p><button class="button" data-route="progress">Ver expediente y estadísticas →</button></div>';
    else if(canSolve())next='<section class="card solve-card"><span class="eyebrow">FASE 03 · RAZONAMIENTO</span><h2>La deducción final</h2><p>Tienes las pruebas y has recuperado las cuatro parejas de memoria. Puedes analizar el expediente.</p><button class="button" data-action="show-deduction">Resolver expediente →</button></section>';
    else next='<section class="card padded"><h3>Cómo avanzar</h3><p class="muted">Encuentra las tres pistas y completa las cuatro parejas de memoria. El orden es libre.</p><div class="actions"><button class="button outline" data-route="memory">Abrir juego de memoria</button><button class="button outline" data-route="deck">Repasar vocabulario</button><button class="button outline" data-route="practice">Practicar escritura</button></div></section>';
    root.innerHTML=toolbar("La llave equivocada","Inspecciona la oficina, localiza el mensaje y recupera la relación entre palabras antes de resolver el misterio.")+stages()+
    '<div class="scene-layout"><div><div class="scene-board" role="group" aria-label="Oficina con cuatro objetos interactivos">'+
    '<img src="./assets/office.svg" alt="Biblioteca con una estantería, tablero de pistas, escritorio y ventana iluminada">'+
    D.clues.map((c)=>'<button class="hotspot '+(state.visited.includes(c.id)?"visited":"")+'" style="left:'+esc(c.position.left)+';top:'+esc(c.position.top)+'" data-clue="'+esc(c.id)+'" aria-label="Inspeccionar '+esc(c.name)+'" title="'+esc(c.name)+'"><span aria-hidden="true">'+(state.visited.includes(c.id)?"✓":"✦")+'</span><span class="hotspot-name">'+esc(c.label)+'</span></button>').join("")+'</div><p class="muted small" style="margin-top:11px">Las marcas son botones: también puedes navegar con el teclado.</p></div>'+
    '<aside class="card story-panel"><span class="eyebrow">CUADERNO DE CAMPO</span>'+sidebar+'<div class="divider"></div><h3>Pruebas reunidas</h3>'+evidence()+'</aside></div><div style="margin-top:22px">'+next+'</div>'+footnote();
  }
  function memory(){
    const complete=mastered();
    root.innerHTML=toolbar("Parejas de memoria","Ya viste las cuatro palabras con Nora. Ahora encuentra su equivalencia en las tarjetas sin mirar las respuestas.")+stages()+
    '<div class="memory-top"><div><h2>Archivo de asociación</h2><p class="muted">Destapa dos tarjetas. Si no coinciden, podrás volver a probar.</p></div><span class="evidence-counter">'+state.matched.length+'/4 parejas · '+state.turns+' intentos</span></div>'+
    '<div class="memory-grid" role="group" aria-label="Tarjetas de memoria">'+deck.map((c,index)=>{
      const matched=state.matched.includes(c.pair),open=matched||selection.some((x)=>x.id===c.id);
      return '<button class="memory-card '+(matched?"matched":open?"revealed":"")+'" data-card="'+esc(c.id)+'" aria-label="'+(open?esc(c.face)+' '+esc(c.tag):"Tarjeta oculta "+(index+1))+'" aria-pressed="'+(open?"true":"false")+'" '+(matched?'disabled':'')+'>'+
        (open?'<div><span class="face-word">'+esc(c.face)+'</span><span class="face-lang">'+esc(c.tag)+'</span></div>':'<span class="back-mark" aria-hidden="true">✦</span>')+'</button>';
    }).join("")+'</div>'+
    '<section class="memory-panel">'+(complete?'<h3>¡Las cuatro parejas están completas!</h3><p>Esta actividad evalúa asociación visual, no pronunciación ni escritura. Para practicar el uso real, abre las fichas y las frases de ejemplo.</p>':
    '<h3>Sin cronómetro ni pérdida de vidas</h3><p class="muted">¿No recuerdas una palabra? Puedes volver a la preparación, estudiar las cuatro fichas y regresar. El progreso ya logrado se conserva.</p><button class="button outline small" data-route="learn">Repasar antes de continuar</button><button class="button outline small" data-route="practice">Escribir sin mirar</button>')+
    '<div class="actions"><button class="button '+(complete?"":"outline")+'" data-route="investigation">'+(complete?"Regresar al caso →":"Volver a investigar")+'</button>'+
    '<button class="button outline" data-action="restart-memory">Barajar y reiniciar parejas</button></div></section>'+footnote();
  }
  function deckView(){
    const c=D.concepts[flashIndex],gl=c[selectedLang],reading=gl.reading||gl.hint||"",
    meaning=flipped?'<span class="card-number">'+esc(LANG[selectedLang].name)+' / '+esc(c.en)+'</span><div class="word-with-audio"><div class="big-word">'+esc(gl.w)+'</div>'+audioButton(c.id,selectedLang)+'</div><div class="reading">'+esc(reading)+'</div><div class="translation">'+esc(c.es)+'</div>':
      '<span class="card-number">ENGLISH / '+esc(c.es)+'</span><div class="big-word">'+esc(c.en)+'</div><div class="reading">Toca para recordar cómo se dice en '+esc(LANG[selectedLang].name)+'.</div>';
    root.innerHTML=toolbar("Mi colección de fichas","Una misma idea, cuatro lenguas. Recuerda primero la palabra sin mirar su traducción.")+
    '<div class="language-panel" role="group" aria-label="Idioma de la tarjeta">'+Object.keys(LANG).map((code)=>
      '<button class="lang-chip '+(code===selectedLang?"active":"")+'" data-lang="'+code+'" aria-pressed="'+(code===selectedLang?'true':'false')+'">'+LANG[code].label+' · '+esc(LANG[code].name)+'</button>').join("")+'</div>'+
    '<div class="flashcard '+(flipped?"flipped":"")+'" aria-live="polite">'+meaning+
    '<button class="button outline small" data-action="flip-card">'+(flipped?"Ocultar respuesta":"Voltear tarjeta")+'</button></div>'+
    '<div class="actions"><button class="button outline" data-action="prev-flash">← Anterior</button><span class="evidence-counter">Ficha '+(flashIndex+1)+' de '+D.concepts.length+'</span>'+
    '<button class="button" data-action="next-flash">Siguiente →</button></div>'+
    '<div class="divider"></div><h2>Comparación completa</h2><div class="grid-2">'+
    Object.entries(LANG).map(([code,lang])=>'<div class="card padded"><span class="eyebrow">'+lang.label+' · '+esc(lang.name)+'</span><div class="word-with-audio"><h3>'+esc(c[code].w)+'</h3>'+audioButton(c.id,code)+'</div><p class="muted">'+esc(c[code].reading||c[code].hint||"")+'</p></div>').join("")+'</div>'+
    '<div class="actions"><button class="button" data-route="practice">Practicar sin ver respuestas →</button><button class="button outline" data-action="download-vocab">Descargar vocabulario CSV</button><button class="button outline" data-action="print-cards">Imprimir fichas y ejercicios</button></div>'+footnote();
  }
  function deduction(){
    const chosen=D.deduction.options.find((x)=>x.id===answerId);
    root.innerHTML=toolbar("La última deducción","Nora necesita una explicación respaldada por las pistas encontradas.")+stages()+
    '<section class="card solve-card"><span class="eyebrow">INFORME DEL INVESTIGADOR</span><h2>'+esc(D.deduction.question)+'</h2><p class="muted">Puedes volver al escenario y revisar el cuaderno tantas veces como quieras.</p>'+
    D.deduction.options.map((o)=>'<button data-answer="'+o.id+'" class="assessment-option '+(chosen&&o.id===chosen.id?(chosen.correct?"correct":"incorrect"):"")+'" '+(state.solved?"disabled":"")+'><span class="number-badge">'+esc(o.id.toUpperCase())+'</span><span>'+esc(o.text)+'</span></button>').join("")+
    (chosen?'<div class="feedback '+(chosen.correct?"":"error")+'" role="status"><strong>'+ (chosen.correct?"Deducción correcta.":"Todavía no.")+'</strong><br>'+esc(chosen.why)+'</div>':'')+
    '<div class="actions"><button class="button outline" data-route="investigation">Volver a examinar</button>'+(state.solved?'<button class="button" data-route="progress">Ver caso cerrado →</button>':'')+'</div></section>'+footnote();
  }

  function practice(){
    const P=window.ATLAS_PRACTICE;
    if(!P){root.innerHTML=toolbar("Práctica no disponible","El motor de recuperación no ha cargado.");return;}
    const questions=P.questions(D.concepts,selectedLang);
    const q=questions[practiceIndex%questions.length];
    const score=P.summary(state.practiceAttempts)[selectedLang];
    const hint=practiceHintUsed?(q.needsArticle?
      'Pista: el artículo empieza por «'+esc(q.expected.split(" ")[0][0])+'».':
      'Pista: la primera letra o carácter es «'+esc(q.expected[0])+'».'):"";
    const feedback=practiceFeedback?
      '<div class="practice-notice '+(practiceFeedback.correct?"success":"fail")+'" role="status"><strong>'+
      (practiceFeedback.correct?"¡Correcto en este intento!":"Aún no es la respuesta completa.")+'</strong><p>'+
      esc(practiceFeedback.message)+'</p><p>Respuesta de referencia: <strong>'+esc(q.expected)+'</strong></p>'+
      '<p class="muted">Este resultado es práctica de una ficha provisional, no certificación de dominio.</p></div>':"";
    root.innerHTML=toolbar("Práctica de recuperación","Escribe sin mirar las tarjetas. ATLAS registra aciertos, errores y ayudas por idioma, sin convertirlos automáticamente en nivel certificado.")+
      '<div class="language-panel" role="group" aria-label="Elegir idioma">'+Object.entries(LANG).map(([l,v])=>
      '<button class="lang-chip '+(l===selectedLang?"active":"")+'" data-practice-lang="'+l+'" aria-pressed="'+(l===selectedLang)+'">'+esc(v.name)+'</button>').join("")+'</div>'+
      '<div class="practice-layout"><section class="card padded">'+
      '<span class="eyebrow">ENGLISH → '+esc(LANG[selectedLang].name.toUpperCase())+' · PREGUNTA '+(practiceIndex%questions.length+1)+'/'+questions.length+'</span>'+
      '<p>En español: '+esc(q.spanish)+'</p><div class="practice-question">'+esc(q.prompt)+'</div>'+
      '<form id="practice-form" class="practice-form"><label for="practice-answer">Escribe la traducción'+(q.needsArticle?" con su artículo":"")+'</label>'+
      '<input id="practice-answer" name="answer" autocomplete="off" autocapitalize="off" spellcheck="false" required placeholder="'+
      (selectedLang==="ja"?"Puedes usar kana o kanji":selectedLang==="ru"?"Escribe en cirílico":"Escribe la palabra completa")+'">'+
      '<div class="actions"><button type="submit" class="button">Comprobar respuesta</button>'+
      '<button type="button" class="button outline" data-action="practice-hint">Pedir una pista</button></div></form>'+
      (hint?'<p class="practice-notice">'+hint+' (usar ayuda no cuenta como recuerdo independiente)</p>':"")+
      feedback+
      '<div class="actions"><button class="button outline" data-action="practice-next">Otra palabra →</button>'+
      '<button class="button outline" data-route="deck">Revisar fichas</button></div></section>'+
      '<aside class="card padded"><span class="eyebrow">INFORME DE APRENDIZAJE · DEMO</span><h2>Tu progreso en '+esc(LANG[selectedLang].name)+'</h2>'+
      '<div class="practice-stats"><div class="practice-stat"><b>'+score.attempts+'</b> respuestas registradas</div>'+
      '<div class="practice-stat"><b>'+score.correct_independent+'</b> aciertos sin ayuda</div>'+
      '<div class="practice-stat"><b>'+score.guided+'</b> prácticas con pistas</div>'+
      '<div class="practice-stat"><b>0</b> logros lingüísticos certificados</div></div>'+
      '<div class="divider"></div><p class="muted">Una palabra escrita correctamente una vez no demuestra retención a largo plazo. Más adelante ATLAS la preguntará en frases y días diferentes.</p></aside></div>'+footnote();
  }
  function practiceDashboard(){
    const P=window.ATLAS_PRACTICE;
    if(!P)return "";
    const summary=P.summary(state.practiceAttempts);
    const now=new Date().toDateString();
    const today=state.practiceAttempts.filter(e=>new Date(e.at).toDateString()===now).length;
    const latest=new Map();
    state.practiceAttempts.forEach(e=>latest.set(e.id,e));
    const due=[...latest.values()].filter(e=>e.due_at&&Date.parse(e.due_at)<=Date.now()).length;
    return '<section class="card padded" style="margin-top:18px"><span class="eyebrow">REGISTRO DE PRÁCTICA ESCRITA · DEMOSTRACIÓN</span>'+
      '<h2>Progreso diario por idioma</h2><p class="muted">Hoy: '+today+' intentos · '+due+' palabras listas para volver a practicar. Los aciertos son registros, no un porcentaje de fluidez.</p>'+
      '<div class="grid-2">'+Object.entries(LANG).map(([lang,meta])=>
      '<div class="practice-stat"><b>'+esc(meta.name)+'</b><p class="muted">Intentos: '+summary[lang].attempts+
      ' · Sin ayuda: '+summary[lang].correct_independent+' · Con pistas: '+summary[lang].guided+'</p></div>').join("")+
      '</div><div class="actions"><button class="button outline" data-route="practice">Hacer otro repaso</button></div></section>';
  }
  function progress(){
    root.innerHTML=toolbar("Cuaderno de progreso","Tu expediente permanece en este dispositivo. Puedes exportarlo cuando quieras.")+
    '<div class="metrics"><div class="metric"><strong>'+pct()+'%</strong><span>Avance del caso</span></div><div class="metric"><strong>'+state.visited.filter((x)=>necessaryClues.includes(x)).length+'/3</strong><span>Pistas obligatorias</span></div><div class="metric"><strong>'+state.matched.length+'/4</strong><span>Parejas recuperadas</span></div></div>'+
    practiceDashboard()+
    (state.solved?'<section class="success-panel"><span class="eyebrow">EXPEDIENTE RESUELTO</span><h2>Caso cerrado. Archivo abierto.</h2><p>Detectaste que la nota señalaba la habitación 12 y la llave estaba marcada 21. La siguiente investigación llegará al Archivo; el aprendizaje puede continuar.</p><p>Próximo caso previsto: '+esc(D.storyline.next_case)+'</p></section>':
    '<section class="card padded"><h2>Todavía hay una contradicción por resolver</h2><p class="muted">Revisa el escenario y las tarjetas hasta reunir todas las pruebas.</p><button class="button" data-route="investigation">Volver al expediente</button></section>')+
    '<div class="actions"><button class="button" data-route="practice">Práctica escrita por idioma</button></div>'+
    '<div class="grid-2" style="margin-top:20px"><section class="card padded"><span class="eyebrow">DESCARGAS</span><h2>Material para estudiar</h2><p class="muted">Descarga las palabras para una hoja de cálculo o imprime tarjetas y una hoja de ejercicios.</p><div class="actions"><button class="button outline" data-action="download-vocab">Vocabulario CSV</button><button class="button outline" data-action="print-cards">Tarjetas PDF / imprimir</button></div></section>'+
    '<section class="card padded"><span class="eyebrow">DATOS Y PRIVACIDAD</span><h2>Progreso portable</h2><p class="muted">Sin cuentas ni nube de datos: el guardado local no sincroniza entre teléfonos y computadoras.</p><div class="actions"><button class="button outline" data-action="export-progress">Exportar progreso JSON</button><button class="button outline" data-action="import-progress">Importar progreso JSON</button><button class="button secondary" data-action="reset-progress">Reiniciar progreso</button><input id="import-progress-file" type="file" accept=".json,application/json" hidden aria-label="Seleccionar archivo JSON para importar"></div></section></div>'+footnote();
  }
  function render() {
    byId("breadcrumb-current").textContent=routes[route];
    document.querySelectorAll("[data-route]").forEach((b)=>{
      const active=b.dataset.route===route;
      b.classList.toggle("active",active); if(active)b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current");
    });
    const sound=byId("sound-toggle");if(sound)sound.checked=state.sound;
    if(route==="office")office(); else if(route==="story")story(); else if(route==="intro")introduction(); else if(route==="learn")preparation();
    else if(route==="investigation")investigation();else if(route==="memory")memory();else if(route==="deck")deckView();else if(route==="practice")practice();else progress();
  }
  function navigate(to){if(!routes[to])return;
    if(["investigation","memory","practice"].includes(to)&&!state.introSeen)to="intro";
    else if(["investigation","memory","practice"].includes(to)&&!state.lessonCompleted)to="learn";
    route=to;activeClue=null;render(); window.scrollTo({top:0,behavior:"instant"});}
  function chooseCard(cardId) {
    if(locked)return;
    const card=deck.find((c)=>c.id===cardId);
    if(!card||state.matched.includes(card.pair)||selection.some((x)=>x.id===card.id))return;
    selection.push(card);chirp();render();
    if(selection.length===2){
      state.turns++;persist();
      const first=selection[0],second=selection[1];locked=true;
      if(first.pair===second.pair){
        state.matched.push(card.pair);persist();chirp();
        setTimeout(()=>{selection=[];locked=false;render();if(mastered())notify("Todas las parejas recuperadas. ¡Muy bien!");},450);
      }else{
        setTimeout(()=>{selection=[];locked=false;render();notify("No forman una pareja; inténtalo de nuevo.");},900);
      }
    }
  }
  function fileDownload(name,content,mime){
    const blob=new Blob([content],{type:mime});const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function exportCsv(){
    const rows=[["English","Español","Français","Deutsch","Русский","日本語"]];
    D.concepts.forEach((c)=>rows.push([c.en,c.es,c.fr.w,c.de.w,c.ru.w,c.ja.w]));
    const csv="\uFEFF"+rows.map((row)=>row.map((cell)=>'"'+String(cell).replace(/"/g,'""')+'"').join(",")).join("\r\n");
    fileDownload("ATLAS_vocabulario_demo.csv",csv,"text/csv;charset=utf-8");
    notify("CSV descargado: contenido didáctico de demostración.");
  }
  function exportProgress(){
    fileDownload("ATLAS_progreso_demo.json",JSON.stringify({schema_version:1,date:new Date().toISOString(),status:"LOCAL_DEMO_PROGRESS",data:state},null,2),"application/json");
    notify("Progreso exportado. Guárdalo como copia de respaldo.");
  }
  function printCards(){
    let node=byId("print-sheet");
    if(!node){node=document.createElement("div");node.id="print-sheet";node.className="print-sheet";document.body.appendChild(node);}
    node.innerHTML='<h1>El Archivo de las Cuatro Voces</h1><p>Fichas imprimibles · DEMO NO CERTIFICADA · Inglés como pivote</p>'+
      D.concepts.map((c,i)=>'<section class="print-card"><h2>Ficha '+(i+1)+': '+esc(c.en)+' · '+esc(c.es)+'</h2><p>Francés: '+esc(c.fr.w)+' | Alemán: '+esc(c.de.w)+' | Ruso: '+esc(c.ru.w)+' | Japonés: '+esc(c.ja.w)+'</p><p>Escribe una frase con esta palabra: _______________________________________________</p><p>Recuerda una traducción sin mirar: ______________________________________________</p></section>').join("");
    window.print();
  }
  function speak(conceptId,language){
    if(!("speechSynthesis" in window)){notify("Este navegador no ofrece voz sintetizada.");return;}
    const c=D.concepts.find((x)=>x.id===conceptId);
    if(!c||!LANG[language])return;
    const word=c[language].w;
    try{
      const utter=new SpeechSynthesisUtterance(word);utter.lang=LANG[language].voice;utter.rate=.83;
      window.speechSynthesis.cancel();window.speechSynthesis.speak(utter);
      notify("Voz sintetizada del dispositivo; no es audio humano validado.");
    }catch(e){notify("No fue posible reproducir la voz del navegador.");}
  }
  document.addEventListener("click",(event)=>{
    const b=event.target.closest("button");if(!b)return;
    if(b.dataset.route){navigate(b.dataset.route);return;}
    if(b.dataset.hubLanguage){selectedLang=b.dataset.hubLanguage;navigate("practice");return;}
    if(b.dataset.storyInspect){
      if(!state.block1.inspected.includes(b.dataset.storyInspect))state.block1.inspected.push(b.dataset.storyInspect);
      persist();render();return;
    }
    if(b.dataset.storyObservation){state.block1.observed=b.dataset.storyObservation;persist();render();return;}
    if(b.dataset.storyQuestion){
      if(!state.block1.asked.includes(b.dataset.storyQuestion))state.block1.asked.push(b.dataset.storyQuestion);
      persist();render();return;
    }
    if(b.dataset.storyMethod){state.block1.method=b.dataset.storyMethod;persist();render();return;}
    if(b.dataset.storyAnswer){state.block1.answer=b.dataset.storyAnswer;persist();render();return;}

    if(b.dataset.speakWord){speak(b.dataset.speakWord,b.dataset.speakLang);return;}
    if(b.dataset.clue){
      const id=b.dataset.clue;activeClue=id;
      if(!state.visited.includes(id)){state.visited.push(id);persist();chirp();notify("Nueva pista añadida al cuaderno.");}
      render();
      if(window.matchMedia("(max-width:1150px)").matches){byId("evidence-focus")?.scrollIntoView({behavior:"smooth",block:"start"});}
      return;
    }
    if(b.dataset.card){chooseCard(b.dataset.card);return;}
    if(b.dataset.lang){selectedLang=b.dataset.lang;flipped=false;render();return;}
    if(b.dataset.practiceLang){selectedLang=b.dataset.practiceLang;practiceIndex=0;practiceFeedback=null;practiceHintUsed=false;render();return;}
    if(b.dataset.answer && canSolve() && !state.solved){
      answerId=b.dataset.answer;state.attempts++;
      const choice=D.deduction.options.find((o)=>o.id===answerId);
      if(choice?.correct){state.solved=true;chirp();}persist();deduction();return;
    }
    const action=b.dataset.action;
    if(action==="story-next"){
      const st=state.block1;
      const current=B.scenes[st.stage];
      const required=current.id==="sobre"?["fecha","matasellos"].every(x=>st.inspected.includes(x))&&!!st.observed:
       current.id==="puerto"?["placa","plano"].every(x=>st.inspected.includes(x)):
       current.id==="nora"?st.asked.includes("quien")&&st.asked.includes("porqué"):
       current.id==="identidad"?!!st.method:
       current.id==="registro"?state.lessonCompleted&&st.answer==="libro"&&hasWrittenRecall:false;
      if(!required){notify("Examina la escena antes de avanzar.");return;}
      if(current.id==="identidad"){
        const input=byId("story-alias");if(input)st.alias=input.value.slice(0,40);
      }
      st.stage=Math.min(st.stage+1,B.scenes.length-1);
      if(B.scenes[st.stage].id==="cierre")st.complete=true;
      persist();navigate("story");return;
    }
    if(action==="story-back"){state.block1.stage=Math.max(0,state.block1.stage-1);persist();navigate("story");return;}
    if(action==="story-restart"){
      state.block1.stage=0;persist();navigate("story");return;
    }
    if(action==="install-pwa"){
      const install=window.ATLAS_INSTALL;
      if(!install){notify("Usa el menú de Chrome para añadir ATLAS a tu pantalla de inicio.");return;}
      install.request().then(result=>{
        if(result.status==="manual")notify("Chrome: menú ⋮ → Instalar aplicación o Añadir a pantalla principal. Después ábrela desde el icono.");
        if(result.status==="accepted")notify("Instalación aceptada. Abre ATLAS desde el nuevo icono.");
        if(result.status==="already-installed")notify("ATLAS ya está abierto como aplicación.");
      });return;
    }
    if(action==="intro-next"){
      if(introStep<D.introduction.length-1){introStep++;render();}
      else{state.introSeen=true;persist();lessonStep=0;navigate("learn");}
      return;
    }
    if(action==="intro-prev"){introStep=Math.max(0,introStep-1);render();return;}
    if(action==="lesson-next"){
      const id=D.concepts[lessonStep].id;
      if(!state.lessonViewed.includes(id))state.lessonViewed.push(id);
      if(lessonStep<D.concepts.length-1){lessonStep++;persist();render();}
      else{state.lessonCompleted=true;persist();navigate("investigation");notify("Preparación terminada. Ahora sí, ¡a investigar!");}
      return;
    }
    if(action==="lesson-prev"){lessonStep=Math.max(0,lessonStep-1);render();return;}
    if(action==="practice-hint"){practiceHintUsed=true;practiceFeedback=null;render();return;}
    if(action==="practice-next"){practiceIndex++;practiceHintUsed=false;practiceFeedback=null;render();return;}
    if(action==="show-deduction"){if(canSolve())deduction();else notify("Primero reúne las pistas y completa memoria.");}
    if(action==="flip-card"){flipped=!flipped;chirp();render();}
    if(action==="next-flash"){flashIndex=(flashIndex+1)%D.concepts.length;flipped=false;render();}
    if(action==="prev-flash"){flashIndex=(flashIndex+D.concepts.length-1)%D.concepts.length;flipped=false;render();}
    if(action==="download-vocab")exportCsv();
    if(action==="print-cards")printCards();
    if(action==="export-progress")exportProgress();
    if(action==="import-progress")byId("import-progress-file")?.click();
    if(action==="restart-memory"){
      if(window.confirm("¿Quieres reiniciar las parejas de memoria? No perderás las pistas ni el caso cerrado.")){
        state.matched=[];state.turns=0;deck=shuffled(pairs);selection=[];locked=false;persist();chirp();render();
      }
    }
    if(action==="reset-progress"){
      if(window.confirm("¿Borrar pistas, intentos y progreso guardado en este navegador?")){
        state=initial();deck=shuffled(pairs);selection=[];locked=false;activeClue=null;answerId=null;flashIndex=0;flipped=false;introStep=0;lessonStep=0;practiceIndex=0;practiceFeedback=null;practiceHintUsed=false;persist();navigate("office");notify("Progreso de demostración reiniciado.");
      }
    }
  });
  document.addEventListener("input",(event)=>{
    if(event.target?.id==="story-alias"){state.block1.alias=event.target.value.slice(0,40);persist();}
  });
  document.addEventListener("change",async(event)=>{
    if(event.target?.id!=="import-progress-file")return;
    const input=event.target;
    const file=input.files?.[0]; input.value="";
    if(!file)return;
    if(file.size>1000000){notify("El archivo es demasiado grande (máximo 1 MB).");return;}
    try{
      const parsed=JSON.parse(await file.text());
      if(parsed?.schema_version!==1||!parsed.data||
         !Array.isArray(parsed.data.visited)||!Array.isArray(parsed.data.matched))
        throw new Error("El archivo no tiene un formato de progreso ATLAS válido.");
      if(!window.confirm("¿Reemplazar el progreso de este navegador con el archivo importado? Exporta primero una copia de seguridad si quieres conservar el actual."))
        return;
      const previous=localStorage.getItem(KEY);
      try{
        localStorage.setItem(KEY,JSON.stringify(parsed.data));
        state=load();
      }catch(e){
        if(previous!==null)localStorage.setItem(KEY,previous);
        else localStorage.removeItem(KEY);
        throw e;
      }
      selection=[];locked=false;practiceFeedback=null;practiceHintUsed=false;
      navigate("progress");
      notify("Progreso importado y validado. Conserva una copia del JSON.");
    }catch(e){notify("No se pudo importar: "+String(e.message||"archivo inválido").slice(0,140));}
  });
  document.addEventListener("submit",(event)=>{
    if(event.target.id!=="practice-form")return;
    event.preventDefault();
    const P=window.ATLAS_PRACTICE;
    const q=P.questions(D.concepts,selectedLang)[practiceIndex%D.concepts.length];
    const submitted=byId("practice-answer")?.value||"";
    const result=P.grade(q,submitted);
    if(result.kind==="blank"){notify("Escribe una respuesta antes de comprobar.");return;}
    state.practiceAttempts=P.record(state.practiceAttempts,q,result,{hintUsed:practiceHintUsed});
    practiceFeedback=result;
    persist();render();
  });
  byId("sound-toggle")?.addEventListener("change",(event)=>{state.sound=event.target.checked;persist();notify(state.sound?"Sonidos activados.":"Sonidos desactivados.");});
  render();
})();

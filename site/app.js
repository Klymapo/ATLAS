(function atlasGame() {
  "use strict";
  const D = window.ATLAS_DEMO;
  const byId = (id) => document.getElementById(id);
  const root = byId("main-content");
  if (!root || !D || D.status !== "DEMO_ONLY_UNVERIFIED") {
    if (root) root.textContent = "No se pudo abrir el expediente de demostración.";
    return;
  }
  const KEY = "atlas-first-case-demo-v03";
  const routes = {office:"MI OFICINA",intro:"BIENVENIDA",learn:"APRENDER",investigation:"INVESTIGACIÓN",memory:"ENTRENAMIENTO",deck:"FICHAS",progress:"PROGRESO"};
  const LANG = {fr:{name:"Francés",label:"FR",voice:"fr-FR"},de:{name:"Alemán",label:"DE",voice:"de-DE"},ru:{name:"Ruso",label:"RU",voice:"ru-RU"},ja:{name:"Japonés",label:"JA",voice:"ja-JP"}};
  const necessaryClues = D.clues.filter((c) => c.require).map((c) => c.id);
  function initial(){return {visited:[],matched:[],turns:0,attempts:0,solved:false,sound:false,introSeen:false,lessonCompleted:false,lessonViewed:[]};}
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
        lessonViewed:Array.isArray(parsed.lessonViewed)?parsed.lessonViewed.filter((id)=>D.concepts.some((c)=>c.id===id)):[]
      };
    }catch(e){return initial();}
  }
  let state=load(),route="office",activeClue=null,answerId=null,flashIndex=0,selectedLang="fr",flipped=false,introStep=0,lessonStep=0,
      selection=[],locked=false,toastTimer=null;
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
    root.innerHTML=`
    <div class="hero"><div class="hero-copy"><span class="eyebrow">Sede central · Archivo Internacional · 22:40</span><h1>Hay una carta<br>esperando.</h1>
    <div class="goldline"></div><p>Acabas de llegar al Archivo, una agencia que investiga mensajes y documentos alterados. Nora Vale, la archivista, quiere hablar contigo antes de tu primer caso.</p>
    <div class="actions"><button class="button" data-route="${state.introSeen?(state.lessonCompleted?"investigation":"learn"):"intro"}">${state.introSeen?(state.lessonCompleted?"Abrir caso 001":"Aprender las cuatro palabras"):"Conocer a Nora"} <span aria-hidden="true">→</span></button>
    <button class="button outline" style="color:#fff;border-color:#75818a" data-route="learn">Preparación / repaso</button></div></div>
    <div class="hero-art"><img src="./assets/office.svg" alt="Ilustración vectorial de la oficina central del Archivo"></div></div>
    <div class="dashboard-grid">
    <section class="card case-card"><div class="case-icon" aria-hidden="true">◇</div><div><span class="eyebrow">EXPEDIENTE DISPONIBLE</span><h2>${esc(D.storyline.title)}</h2><p class="muted">${esc(D.storyline.opening)}</p>
    ${progressBar()}<small class="muted">Progreso de misión: ${pct()} % · ${state.visited.filter((x)=>necessaryClues.includes(x)).length}/3 pistas indispensables</small><div><button class="button small" data-route="investigation">${state.solved?"Revisar caso cerrado":"Continuar investigación"}</button></div></div></section>
    <section class="card brief-block"><span class="eyebrow">MENSAJE DE NORA VALE</span><h2>«Primero nos presentamos»</h2><p>Me llamo Nora. Te enseñaré las palabras del expediente y después iremos juntos a observar la escena. Puedes equivocarte sin penalizaciones.</p>
    <p class="muted">Enseñanza: español · Idioma común: English · Idiomas: FR / DE / RU / JA</p></section></div>
    <div class="actions"><button class="button outline" data-route="memory">Practicar memoria</button><button class="button outline" data-route="progress">Mi progreso y descargas</button></div>${footnote()}`;
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
    else next='<section class="card padded"><h3>Cómo avanzar</h3><p class="muted">Encuentra las tres pistas y completa las cuatro parejas de memoria. El orden es libre.</p><div class="actions"><button class="button outline" data-route="memory">Abrir juego de memoria</button><button class="button outline" data-route="deck">Repasar vocabulario</button></div></section>';
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
    '<h3>Sin cronómetro ni pérdida de vidas</h3><p class="muted">¿No recuerdas una palabra? Puedes volver a la preparación, estudiar las cuatro fichas y regresar. El progreso ya logrado se conserva.</p><button class="button outline small" data-route="learn">Repasar antes de continuar</button>')+
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
    '<div class="actions"><button class="button outline" data-action="download-vocab">Descargar vocabulario CSV</button><button class="button outline" data-action="print-cards">Imprimir fichas y ejercicios</button></div>'+footnote();
  }
  function deduction(){
    const chosen=D.deduction.options.find((x)=>x.id===answerId);
    root.innerHTML=toolbar("La última deducción","Nora necesita una explicación respaldada por las pistas encontradas.")+stages()+
    '<section class="card solve-card"><span class="eyebrow">INFORME DEL INVESTIGADOR</span><h2>'+esc(D.deduction.question)+'</h2><p class="muted">Puedes volver al escenario y revisar el cuaderno tantas veces como quieras.</p>'+
    D.deduction.options.map((o)=>'<button data-answer="'+o.id+'" class="assessment-option '+(chosen&&o.id===chosen.id?(chosen.correct?"correct":"incorrect"):"")+'" '+(state.solved?"disabled":"")+'><span class="number-badge">'+esc(o.id.toUpperCase())+'</span><span>'+esc(o.text)+'</span></button>').join("")+
    (chosen?'<div class="feedback '+(chosen.correct?"":"error")+'" role="status"><strong>'+ (chosen.correct?"Deducción correcta.":"Todavía no.")+'</strong><br>'+esc(chosen.why)+'</div>':'')+
    '<div class="actions"><button class="button outline" data-route="investigation">Volver a examinar</button>'+(state.solved?'<button class="button" data-route="progress">Ver caso cerrado →</button>':'')+'</div></section>'+footnote();
  }
  function progress(){
    root.innerHTML=toolbar("Cuaderno de progreso","Tu expediente permanece en este dispositivo. Puedes exportarlo cuando quieras.")+
    '<div class="metrics"><div class="metric"><strong>'+pct()+'%</strong><span>Avance del caso</span></div><div class="metric"><strong>'+state.visited.filter((x)=>necessaryClues.includes(x)).length+'/3</strong><span>Pistas obligatorias</span></div><div class="metric"><strong>'+state.matched.length+'/4</strong><span>Parejas recuperadas</span></div></div>'+
    (state.solved?'<section class="success-panel"><span class="eyebrow">EXPEDIENTE RESUELTO</span><h2>Caso cerrado. Archivo abierto.</h2><p>Detectaste que la nota señalaba la habitación 12 y la llave estaba marcada 21. La siguiente investigación llegará al Archivo; el aprendizaje puede continuar.</p><p>Próximo caso previsto: '+esc(D.storyline.next_case)+'</p></section>':
    '<section class="card padded"><h2>Todavía hay una contradicción por resolver</h2><p class="muted">Revisa el escenario y las tarjetas hasta reunir todas las pruebas.</p><button class="button" data-route="investigation">Volver al expediente</button></section>')+
    '<div class="grid-2" style="margin-top:20px"><section class="card padded"><span class="eyebrow">DESCARGAS</span><h2>Material para estudiar</h2><p class="muted">Descarga las palabras para una hoja de cálculo o imprime tarjetas y una hoja de ejercicios.</p><div class="actions"><button class="button outline" data-action="download-vocab">Vocabulario CSV</button><button class="button outline" data-action="print-cards">Tarjetas PDF / imprimir</button></div></section>'+
    '<section class="card padded"><span class="eyebrow">DATOS Y PRIVACIDAD</span><h2>Progreso portable</h2><p class="muted">Sin cuentas ni nube de datos: el guardado local no sincroniza entre teléfonos y computadoras.</p><div class="actions"><button class="button outline" data-action="export-progress">Exportar progreso JSON</button><button class="button secondary" data-action="reset-progress">Reiniciar progreso</button></div></section></div>'+footnote();
  }
  function render() {
    byId("breadcrumb-current").textContent=routes[route];
    document.querySelectorAll("[data-route]").forEach((b)=>{
      const active=b.dataset.route===route;
      b.classList.toggle("active",active); if(active)b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current");
    });
    const sound=byId("sound-toggle");if(sound)sound.checked=state.sound;
    if(route==="office")office(); else if(route==="intro")introduction(); else if(route==="learn")preparation();
    else if(route==="investigation")investigation();else if(route==="memory")memory();else if(route==="deck")deckView();else progress();
  }
  function navigate(to){if(!routes[to])return;
    if(["investigation","memory"].includes(to)&&!state.introSeen)to="intro";
    else if(["investigation","memory"].includes(to)&&!state.lessonCompleted)to="learn";
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
    if(b.dataset.answer && canSolve() && !state.solved){
      answerId=b.dataset.answer;state.attempts++;
      const choice=D.deduction.options.find((o)=>o.id===answerId);
      if(choice?.correct){state.solved=true;chirp();}persist();deduction();return;
    }
    const action=b.dataset.action;
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
    if(action==="show-deduction"){if(canSolve())deduction();else notify("Primero reúne las pistas y completa memoria.");}
    if(action==="flip-card"){flipped=!flipped;chirp();render();}
    if(action==="next-flash"){flashIndex=(flashIndex+1)%D.concepts.length;flipped=false;render();}
    if(action==="prev-flash"){flashIndex=(flashIndex+D.concepts.length-1)%D.concepts.length;flipped=false;render();}
    if(action==="download-vocab")exportCsv();
    if(action==="print-cards")printCards();
    if(action==="export-progress")exportProgress();
    if(action==="restart-memory"){
      if(window.confirm("¿Quieres reiniciar las parejas de memoria? No perderás las pistas ni el caso cerrado.")){
        state.matched=[];state.turns=0;deck=shuffled(pairs);selection=[];locked=false;persist();chirp();render();
      }
    }
    if(action==="reset-progress"){
      if(window.confirm("¿Borrar pistas, intentos y progreso guardado en este navegador?")){
        state=initial();deck=shuffled(pairs);selection=[];locked=false;activeClue=null;answerId=null;flashIndex=0;flipped=false;introStep=0;lessonStep=0;persist();navigate("office");notify("Progreso de demostración reiniciado.");
      }
    }
  });
  byId("sound-toggle")?.addEventListener("change",(event)=>{state.sound=event.target.checked;persist();notify(state.sound?"Sonidos activados.":"Sonidos desactivados.");});
  render();
})();

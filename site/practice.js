/* ATLAS v0.8: reusable, dependency-free retrieval practice for demos.
   This records practice, NEVER certified language mastery. */
(function(factory){
  const api=factory();
  if(typeof module==="object"&&module.exports) module.exports=api;
  if(typeof window!=="undefined") window.ATLAS_PRACTICE=api;
})(function(){
  "use strict";
  const languages=["fr","de","ru","ja"];
  const HOUR=3600000,DAY=24*HOUR,intervals=[1,3,7,14,30];
  const timestamp=(v)=>{const n=Date.parse(v);return Number.isFinite(n)?n:null;};
  const normalize=(s)=>String(s??"").normalize("NFKC").toLowerCase().trim()
    .replace(/[\u2019\u2018]/g,"'").replace(/\s+/g," ");
  function questions(concepts,language){
    if(!languages.includes(language))throw new Error("Idioma no admitido");
    if(!Array.isArray(concepts))throw new Error("Se esperan conceptos");
    return concepts.map(c=>{
      const cell=c[language];
      if(!c.id||!c.en||!cell||!cell.w)throw new Error("Ficha incompleta: "+c.id);
      const withArticle=language==="fr"||language==="de";
      const kana=language==="ja"?String(cell.reading||"").split(" · ")[0].trim():null;
      const correct=withArticle?(cell.hint||""):language==="ja"?(kana||cell.w):cell.w;
      if(!correct)throw new Error("Falta el artículo o la lectura");
      return {id:language+":"+c.id,concept:c.id,language,
        prompt:c.en,spanish:c.es,
        expected:correct,headword:cell.w,
        alternative:language==="ja"?cell.w:null,
        needsArticle:withArticle,status:"DEMO_UNVERIFIED"};
    });
  }
  function grade(question,answer){
    const value=normalize(answer),expected=normalize(question.expected);
    const alt=question.alternative?normalize(question.alternative):"";
    if(!value)return {correct:false,kind:"blank",message:"Escribe una respuesta antes de comprobar."};
    if(value===expected||(alt&&value===alt))
      return {correct:true,kind:"correct",message:question.needsArticle?"Bien: sustantivo y artículo correctos.":"Respuesta correcta en esta práctica."};
    if(question.needsArticle){
      const noun=normalize(question.headword);
      if(value===noun)
        return {correct:false,kind:"missing_article",message:"El sustantivo está bien. Falta el artículo correcto."};
      const articles=question.language==="de"?["der","die","das"]:["le","la","l'","les"];
      if(articles.some(a=>value.startsWith(a+" ")&&value.endsWith(" "+noun))||
         (question.language==="fr"&&value==="l\'"+noun))
        return {correct:false,kind:"wrong_article",message:"Reconoces el sustantivo, pero revisa su género y artículo."};
    }
    return {correct:false,kind:"incorrect",message:"Todavía no coincide. Revisa la ficha y vuelve a practicar."};
  }
  function latestAttempts(history,nowMs){
    const latest=new Map();
    for(const e of Array.isArray(history)?history:[]){
      if(!e||typeof e.id!=="string")continue;
      const at=timestamp(e.at);
      if(at===null||at>nowMs)continue;
      const prior=latest.get(e.id);
      if(!prior||at>=prior.at)latest.set(e.id,{entry:e,at});
    }
    return latest;
  }
  function record(history,question,result,options={}){
    const when=options.at||new Date().toISOString(),at=timestamp(when);
    if(at===null)throw new Error("Fecha de práctica inválida");
    const entries=Array.isArray(history)?history:[];
    const previous=latestAttempts(entries,at).get(question.id)?.entry;
    const hintUsed=options.hintUsed===true;
    let streak=0,dueAt=at+HOUR;
    if(result.correct===true&&!hintUsed){
      const priorStreak=Number.isInteger(previous?.streak)&&previous.streak>0
        ?Math.min(previous.streak,intervals.length):1;
      const priorDue=timestamp(previous?.due_at);
      if(previous?.correct===true&&previous.hint_used!==true&&priorDue!==null&&at<priorDue){
        // A same-session repeat cannot simulate spaced retrieval.
        streak=priorStreak;dueAt=priorDue;
      }else{
        streak=previous?.correct===true&&previous.hint_used!==true
          ?Math.min(priorStreak+1,intervals.length):1;
        dueAt=at+intervals[streak-1]*DAY;
      }
    }
    const entry={id:question.id,language:question.language,concept:question.concept,
      at:new Date(at).toISOString(),correct:result.correct===true,error_type:result.kind,
      hint_used:hintUsed,
      modality:hintUsed?"guided_recall":"independent_recall",
      content_status:"PENDING",certified:false,
      streak,scheduler_version:"atlas-interval-v1",due_at:new Date(dueAt).toISOString()};
    return [...entries.slice(-499),entry];
  }
  function reviewPlan(history,items,now=new Date().toISOString()){
    if(!Array.isArray(items))throw new Error("Se esperan preguntas");
    const at=timestamp(now);
    if(at===null)throw new Error("Fecha de repaso inválida");
    const latest=latestAttempts(history,at);
    const due=[],upcoming=[],fresh=[];
    for(const q of items){
      if(!q||!languages.includes(q.language)||typeof q.id!=="string")continue;
      const previous=latest.get(q.id);
      if(!previous){fresh.push(q);continue;}
      const e=previous.entry,planned=timestamp(e.due_at);
      // Legacy saves without due_at remain usable.
      const dueMs=planned===null?previous.at+(e.correct&&!e.hint_used?DAY:HOUR):planned;
      const item={id:q.id,question:q,due_at:new Date(dueMs).toISOString()};
      (dueMs<=at?due:upcoming).push(item);
    }
    due.sort((a,b)=>a.due_at.localeCompare(b.due_at));
    upcoming.sort((a,b)=>a.due_at.localeCompare(b.due_at));
    return {due,upcoming,fresh,next_due_at:upcoming[0]?.due_at||null};
  }
  function summary(history){
    const entries=(Array.isArray(history)?history:[]).filter(e=>e&&languages.includes(e.language));
    const result={};
    for(const lang of languages){
      const selected=entries.filter(e=>e.language===lang);
      result[lang]={attempts:selected.length,correct_independent:selected.filter(e=>e.correct&&!e.hint_used).length,
        guided:selected.filter(e=>e.hint_used).length,certified:0};
    }
    return result;
  }
  return {languages,questions,grade,record,reviewPlan,summary,normalize};
});

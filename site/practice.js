/* ATLAS v0.8: reusable, dependency-free retrieval practice for demos.
   This records practice, NEVER certified language mastery. */
(function(factory){
  const api=factory();
  if(typeof module==="object"&&module.exports) module.exports=api;
  if(typeof window!=="undefined") window.ATLAS_PRACTICE=api;
})(function(){
  "use strict";
  const languages=["fr","de","ru","ja"];
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
      if(articles.some(a=>value.startsWith(a+" ")&&value.endsWith(" "+noun)))
        return {correct:false,kind:"wrong_article",message:"Reconoces el sustantivo, pero revisa su género y artículo."};
    }
    return {correct:false,kind:"incorrect",message:"Todavía no coincide. Revisa la ficha y vuelve a practicar."};
  }
  function record(history,question,result,options={}){
    const when=options.at||new Date().toISOString();
    const entry={id:question.id,language:question.language,concept:question.concept,
      at:when,correct:result.correct===true,error_type:result.kind,
      hint_used:options.hintUsed===true,
      modality:options.hintUsed?"guided_recall":"independent_recall",
      content_status:"PENDING",certified:false,
      due_at:new Date(Date.parse(when)+(result.correct?24:1)*3600000).toISOString()};
    return [...(Array.isArray(history)?history:[]).slice(-499),entry];
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
  return {languages,questions,grade,record,summary,normalize};
});

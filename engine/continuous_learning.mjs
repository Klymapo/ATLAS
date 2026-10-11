// ATLAS v0.7 — Reusable, standalone learning/planning engine. Not yet wired into live site.
const LANGS=["fr","de","ru","ja"];
const SKILLS=["recognition","guided_recall","independent_recall","grammar","sentence_cloze","context_transfer","delayed_recall"];
const time=s=>Date.parse(s);
function check(x,m){if(!x)throw new Error(m);}
export function eligibleExercises(items,language,skill){
  check(LANGS.includes(language),"Unsupported language");
  check(SKILLS.includes(skill),"Unsupported skill");
  return items.flatMap(item=>
    item.status==="APPROVED" && item.languages?.[language]?.status==="APPROVED"
    ?(item.bank?.[language]?.[skill]||[]).filter(q=>q.approved===true && q.prompt && q.feedback)
       .map(q=>({...q,language,skill,concept_id:item.concept_id,sense_id:item.sense_id}))
    :[]);
}
export function nextExercise(items,language,skill,iteration=0){
  const choices=eligibleExercises(items,language,skill);
  return choices.length?{status:"READY",exercise:choices[Math.abs(Math.trunc(iteration))%choices.length]}
    :{status:"NOT_READY",reason:"No approved exercises"};
}
export function checkGate(gate,evidence=[],now=new Date().toISOString()){
  check(gate?.status==="APPROVED"&&gate.requires?.length>0,"Gate not reviewed");
  const pending=gate.requires.map(req=>{
    check(LANGS.includes(req.language)&&SKILLS.includes(req.skill)&&req.concept_id,"Invalid requirement");
    const needed=Math.max(1,Math.trunc(req.minimum||1));
    const found=evidence.filter(e=>{
      if(e.language!==req.language||e.concept_id!==req.concept_id||e.skill!==req.skill||
         (req.sense_id&&e.sense_id!==req.sense_id)||e.correct!==true||e.hint_used===true||
         e.content_status!=="APPROVED"||!Number.isFinite(time(e.at))||time(e.at)>time(now))return false;
      if(req.novel_context&&!e.novel_context)return false;
      if(req.min_delay_hours!=null&&(!Number.isFinite(time(e.exposed_at))||
         time(e.at)-time(e.exposed_at)<req.min_delay_hours*3600000))return false;
      return true;
    }).length;
    return {...req,found,needed,missing:Math.max(0,needed-found)};
  });
  return {unlocked:pending.every(x=>x.missing===0),pending};
}
export function recommendMode(evidence,language,concept_id){
  const ok=skill=>evidence.some(e=>e.language===language&&e.concept_id===concept_id&&
    e.correct===true&&!e.hint_used&&e.content_status==="APPROVED"&&e.skill===skill);
  if(!ok("recognition"))return "recognition";
  if(!ok("independent_recall"))return "independent_recall";
  if(!ok("context_transfer"))return "context_transfer";
  return ok("delayed_recall")?"adaptive_review":"delayed_recall";
}
export function planNight({snapshot,queue=[],now=new Date().toISOString()}){
  const at=time(now),observed=time(snapshot?.collected_at);
  if(!snapshot||snapshot.schema_version!==1||!Number.isFinite(observed)||observed>at||
    at-observed>72*3600000)
    return {decision:"NO_VISIBLE_PROGRESS",action:"DRAFT_ONLY"};
  if(snapshot.consent_to_share!==true)return {decision:"NO_CONSENT",action:"DRAFT_ONLY"};
  const due=Math.max(0,Math.trunc(snapshot.metrics?.due_reviews||0));
  const attempts=Math.max(0,Math.trunc(snapshot.metrics?.delayed_attempts||0));
  if(due>=6||(attempts>=8&&snapshot.metrics?.delayed_accuracy<.70))
    return {decision:"FOCUS_ON_REVIEW",action:"REUSE_ENGINE"};
  const ready=queue.some(q=>q.status==="APPROVED"&&q.linguistic==="APPROVED"&&
    q.pedagogy==="APPROVED"&&q.visual==="APPROVED");
  if(snapshot.metrics?.ready_for_next_gate&&ready)
    return {decision:"CONTENT_READY",action:"CHECK_GATE_LOCALLY"};
  if(snapshot.metrics?.ready_for_next_gate)
    return {decision:"PREPARE_NEXT_SEGMENT",action:"DRAFT_ONLY"};
  return {decision:"CONTINUE_PRACTICE",action:"REUSE_ENGINE"};
}

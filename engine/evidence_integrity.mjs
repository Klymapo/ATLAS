// ATLAS evidence integrity: pure functions; never grants language certification.
const LANGS=new Set(["fr","de","ru","ja"]);
const SKILLS=new Set(["recognition","guided_recall","independent_recall","grammar","sentence_cloze","context_transfer","delayed_recall"]);
const millis=value=>{
 if(typeof value!=="string")return null;
 const n=Date.parse(value);
 return Number.isFinite(n)?n:null;
};
/**
 * Count independently observed, approved retrieval events without double-counting
 * repeated or copied records. No personally identifying data is needed.
 */
export function distinctEvidence(history,requirement,now=new Date().toISOString()){
 if(!Array.isArray(history))throw new Error("Evidence must be an array");
 if(!LANGS.has(requirement?.language)||!SKILLS.has(requirement?.skill)||
    typeof requirement?.concept_id!=="string"||!requirement.concept_id)
   throw new Error("Invalid learning requirement");
 const nowMs=millis(now);
 if(nowMs===null)throw new Error("Invalid review time");
 const seen=new Set(),accepted=[];
 for(const event of history){
  if(!event||event.language!==requirement.language||
     event.concept_id!==requirement.concept_id||
     event.skill!==requirement.skill||
     (requirement.sense_id&&event.sense_id!==requirement.sense_id)||
     event.correct!==true||event.hint_used!==false||
     event.content_status!=="APPROVED")continue;
  const at=millis(event.at);
  if(at===null||at>nowMs||seen.has(at))continue;
  if(requirement.novel_context&&event.novel_context!==true)continue;
  if(requirement.min_delay_hours!=null){
   const exposed=millis(event.exposed_at);
   if(exposed===null||at-exposed<requirement.min_delay_hours*3600000)continue;
  }
  seen.add(at);
  accepted.push(event);
 }
 return accepted;
}
export function evidenceGate(requirements,history,now){
 if(!Array.isArray(requirements)||!requirements.length)throw new Error("Requirements missing");
 const pending=requirements.map(req=>{
  const found=distinctEvidence(history,req,now).length;
  const needed=Math.max(1,Math.trunc(req.minimum||1));
  return {language:req.language,concept_id:req.concept_id,skill:req.skill,
    found,needed,missing:Math.max(0,needed-found)};
 });
 return {unlocked:pending.every(p=>p.missing===0),pending,certified:false};
}

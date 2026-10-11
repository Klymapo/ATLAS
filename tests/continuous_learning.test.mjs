import test from "node:test";
import assert from "node:assert/strict";
import {eligibleExercises,nextExercise,checkGate,recommendMode,planNight} from "../engine/continuous_learning.mjs";
const NOW="2026-10-11T20:00:00.000Z";
const word={concept_id:"book",sense_id:"physical-book",status:"APPROVED",
 languages:{de:{status:"APPROVED"},fr:{status:"PENDING"}},
 bank:{de:{recognition:[{approved:true,prompt:"Choose book",feedback:"Well done"}],
 independent_recall:[{approved:true,prompt:"Translate book, with article",feedback:"das Buch",answer_schema:"article+noun"}]}}};
const req={status:"APPROVED",requires:[
 {language:"de",concept_id:"book",skill:"independent_recall"},
 {language:"de",concept_id:"book",skill:"context_transfer",novel_context:true}]};
function ev(skill,opts={}){return {language:"de",concept_id:"book",sense_id:"physical-book",
 skill,correct:true,hint_used:false,content_status:"APPROVED",
 at:"2026-10-11T19:00:00.000Z",exposed_at:"2026-10-10T18:00:00.000Z",novel_context:true,...opts};}
test("only independently approved exercise items can be generated",()=>{
 assert.equal(eligibleExercises([word],"de","recognition").length,1);
 assert.equal(nextExercise([word],"fr","recognition").status,"NOT_READY");
});
test("German article remains part of response schema",()=>{
 assert.equal(nextExercise([word],"de","independent_recall").exercise.answer_schema,"article+noun");
});
test("Memory does not unlock story",()=>assert.equal(checkGate(req,[ev("recognition")],NOW).unlocked,false));
test("listening only does not unlock story",()=>assert.equal(checkGate(req,[ev("listening")],NOW).unlocked,false));
test("hinted recall does not count",()=>assert.equal(checkGate(req,[ev("independent_recall",{hint_used:true}),ev("context_transfer")],NOW).unlocked,false));
test("new context is mandatory for transfer",()=>assert.equal(checkGate(req,[ev("independent_recall"),ev("context_transfer",{novel_context:false})],NOW).unlocked,false));
test("recall plus novel application unlocks narrative",()=>assert.equal(checkGate(req,[ev("independent_recall"),ev("context_transfer")],NOW).unlocked,true));
test("real delayed review is not simulated same-day",()=>{
 const g={status:"APPROVED",requires:[{language:"de",concept_id:"book",skill:"delayed_recall",min_delay_hours:24}]};
 assert.equal(checkGate(g,[ev("delayed_recall",{at:"2026-10-11T12:00:00.000Z"})],NOW).unlocked,false);
 assert.equal(checkGate(g,[ev("delayed_recall")],NOW).unlocked,true);
});
test("planner does not invent private phone progress",()=>assert.equal(planNight({snapshot:null,now:NOW}).decision,"NO_VISIBLE_PROGRESS"));
test("planner requires consent",()=>assert.equal(planNight({snapshot:{schema_version:1,collected_at:NOW,consent_to_share:false},now:NOW}).decision,"NO_CONSENT"));
test("fast learners have access to already approved queued content",()=>{
 const snapshot={schema_version:1,collected_at:NOW,consent_to_share:true,metrics:{ready_for_next_gate:true}};
 const queue=[{status:"APPROVED",linguistic:"APPROVED",pedagogy:"APPROVED",visual:"APPROVED"}];
 assert.equal(planNight({snapshot,queue,now:NOW}).decision,"CONTENT_READY");
});
test("due reviews take priority",()=>{
 const snapshot={schema_version:1,collected_at:NOW,consent_to_share:true,metrics:{due_reviews:10,ready_for_next_gate:true}};
 assert.equal(planNight({snapshot,queue:[],now:NOW}).decision,"FOCUS_ON_REVIEW");
});
test("adaptive skill progression does not confuse recognition with recall",()=>{
 assert.equal(recommendMode([ev("recognition")],"de","book"),"independent_recall");
 assert.equal(recommendMode([ev("recognition")],"fr","book"),"recognition");
});

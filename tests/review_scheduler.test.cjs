const test=require("node:test");
const assert=require("node:assert/strict");
const P=require("../site/practice.js");
const concepts=[
 {id:"book",en:"book",es:"libro",fr:{w:"livre",hint:"le livre"},de:{w:"Buch",hint:"das Buch"},ru:{w:"книга"},ja:{w:"本",reading:"ほん · hon"}},
 {id:"key",en:"key",es:"llave",fr:{w:"clé",hint:"la clé"},de:{w:"Schlüssel",hint:"der Schlüssel"},ru:{w:"ключ"},ja:{w:"鍵",reading:"かぎ · kagi"}}
];
const q=(lang="de")=>P.questions(concepts,lang)[0];
const pass=(question)=>P.grade(question,question.expected);
const T="2026-10-11T10:00:00.000Z";
test("new vocabulary is fresh, not falsely overdue",()=>{
 const plan=P.reviewPlan([],P.questions(concepts,"de"),T);
 assert.equal(plan.due.length,0);
 assert.equal(plan.fresh.length,2);
 assert.equal(plan.next_due_at,null);
});
test("correct independent answer schedules one day and stays unverified",()=>{
 const history=P.record([],q(),pass(q()),{at:T});
 assert.equal(history[0].due_at,"2026-10-12T10:00:00.000Z");
 assert.equal(history[0].streak,1);
 assert.equal(history[0].certified,false);
 assert.equal(P.reviewPlan(history,[q()],"2026-10-12T09:59:00.000Z").due.length,0);
 assert.equal(P.reviewPlan(history,[q()],"2026-10-12T10:00:00.000Z").due.length,1);
});
test("same-session repeats cannot forge delayed recall",()=>{
 let history=P.record([],q(),pass(q()),{at:T});
 history=P.record(history,q(),pass(q()),{at:"2026-10-11T10:01:00.000Z"});
 assert.equal(history[1].streak,1);
 assert.equal(history[1].due_at,history[0].due_at);
 history=P.record(history,q(),pass(q()),{at:"2026-10-12T10:00:00.000Z"});
 assert.equal(history[2].streak,2);
 assert.equal(history[2].due_at,"2026-10-15T10:00:00.000Z");
});
test("wrong or guided answers reset schedule to an hour",()=>{
 let history=P.record([],q(),pass(q()),{at:T});
 history=P.record(history,q(),P.grade(q(),"die Buch"),{at:"2026-10-12T10:00:00.000Z"});
 assert.equal(history[1].streak,0);
 assert.equal(history[1].due_at,"2026-10-12T11:00:00.000Z");
 history=P.record(history,q(),pass(q()),{at:"2026-10-12T10:05:00.000Z",hintUsed:true});
 assert.equal(history[2].streak,0);
 assert.equal(history[2].modality,"guided_recall");
 assert.equal(history[2].due_at,"2026-10-12T11:05:00.000Z");
});
test("legacy export without due_at remains reviewable",()=>{
 const legacy=[{id:"de:book",language:"de",at:"2026-10-10T10:00:00.000Z",correct:true,hint_used:false}];
 const plan=P.reviewPlan(legacy,[q()],"2026-10-12T10:00:00.000Z");
 assert.equal(plan.due.length,1);
 assert.equal(plan.due[0].id,"de:book");
});
test("review planning is language-specific and excludes future/corrupt attempts",()=>{
 const de=q(),fr=q("fr");
 const history=[
  {id:"de:book",language:"de",at:"2026-10-10T10:00:00.000Z",due_at:"2026-10-11T10:00:00.000Z",correct:true},
  {id:"fr:book",language:"fr",at:"2026-10-10T10:00:00.000Z",due_at:"2026-10-20T10:00:00.000Z",correct:true},
  {id:"de:book",language:"de",at:"2099-01-01T00:00:00Z",due_at:"2099-01-02T00:00:00Z",correct:true},
  {id:"de:book",language:"de",at:"invalid",due_at:"invalid",correct:true}
 ];
 assert.equal(P.reviewPlan(history,[de],T).due.length,1);
 assert.equal(P.reviewPlan(history,[fr],T).due.length,0);
 assert.equal(P.reviewPlan(history,[fr],T).upcoming.length,1);
});
test("French elision errors are classified separately from noun errors",()=>{
 const french=q("fr");
 assert.equal(P.grade(french,"l'livre").kind,"wrong_article");
 assert.equal(P.grade(french,"le livre").correct,true);
});
test("invalid review dates are rejected without changing saved attempts",()=>{
 assert.throws(()=>P.reviewPlan([],[], "not-a-date"),/Fecha de repaso/);
 assert.throws(()=>P.record([],q(),pass(q()),{at:"not-a-date"}),/Fecha de práctica/);
});

test("imported far-future due date cannot suppress a review",()=>{
 const history=[{id:"de:book",language:"de",concept:"book",at:"2026-10-10T10:00:00Z",
   due_at:"2099-01-01T00:00:00Z",correct:true,hint_used:false}];
 const plan=P.reviewPlan(history,[q()],"2026-10-15T10:00:00Z");
 assert.equal(plan.due.length,1);
 assert.equal(plan.due[0].due_at,"2026-10-11T10:00:00.000Z");
});
test("a due date before the attempt is repaired, not trusted",()=>{
 const history=[{id:"fr:book",language:"fr",concept:"book",at:"2026-10-10T10:00:00Z",
   due_at:"2000-01-01T00:00:00Z",correct:false,hint_used:true}];
 const plan=P.reviewPlan(history,[q("fr")],"2026-10-10T12:00:00Z");
 assert.equal(plan.due.length,1);
 assert.equal(plan.due[0].due_at,"2026-10-10T11:00:00.000Z");
});
test("imported mismatched concept or language cannot contaminate another review",()=>{
 const history=[
  {id:"de:book",language:"fr",concept:"book",at:"2026-10-10T10:00:00Z",correct:true},
  {id:"de:book",language:"de",concept:"key",at:"2026-10-10T10:00:00Z",correct:true}
 ];
 assert.equal(P.reviewPlan(history,[q()],"2026-10-15T10:00:00Z").fresh.length,1);
});
test("malformed future due date does not promote immediate repeat to day three",()=>{
 let history=P.record([],q(),pass(q()),{at:T});
 history[0].due_at="2099-01-01T00:00:00Z";
 history=P.record(history,q(),pass(q()),{at:"2026-10-11T10:01:00Z"});
 assert.equal(history[1].streak,1);
 assert.equal(history[1].due_at,"2026-10-12T10:00:00.000Z");
});
test("non-string date inputs are rejected",()=>{
 assert.throws(()=>P.reviewPlan([],[],12345),/Fecha de repaso/);
 assert.throws(()=>P.record([],q(),pass(q()),{at:12345}),/Fecha de práctica/);
});

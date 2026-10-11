const test=require("node:test");
const assert=require("node:assert/strict");
const P=require("../site/practice.js");
const words=[
{id:"book",en:"book",es:"libro",fr:{w:"livre",hint:"le livre"},de:{w:"Buch",hint:"das Buch"},ru:{w:"книга"},ja:{w:"本",reading:"ほん · hon"}},
{id:"key",en:"key",es:"llave",fr:{w:"clé",hint:"la clé"},de:{w:"Schlüssel",hint:"der Schlüssel"},ru:{w:"ключ"},ja:{w:"鍵",reading:"かぎ · kagi"}}
];
test("same reusable engine generates questions for all four languages",()=>{
 for(const lang of P.languages){
  const q=P.questions(words,lang);
  assert.equal(q.length,2);assert.equal(q[0].status,"DEMO_UNVERIFIED");
 }
});
test("German article and noun both needed",()=>{
 const q=P.questions(words,"de")[0];
 assert.equal(P.grade(q,"das Buch").correct,true);
 assert.equal(P.grade(q,"BUCH").kind,"missing_article");
 assert.equal(P.grade(q,"die Buch").kind,"wrong_article");
});
test("French article is required",()=>{
 const q=P.questions(words,"fr")[1];
 assert.equal(P.grade(q,"clé").kind,"missing_article");
 assert.equal(P.grade(q,"la clé").correct,true);
});
test("Russian Cyrillic is verified as form, transliteration not a substitute",()=>{
 const q=P.questions(words,"ru")[0];
 assert.equal(P.grade(q,"книга").correct,true);
 assert.equal(P.grade(q,"kniga").correct,false);
});
test("Japanese kana and complete written kanji both accepted for early practice",()=>{
 const q=P.questions(words,"ja")[0];
 assert.equal(P.grade(q,"ほん").correct,true);
 assert.equal(P.grade(q,"本").correct,true);
 assert.equal(P.grade(q,"hon").correct,false);
});
test("a hinted or repeated answer never sets certification",()=>{
 const q=P.questions(words,"de")[0];
 const history=P.record([],q,P.grade(q,"das Buch"),{hintUsed:true,at:"2026-10-11T20:00:00Z"});
 assert.equal(history[0].certified,false);
 assert.equal(history[0].content_status,"PENDING");
 assert.equal(history[0].modality,"guided_recall");
 assert.equal(P.summary(history).de.correct_independent,0);
});
test("all answers count as practice, never as earned MCER level",()=>{
 const q=P.questions(words,"de")[0];
 const history=P.record([],q,P.grade(q,"das Buch"),{at:"2026-10-11T20:00:00Z"});
 assert.equal(history[0].certified,false);
 assert.equal(P.summary(history).de.correct_independent,1);
 assert.equal(P.summary(history).de.certified,0);
});
test("blank inputs rejected",()=>assert.equal(P.grade(P.questions(words,"fr")[0]," ").kind,"blank"));

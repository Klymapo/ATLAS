const test=require("node:test");
const assert=require("node:assert/strict");
const P=require("../site/practice.js");
const concepts=[{id:"key",en:"key",es:"llave",fr:{w:"clé",hint:"la clé"},de:{w:"Schlüssel",hint:"der Schlüssel"},ru:{w:"ключ"},ja:{w:"鍵",reading:"かぎ · kagi"}}];
test("French written accents must be preserved",()=>{
 const q=P.questions(concepts,"fr")[0];
 assert.equal(P.grade(q,"la clé").correct,true);
 assert.equal(P.grade(q,"la cle").correct,false);
});
test("German umlauts are required",()=>{
 const q=P.questions(concepts,"de")[0];
 assert.equal(P.grade(q,"der Schlüssel").correct,true);
 assert.equal(P.grade(q,"der Schlussel").correct,false);
});
test("scripts cannot be replaced by transliteration",()=>{
 assert.equal(P.grade(P.questions(concepts,"ru")[0],"klyuch").correct,false);
 assert.equal(P.grade(P.questions(concepts,"ja")[0],"kagi").correct,false);
});
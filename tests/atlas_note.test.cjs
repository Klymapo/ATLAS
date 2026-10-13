const test=require("node:test");
const assert=require("node:assert/strict");
const P=require("../site/practice.js");
test("four languages",()=>assert.equal(P.languages.length,4));

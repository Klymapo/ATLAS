import test from "node:test";
import assert from "node:assert/strict";
import { reviewStatus, reviewCounts } from "../engine/review_integrity.mjs";
const now="2026-10-14T09:00:00Z";
const old=[{id:"de:book",language:"de",concept:"book",at:"2026-10-10T09:00:00Z",correct:true,hint_used:false}];
test("old save is due",()=>assert.equal(reviewStatus(old,"de","book",now).state,"due"));
test("different language is fresh",()=>assert.equal(reviewStatus(old,"fr","book",now).state,"fresh"));
test("future attempt is ignored",()=>{
 const future={...old[0],at:"2099-01-01T00:00:00Z"};
 assert.equal(reviewStatus([...old,future],"de","book",now).state,"due");
});
test("counts remain independent",()=>{
 const c=reviewCounts(old,["book","key"],now);
 assert.equal(c.de.due,1);assert.equal(c.fr.fresh,2);assert.equal(c.ja.certified,0);
});

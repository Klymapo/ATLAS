import test from "node:test";
import assert from "node:assert/strict";
import {reviewStatus} from "../engine/review_integrity.mjs";
test("imported far-future due date is ignored",()=>{
 const e={id:"fr:key",language:"fr",concept:"key",at:"2026-10-10T00:00:00Z",correct:true,hint_used:false,due_at:"2099-01-01T00:00:00Z"};
 assert.equal(reviewStatus([e],"fr","key","2026-10-14T00:00:00Z").state,"due");
});

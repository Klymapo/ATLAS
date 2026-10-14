// ATLAS: local-only, unverified review evidence utilities.
// No student data is transmitted; these helpers never certify proficiency.
const LANGUAGES = new Set(["fr", "de", "ru", "ja"]);
const HOUR = 3600000;
const dateValue = value => typeof value === "string" && Number.isFinite(Date.parse(value))
  ? Date.parse(value) : null;

export function reviewStatus(attempts, language, concept, now = new Date().toISOString()) {
  if (!LANGUAGES.has(language) || typeof concept !== "string" || !concept)
    throw new Error("Invalid review target");
  const today = dateValue(now);
  if (today === null) throw new Error("Invalid review time");
  const valid = (Array.isArray(attempts) ? attempts : []).filter(entry =>
    entry && entry.language === language && entry.concept === concept &&
    entry.id === language + ":" + concept &&
    dateValue(entry.at) !== null && dateValue(entry.at) <= today);
  valid.sort((a, b) => dateValue(b.at) - dateValue(a.at));
  const last = valid[0];
  if (!last) return { state: "fresh", due_at: null, certified: false };
  const when = dateValue(last.at);
  const planned = dateValue(last.due_at);
  const fallback = when + (last.correct === true && last.hint_used === false ? 24 : 1) * HOUR;
  // Imported dates may be missing or corrupted. Never postpone a review forever.
  const due = planned !== null && planned >= when && planned <= when + 30 * 24 * HOUR
    ? planned : fallback;
  return { state: due <= today ? "due" : "upcoming",
    due_at: new Date(due).toISOString(), certified: false };
}

export function reviewCounts(attempts, concepts, now = new Date().toISOString()) {
  const result = {};
  for (const lang of LANGUAGES) {
    const tally = { due: 0, upcoming: 0, fresh: 0, certified: 0 };
    for (const concept of new Set(concepts)) {
      const status = reviewStatus(attempts, lang, concept, now);
      tally[status.state]++;
    }
    result[lang] = tally;
  }
  return result;
}

// Haalt e-mailadressen uit geplakte tekst (komma, puntkomma, spatie of regeleinde;
// ook "Naam <adres>" uit een mailprogramma). Pure functie, getest in email-list.test.ts.
const EMAIL = /[^\s<>,;"']+@[^\s<>,;"']+\.[^\s<>,;"']+/g;

export function parseEmailList(text: string, max = 200) {
  const found = (text.match(EMAIL) ?? []).map((e) => e.toLowerCase());
  const unique = [...new Set(found)];
  return { emails: unique.slice(0, max), truncated: unique.length > max };
}

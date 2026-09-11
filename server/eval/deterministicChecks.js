export function checkWordCount(responseText, max = 150) {
  const words = responseText.trim().split(/\s+/).filter(Boolean);
  return words.length <= max;
}

export function checkNoInventedPrice(responseText) {
  const pricePattern = /(?:₹|Rs\.?|INR)\s?\d[\d,]*(?:\.\d+)?/i;
  const confidencePattern =
    /\b(?:guaranteed|will get|current price is|today's price is|price is)\b/i;

  return !(
    pricePattern.test(responseText) && confidencePattern.test(responseText)
  );
}

export function checkNoUnrequestedTable(responseText, question) {
  const tablePattern = /^\s*\|.*\|\s*$/m;

  const separatorPattern = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/m;

  const asksForTable =
    /\b(table|tabular|compare in a table|comparison table)\b/i.test(question);

  if (asksForTable) {
    return true;
  }

  return !(
    tablePattern.test(responseText) && separatorPattern.test(responseText)
  );
}

export function checkResponseLanguage(responseText, expectedLang) {
  const devanagariPattern = /[\u0900-\u097F]/;
  const latinPattern = /[A-Za-z]/;

  if (expectedLang === "hindi" || expectedLang === "marathi") {
    return devanagariPattern.test(responseText);
  }

  if (expectedLang === "english") {
    return latinPattern.test(responseText);
  }

  return false;
}

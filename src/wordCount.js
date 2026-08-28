export function count(text) {
  const lowercased = text.toLowerCase();
  const wordRegex = /[\p{L}\p{N}]+(?:'[\p{L}\p{N}]+)*/gu;
  const result = new Map();
  
  for (const match of lowercased.matchAll(wordRegex)) {
    const word = match[0];
    result.set(word, (result.get(word) ?? 0) + 1);
  }
  
  return result;
}

export function encode(text, shift) {
  shift = ((shift % 26) + 26) % 26;
  
  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    
    if (code >= 97 && code <= 122) {
      const base = 97;
      const offset = ((code - base + shift) % 26 + 26) % 26;
      return String.fromCharCode(base + offset);
    }
    
    if (code >= 65 && code <= 90) {
      const base = 65;
      const offset = ((code - base + shift) % 26 + 26) % 26;
      return String.fromCharCode(base + offset);
    }
    
    return char;
  }).join('');
}

export function decode(text, shift) {
  return encode(text, -shift);
}

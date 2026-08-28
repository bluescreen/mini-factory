export function fizzbuzz(n) {
  if (n % 15 === 0) return 'FizzBuzz';
  if (n % 3 === 0) return 'Fizz';
  if (n % 5 === 0) return 'Buzz';
  return String(n);
}

export function fizzbuzz_range(start, end) {
  const result = [];
  for (let i = start; i <= end; i++) {
    result.push(fizzbuzz(i));
  }
  return result;
}

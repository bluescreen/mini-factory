# Implement a FizzBuzz function

# Specification & Implementation Plan

## Public API
- `src/fizzBuzz.js` exporting default `fizzBuzz(limit)` returning string array, and named `fizzBuzzSingle(n)` returning string.

## Data Structures
- Primitive integers for inputs; JavaScript Array of String primitives for sequence outputs.

## Steps
1. Validate `n` is a positive integer.
2. Evaluate divisibility: by 15 -> "FizzBuzz", by 3 -> "Fizz", by 5 -> "Buzz", otherwise string representation of `n`.
3. Iterate from 1 to `limit` to populate and return output array.

## Edge Cases
- Non-numeric or non-integer input: throw TypeError.
- Input less than 1: throw RangeError.

## Files to Write
- `src/fizzBuzz.js`

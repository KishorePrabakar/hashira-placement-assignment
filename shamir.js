// Shamir's Secret Sharing - Find secret using Lagrange Interpolation
// Reads from JSON input, outputs the constant term f(0)

// Convert a value from any base to BigInt
function decodeValue(base, value) {
    return BigInt(parseInt(value, parseInt(base)));
  }
  
  // For large numbers (test case 2), parseInt loses precision
  // Use this for big base conversions
  function decodeValueBig(base, value) {
    const b = BigInt(base);
    let result = 0n;
    for (const char of value.toLowerCase()) {
      const digit = BigInt(parseInt(char, 36)); // handles a-z digits
      result = result * b + digit;
    }
    return result;
  }
  
  // GCD for BigInt
  function gcd(a, b) {
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    while (b) { [a, b] = [b, a % b]; }
    return a;
  }
  
  // Fraction addition: (n1/d1) + (n2/d2) = (n1*d2 + n2*d1) / (d1*d2)
  function addFractions(n1, d1, n2, d2) {
    const num = n1 * d2 + n2 * d1;
    const den = d1 * d2;
    const g = gcd(num < 0n ? -num : num, den < 0n ? -den : den);
    return [num / g, den / g];
  }
  
  // Lagrange Interpolation at x=0 using exact rational arithmetic
  function lagrangeInterpolation(points) {
    const k = points.length;
    let secretNum = 0n;
    let secretDen = 1n;
  
    for (let i = 0; i < k; i++) {
      const xi = points[i].x;
      const yi = points[i].y;
  
      let numerator = 1n;
      let denominator = 1n;
  
      for (let j = 0; j < k; j++) {
        if (i === j) continue;
        const xj = points[j].x;
        numerator *= (0n - xj);
        denominator *= (xi - xj);
      }
  
      // term = yi * numerator / denominator as fraction
      const termNum = yi * numerator;
      const termDen = denominator;
  
      [secretNum, secretDen] = addFractions(secretNum, secretDen, termNum, termDen);
    }
  
    // Should divide evenly for a valid polynomial with integer coefficients
    return secretNum / secretDen;
  }
  
  function findSecret(testCase) {
    const n = testCase.keys.n;
    const k = testCase.keys.k;
  
    // Extract all points
    const points = [];
    for (let i = 1; i <= n; i++) {
      const key = String(i);
      if (testCase[key]) {
        const base = testCase[key].base;
        const value = testCase[key].value;
        const x = BigInt(i);
        const y = decodeValueBig(base, value);
        points.push({ x, y });
        console.log(`  Point (${x}, ${y}) — from base ${base} value "${value}"`);
      }
    }
  
    // Use first k points (or all if you want to verify)
    const selectedPoints = points.slice(0, k);
    const secret = lagrangeInterpolation(selectedPoints);
    return secret;
  }
  
  // ── TEST CASE 1 ──────────────────────────────────────────────
  const testCase1 = {
    "keys": { "n": 4, "k": 3 },
    "1": { "base": "10", "value": "4" },
    "2": { "base": "2", "value": "111" },
    "3": { "base": "10", "value": "12" },
    "6": { "base": "4", "value": "213" }
  };
  
  // ── TEST CASE 2 ──────────────────────────────────────────────
  const testCase2 = {
    "keys": { "n": 10, "k": 7 },
    "1": { "base": "6", "value": "13444211440455345511" },
    "2": { "base": "15", "value": "aed7015a346d635" },
    "3": { "base": "15", "value": "6aeeb69631c227c" },
    "4": { "base": "16", "value": "e1b5e05623d881f" },
    "5": { "base": "8", "value": "316034514573652620673" },
    "6": { "base": "3", "value": "2122212201122002221120200210011020220200" },
    "7": { "base": "3", "value": "20120221122211000100210021102001201112121" },
    "8": { "base": "6", "value": "20220554335330240002224253" },
    "9": { "base": "12", "value": "45153788322a1255483" },
    "10": { "base": "7", "value": "1101613130313526312514143" }
  };
  
  console.log("=== TEST CASE 1 ===");
  console.log("Points decoded:");
  const secret1 = findSecret(testCase1);
  console.log(`\nSECRET (constant term): ${secret1}\n`);
  
  console.log("=== TEST CASE 2 ===");
  console.log("Points decoded:");
  const secret2 = findSecret(testCase2);
  console.log(`\nSECRET (constant term): ${secret2}\n`);
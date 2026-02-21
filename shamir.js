// Shamir Secret Sharing - Recover f(0) using Lagrange Interpolation
// Uses exact BigInt rational arithmetic

// ---------------- Base Conversion ----------------

function decodeValueBig(baseStr, valueStr) {
    const base = BigInt(baseStr);
    let result = 0n;
  
    for (const ch of valueStr.toLowerCase()) {
      const digit = BigInt(parseInt(ch, 36));
      if (digit >= base) {
        throw new Error(`Invalid digit '${ch}' for base ${base}`);
      }
      result = result * base + digit;
    }
  
    return result;
  }
  
  // ---------------- Math Utilities ----------------
  
  function gcd(a, b) {
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    while (b !== 0n) {
      [a, b] = [b, a % b];
    }
    return a;
  }
  
  function addFractions(n1, d1, n2, d2) {
    const num = n1 * d2 + n2 * d1;
    const den = d1 * d2;
    const g = gcd(num, den);
    return [num / g, den / g];
  }
  
  // ---------------- Core Lagrange ----------------
  
  function lagrangeAtZero(points) {
    let secretNum = 0n;
    let secretDen = 1n;
  
    const k = points.length;
  
    for (let i = 0; i < k; i++) {
      const { x: xi, y: yi } = points[i];
  
      let num = 1n;
      let den = 1n;
  
      for (let j = 0; j < k; j++) {
        if (i === j) continue;
  
        const { x: xj } = points[j];
        num *= -xj;            // (0 - xj)
        den *= (xi - xj);
      }
  
      const termNum = yi * num;
      const termDen = den;
  
      [secretNum, secretDen] =
        addFractions(secretNum, secretDen, termNum, termDen);
    }
  
    if (secretNum % secretDen !== 0n) {
      throw new Error("Interpolation did not produce integer secret");
    }
  
    return secretNum / secretDen;
  }
  
  // ---------------- Secret Finder ----------------
  
  function findSecret(testCase) {
    const { n, k } = testCase.keys;
  
    const points = [];
  
    // Extract x from JSON keys directly
    for (const key of Object.keys(testCase)) {
      if (key === "keys") continue;
  
      const x = BigInt(key);
      const { base, value } = testCase[key];
  
      const y = decodeValueBig(base, value);
  
      points.push({ x, y });
    }
  
    if (points.length < k) {
      throw new Error("Not enough points to reconstruct polynomial");
    }
  
    // Sort by x (clean + deterministic)
    points.sort((a, b) => (a.x > b.x ? 1 : -1));
  
    // Use first k points (any k valid ones work)
    const selected = points.slice(0, k);
  
    return lagrangeAtZero(selected);
  }
  
  // ---------------- Usage ----------------
  
  const testCase = require('./input.json'); // Or paste JSON directly
  const secret = findSecret(testCase);
  
  console.log("SECRET:", secret.toString());
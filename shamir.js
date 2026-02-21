function toDecimal(base, val) {
    const b = BigInt(base)
    let out = 0n
    for (const c of val.toLowerCase()) {
      out = out * b + BigInt(parseInt(c, 36))
    }
    return out
  }
  
  function gcd(a, b) {
    if (a < 0n) a = -a
    if (b < 0n) b = -b
    while (b) [a, b] = [b, a % b]
    return a
  }
  
  function addFractions(n1, d1, n2, d2) {
    const n = n1 * d2 + n2 * d1
    const d = d1 * d2
    const g = gcd(n < 0n ? -n : n, d < 0n ? -d : d)
    return [n / g, d / g]
  }
  
  function interpolate(pts) {
    let [rn, rd] = [0n, 1n]
  
    for (let i = 0; i < pts.length; i++) {
      const [xi, yi] = pts[i]
      let [tn, td] = [yi, 1n]
  
      for (let j = 0; j < pts.length; j++) {
        if (i === j) continue
        const xj = pts[j][0]
        tn *= -xj
        td *= xi - xj
      }
  
      const g = gcd(tn < 0n ? -tn : tn, td < 0n ? -td : td)
      ;[tn, td] = [tn / g, td / g]
      ;[rn, rd] = addFractions(rn, rd, tn, td)
    }
  
    if (rd !== 1n && rd !== -1n) return null
    return rn / rd
  }
  
  function* combos(arr, k) {
    if (k === 0) { yield []; return }
    for (let i = 0; i <= arr.length - k; i++)
      for (const rest of combos(arr.slice(i + 1), k - 1))
        yield [arr[i], ...rest]
  }
  
  function solve(input) {
    const { n, k } = input.keys
  
    const points = []
    for (let i = 1; i <= n; i++) {
      const root = input[String(i)]
      if (!root) continue
      points.push([BigInt(i), toDecimal(root.base, root.value)])
    }
  
    const votes = new Map()
    for (const combo of combos(points, k)) {
      const val = interpolate(combo)
      if (val === null) continue
      const s = val.toString()
      votes.set(s, (votes.get(s) ?? 0) + 1)
    }
  
    const [winner] = [...votes.entries()].sort((a, b) => b[1] - a[1])
    return winner[0]
  }
  
  const tc1 = {
    keys: { n: 4, k: 3 },
    1: { base: "10", value: "4" },
    2: { base: "2", value: "111" },
    3: { base: "10", value: "12" },
    6: { base: "4", value: "213" }
  }
  
  const tc2 = {
    keys: { n: 10, k: 7 },
    1:  { base: "6",  value: "13444211440455345511" },
    2:  { base: "15", value: "aed7015a346d635" },
    3:  { base: "15", value: "6aeeb69631c227c" },
    4:  { base: "16", value: "e1b5e05623d881f" },
    5:  { base: "8",  value: "316034514573652620673" },
    6:  { base: "3",  value: "2122212201122002221120200210011020220200" },
    7:  { base: "3",  value: "20120221122211000100210021102001201112121" },
    8:  { base: "6",  value: "20220554335330240002224253" },
    9:  { base: "12", value: "45153788322a1255483" },
    10: { base: "7",  value: "1101613130313526312514143" }
  }
  
  console.log("tc1 constant:", solve(tc1))
  console.log("tc2 constant:", solve(tc2))
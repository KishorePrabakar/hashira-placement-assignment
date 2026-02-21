const fs = require('fs')

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

const files = process.argv.slice(2)

if (files.length === 0) {
  console.error('usage: node solution.js <file.json> [file2.json ...]')
  process.exit(1)
}

for (const file of files) {
  try {
    const input = JSON.parse(fs.readFileSync(file, 'utf8'))
    const secret = solve(input)
    console.log(`${file} -> secret: ${secret}`)
  } catch (e) {
    console.error(`error reading ${file}:`, e.message)
  }
}
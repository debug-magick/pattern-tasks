import { performance } from 'node:perf_hooks';

import { Formatter } from './src/formatter.js';
import { SCHEMA } from './src/schema.js';
import { Table } from './src/table.js';

const ROWS = Number(process.env.ROWS ?? 500000);
const RUNS = Number(process.env.RUNS ?? 3);
const WARMUP = Number(process.env.WARMUP ?? 1);
const SEED = Number(process.env.SEED ?? 42);
const FORMAT = process.env.FORMAT === '1';

const MB = 1024 * 1024;

const makeRng = (seed) => {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 0xffffffff;
  };
};

const randomInt = (rng, min, max) =>
  Math.floor(rng() * (max - min + 1)) + min;

const generateData = (rows, seed) => {
  const rng = makeRng(seed);
  const lines = new Array(rows + 1);
  lines[0] = 'city,population,area,density,country';

  for (let i = 0; i < rows; i++) {
    const population = randomInt(rng, 100000, 30000000);
    const area = randomInt(rng, 300, 20000);
    const density = Math.round(population / area);
    const city = `City${i + 1}`;
    const country = `Country${(i % 50) + 1}`;
    lines[i + 1] = `${city},${population},${area},${density},${country}`;
  }

  return lines.join('\n');
};

const runOnce = (data) => {
  if (global.gc) global.gc();
  const startMem = process.memoryUsage().heapUsed;
  const start = performance.now();

  const table = new Table(SCHEMA).fill(data);

  if (FORMAT) {
    const formatter = new Formatter(table.layout);
    const prev = console.log;
    console.log = () => {};
    try {
      formatter.print(table.rows);
    } finally {
      console.log = prev;
    }
  }

  const end = performance.now();
  if (global.gc) global.gc();
  const endMem = process.memoryUsage().heapUsed;

  if (table.rows.length !== ROWS) {
    throw new Error(`Expected ${ROWS} rows, got ${table.rows.length}`);
  }

  const memDelta = Math.max(0, endMem - startMem);

  return {
    ms: end - start,
    memDeltaMb: memDelta / MB,
  };
};

const main = () => {
  console.log('Load test config');
  console.log(`rows=${ROWS} runs=${RUNS} warmup=${WARMUP} format=${FORMAT}`);
  console.log('Generating data...');
  const data = generateData(ROWS, SEED);

  for (let i = 0; i < WARMUP; i++) {
    runOnce(data);
  }

  const results = [];
  for (let i = 0; i < RUNS; i++) {
    const result = runOnce(data);
    results.push(result);
    const rowsPerSec = ROWS / (result.ms / 1000);
    console.log(
      `run ${i + 1}: ${result.ms.toFixed(2)} ms | ${rowsPerSec.toFixed(0)} rows/s | ` +
        `mem ${result.memDeltaMb.toFixed(2)} MB`
    );
  }

  const avgMs = results.reduce((sum, r) => sum + r.ms, 0) / results.length;
  const avgRowsPerSec = ROWS / (avgMs / 1000);
  const avgMem = results.reduce((sum, r) => sum + r.memDeltaMb, 0) / results.length;

  console.log('Summary');
  console.log(
    `avg ${avgMs.toFixed(2)} ms | ${avgRowsPerSec.toFixed(0)} rows/s | mem ${avgMem.toFixed(2)} MB`
  );
};

main();

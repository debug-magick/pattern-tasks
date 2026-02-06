import test from 'node:test';
import assert from 'node:assert/strict';

import { Parser } from './src/parser.js';
import { buildAccumulator } from './src/accumulator.js';
import { Table } from './src/table.js';
import { SCHEMA } from './src/schema.js';
import { DATA } from './data.js';



test('Parser.parse emits rows and trims header', () => {
  const input = '\uFEFFcity, population\nRome, 1\n\n';
  const rows = [];

  Parser.parse(input, (row) => rows.push(row));

  assert.equal(rows.length, 1);
  assert.deepEqual(Object.keys(rows[0]), ['city', 'population']);
  assert.equal(rows[0].city, 'Rome');
  assert.equal(rows[0].population, ' 1');
});

test('buildAccumulator collects rows and metrics', () => {
  const schema = {
    columns: [{ name: 'n', type: 'number' }],
    metrics: [{ name: 'minN', type: 'number', from: 'n', aggregate: 'min' }],
  };

  const { rows, metrics, collectRow } = buildAccumulator(schema, {
    normalizeRow: (row) => row,
    aggregates: {
      min: (acc, row, field) => {
        const prev = acc ?? Infinity;
        return prev > row[field] ? row[field] : prev;
      },
    },
  });

  collectRow({ n: 3 });
  collectRow({ n: 7 });

  assert.equal(rows.length, 2);
  assert.equal(metrics.minN, 3);
});

test('Table.fill computes metrics and sorts', () => {
  const table = new Table(SCHEMA).fill(DATA, Parser);

  assert.equal(table.metrics.maxDensity, 13712);
  assert.equal(table.rows[0].relativeDensity, 100);
  assert.ok(table.rows[0].relativeDensity >= table.rows[1].relativeDensity);
});

test('Table getters expose internal state', () => {
  const table = new Table(SCHEMA).fill(DATA, Parser);

  assert.ok(Array.isArray(table.rows));
  assert.equal(table.schema, SCHEMA);
  assert.ok(table.metrics);
});

test('Table full cycle fills all rows with computed column and sorted order', () => {
  const table = new Table(SCHEMA).fill(DATA, Parser);

  assert.equal(table.rows.length, 10);
  assert.equal(table.rows[0].city, 'Lagos');
  assert.equal(table.rows[0].relativeDensity, 100);
  assert.equal(table.rows[table.rows.length - 1].city, 'Istanbul');

  for (const row of table.rows) {
    assert.equal(typeof row.relativeDensity, 'number');
  }
});

test('Table.fill throws on invalid numeric value', () => {
  const broken = `city,population,area,density,country
CityX,1000,500,bad-number,CountryX`;

  assert.throws(() => {
    new Table(SCHEMA).fill(broken, Parser);
  }, /Invalid value/);
});

test('Parser.parse ignores input with no data rows', () => {
  const rows = [];
  Parser.parse('city,density', (row) => rows.push(row));
  assert.equal(rows.length, 0);
});

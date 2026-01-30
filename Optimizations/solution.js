"use strict";

// Tasks for rewriting:
//   - Topic: SoC, SRP, code characteristics, V8
//   - Apply optimizations of computing resources: processor, memory
//   - Minimize cognitive complexity
//   - Respect SRP and SoC
//   - Improve readability (understanding), reliability
//   - Optimize for maintainability, reusability, flexibility
//   - Make code testable
//   - Implement simple unittests without frameworks
// Additional tasks:
//   - Try to implement in multiple paradigms: OOP, FP, procedural, mixed
//   - Prepare load testing and trace V8 deopts


const OPERATIONS = {
  max: (table, field) => {
    return table.reduce((acc, curr) => {
      return acc > curr[field] ? acc : curr[field];
    }, -Infinity);
  },
};

const getTypeDefaultValue = (type) => {
  switch (type) {
    case 'string':
      return '';
    case 'number':
      return 0;
    default:
      throw new Error('Not implemented');
  }
};

const parsers = {
  string: (v) => {
    if (typeof v !== 'string') throw new Error('Invalid value');
    return v.trim();
  },
  number: (v) => {
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n)) throw new Error('Invalid value');
    return n;
  },
};

const parse = (value, type) => {
  const fn = parsers[type];
  if (!fn) throw new Error('Not implemented');
  return fn(value);
};


function parseRawRow(raw, columns) {
  const cells = raw.split(',');
  const row = {};

  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    const cell = cells[i];
    row[col.name] =
      cell !== undefined ? parse(cell, col.type) : getTypeDefaultValue(col.type);
  }

  return row;
}

function parseTable(raw, columns) {
  const rows = raw.split('\n');
  rows.shift();

  const parsedRows = [];
  for (const rawRow of rows) {
    parsedRows.push(parseRawRow(rawRow, columns));
  }

  return parsedRows;
}


function initMetrics(metricDefs) {
  const metrics = {};
  for (const metric of metricDefs) {
    metrics[metric.name] = getTypeDefaultValue(metric.type);
  }
  return metrics;
}

function calculateMetrics(table, metricDefs) {
  const metrics = initMetrics(metricDefs);

  for (const metric of metricDefs) {
    const fn = OPERATIONS[metric.aggregate];
    if (!fn) throw new Error('Not implemented');
    metrics[metric.name] = fn(table, metric.from);
  }

  return metrics;
}


function populateComputedColumns(table, columns, metrics) {
  for (const row of table) {
    for (const col of columns) {
      if (!col.calculate) continue;
      row[col.name] = col.calculate(row, metrics);
    }
  }
}


function sortTable(table, sortBy) {
  if (!sortBy) return;

  const order = sortBy.order === 'asc' ? 1 : -1;
  const col = sortBy.column;

  table.sort((a, b) => (a[col] - b[col]) * order);
}


class Table {
  #schema = null;
  #table = null;
  #metrics = null;

  constructor(config) {
    this.#schema = config;
    this.#metrics = initMetrics(config.metrics);
  }

  fill(raw) {
    const { columns, metrics: metricDefs, sortBy } = this.#schema;

    this.#table = parseTable(raw, columns);
    this.#metrics = calculateMetrics(this.#table, metricDefs);
    populateComputedColumns(this.#table, columns, this.#metrics);
    sortTable(this.#table, sortBy);
  }

  print() {
    console.table(this.#table);
  }
}

const data = `city,population,area,density,country
  Shanghai,24256800,6340,3826,China
  Delhi,16787941,1484,11313,India
  Lagos,16060303,1171,13712,Nigeria
  Istanbul,14160467,5461,2593,Turkey
  Tokyo,13513734,2191,6168,Japan
  Sao Paulo,12038175,1521,7914,Brazil
  Mexico City,8874724,1486,5974,Mexico
  London,8673713,1572,5431,United Kingdom
  New York City,8537673,784,10892,United States
  Bangkok,8280925,1569,5279,Thailand`;

const CONFIG = {
  columns: [
    { name: 'city', type: 'string' },
    { name: 'population', type: 'number' },
    { name: 'area', type: 'number' },
    { name: 'density', type: 'number' },
    { name: 'country', type: 'string' },
    {
      name: 'relativeDensity',
      type: 'number',
      calculate: (row, metrics) =>
        Math.round((row.density * 100) / metrics.maxDensity),
    },
  ],
  sortBy: { column: 'relativeDensity', order: 'desc' },
  metrics: [{ name: 'maxDensity', type: 'number', from: 'density', aggregate: 'max' }],
};

const t = new Table(CONFIG);
t.fill(data);
t.print();
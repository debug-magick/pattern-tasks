export const parseHeader = (header) => {
  if (!header) return [];
  const cleaned = header.replace(/^\uFEFF/, '');
  return cleaned.split(',').map((col) => col.trim());
};

export const parseRow = (row, columns) => {
  const cells = row.split(',');
  const parsed = {};

  if (!cells.length) return parsed;

  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    const cell = cells[i];
    parsed[col] = cell;
  }

  return parsed;
};


export const AGGREGATES = {
  max: (acc, row, field) => {
    const prev = acc ?? -Infinity;
    return prev > row[field] ? prev : row[field];
  },
};

const VALIDATORS = {
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

const getTypeDefaultValue = (type) => {
  switch (type) {
    case 'string':
      return '';
    case 'number':
      return 0;
    case 'object':
      return null;
    default:
      throw new Error('Not implemented');
  }
};

const validate = (value, type) => {
  const fn = VALIDATORS[type];
  if (!fn) throw new Error('Not implemented');
  return fn(value);
};

export const normalizeRow = (row, columns) => {
  const normalized = {};
  for (const column of columns) {
    const value = row[column.name];
    normalized[column.name] =
      value === undefined ? getTypeDefaultValue(column.type) : validate(value, column.type);
  }
  return normalized;
};

export const initMetrics = (metricDefs) => {
  const metrics = {};
  for (const metric of metricDefs) {
    metrics[metric.name] = getTypeDefaultValue(metric.type);
  }
  return metrics;
};

export const populateComputedColumns = (rows, columns, metrics) => {
  for (const row of rows) {
    for (const col of columns) {
      if (!col.calculate) continue;
      row[col.name] = col.calculate(row, metrics);
    }
  }
};

export const sortRows = (rows, sortBy) => {
  if (!sortBy) return rows;
  const order = sortBy.order === 'asc' ? 1 : -1;
  const col = sortBy.column;
  return rows.sort((a, b) => (a[col] - b[col]) * order);
};

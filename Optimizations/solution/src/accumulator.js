export const buildAccumulator = (schema, helpers) => {
  const { normalizeRow, aggregates } = helpers;
  const metricDefs = schema.metrics;
  const rows = [];
  const metrics = {}

  const collectRow = (row) => {
    const normalized = normalizeRow(row, schema.columns);
    for (const metric of metricDefs) {
      const fn = aggregates[metric.aggregate];
      if (!fn) throw new Error('Not implemented');
      metrics[metric.name] = fn(metrics[metric.name], normalized, metric.from);
    }
    rows.push(normalized);
  };

  return { rows, metrics, collectRow };
};

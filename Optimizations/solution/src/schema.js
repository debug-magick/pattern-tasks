export const SCHEMA = {
  columns: [
    { name: 'city', type: 'string', width: 18 },
    { name: 'population', type: 'number', width: 10 },
    { name: 'area', type: 'number', width: 8 },
    { name: 'density', type: 'number', width: 8 },
    { name: 'country', type: 'string', width: 18 },
    {
      name: 'relativeDensity',
      type: 'number',
      width: 6,
      calculate: (row, metrics) =>
        Math.round((row.density * 100) / metrics.maxDensity),
    },
  ],
  sortBy: { column: 'relativeDensity', order: 'desc' },
  metrics: [{ name: 'maxDensity', type: 'number', from: 'density', aggregate: 'max' }],
};

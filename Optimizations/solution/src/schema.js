export const SCHEMA = {
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

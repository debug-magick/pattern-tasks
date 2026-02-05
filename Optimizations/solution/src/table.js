"use strict";

import { buildAccumulator } from './accumulator.js';
import { AGGREGATES,initMetrics, normalizeRow, populateComputedColumns, sortRows } from './util.js';

export class Table {
  #schema = null;
  #table = null;
  #metrics = null;

  constructor(config) {
    this.#schema = config;
    this.#metrics = initMetrics(config.metrics);
  }

  static fromRaw(raw, schema, parser){
    const table = new Table(schema)

    const { collectRow, metrics, rows } = buildAccumulator(schema, {
      normalizeRow,
      aggregates: AGGREGATES,
    });
    
    parser.parse(raw, collectRow)

    table.#table = rows
    table.#metrics = metrics
    populateComputedColumns(table.#table, table.#schema.columns, table.#metrics)
    sortRows(table.#table, table.#schema.sortBy)

    return table
  }

  get rows() {
    return this.#table;
  }

  get metrics() {
    return this.#metrics;
  }

  get schema() {
    return this.#schema;
  }
}

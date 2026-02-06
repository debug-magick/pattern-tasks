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

  fill(raw, parser) {
    const { collectRow, metrics, rows } = buildAccumulator(this.#schema, {
      normalizeRow,
      aggregates: AGGREGATES,
    });
    
    parser.parse(raw, collectRow);

    this.#table = rows;
    this.#metrics = metrics;
    populateComputedColumns(this.#table, this.#schema.columns, this.#metrics);
    sortRows(this.#table, this.#schema.sortBy);

    return this;
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

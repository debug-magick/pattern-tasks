const DEFAULT_LAYOUT = [
  { width: 18, align: 'end' },
  { width: 10, align: 'start' },
  { width: 8, align: 'start' },
  { width: 8, align: 'start' },
  { width: 18, align: 'start' },
  { width: 6, align: 'start' },
];

export class Formatter {
  #layout = null

  constructor(layout = DEFAULT_LAYOUT) {
    this.#layout = layout
  }

  formatRow(row) {
    const values = Object.values(row ?? {});
    let line = '';

    for (let i = 0; i < values.length; i++) {
      const rule = this.#layout[i % this.#layout.length];
      const value = String(values[i] ?? '');
      line += rule.align === 'end' ? value.padEnd(rule.width) : value.padStart(rule.width);
    }

    return line;
  }

  print(rows) {
    for (const row of rows) {
      console.log(this.formatRow(row));
    }
  }
}

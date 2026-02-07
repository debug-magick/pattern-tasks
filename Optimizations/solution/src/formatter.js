const DEFAULT_COLUMN_WIDTH = 6
const DEFAULT_LAYOUT = Object.freeze([DEFAULT_COLUMN_WIDTH])

export class Formatter {
  #layout = null

  constructor(layout = DEFAULT_LAYOUT) {
    this.#layout = layout
  }

  #formatRow(row) {
    const values = Object.values(row ?? {});
    let line = '';

    for (let i = 0; i < values.length; i++) {
      const width = this.#layout[i % this.#layout.length];
      const value = String(values[i] ?? '');
      line += i === 0 ?  value.padEnd(width) : value.padStart(width)
    }

    return line;
  }

  print(rows) {
    for (const row of rows) {
      console.log(this.#formatRow(row));
    }
  }
}

import { parseHeader, parseRow } from './util.js';

export class Parser {
    static parse(input, onRow){
      const rows = input.split('\n');
      if(rows.length < 2) return

      const header = rows.shift();
      const columns = parseHeader(header);

      for (const row of rows) {
        if (!row) continue;
        const parsedRow = parseRow(row, columns);
        if(onRow) onRow(parsedRow)
      }
    }
}



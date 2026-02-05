import { parseHeader, parseRow } from './util.js';

export class Parser {
    static parse(input, onRow){
      const rows = input.split('\n');
      if(rows.length < 2) return

      const header = rows[0]
      const columns = parseHeader(header);

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (!row) continue;
        const parsedRow = parseRow(row, columns);
        if(onRow) onRow(parsedRow)
      }
    }
}



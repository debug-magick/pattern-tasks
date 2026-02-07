import { stripBom } from "./util.js";


const parseHeader = (header) => {
  if (!header) return [];
  const cleaned = stripBom(header);
  return cleaned.split(',').map((col) => col.trim());
};

const parseRow = (row, columns) => {
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

export const  parse = (input, onRow) =>{
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


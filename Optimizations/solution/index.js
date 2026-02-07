import { DATA } from "./data.js";
import { Formatter } from "./src/formatter.js";
import { parse } from "./src/parser.js";
import { SCHEMA } from "./src/schema.js";
import { Table } from "./src/table.js";

const t = new Table(SCHEMA).fill(DATA, parse);
const formatter = new Formatter(t.layout.map(c => c.width));

formatter.print(t.rows);

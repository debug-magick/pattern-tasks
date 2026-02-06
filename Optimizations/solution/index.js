import { DATA } from "./data.js";
import { Formatter } from "./src/formatter.js";
import { Parser } from "./src/parser.js";
import { SCHEMA } from "./src/schema.js";
import { Table } from "./src/table.js";

const t = new Table(SCHEMA).fill(DATA, Parser);
const formatter = new Formatter();

formatter.print(t.rows);

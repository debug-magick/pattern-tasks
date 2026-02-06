import { DATA } from "./data.js";
import { Formatter } from "./src/formatter.js";
import { SCHEMA } from "./src/schema.js";
import { Table } from "./src/table.js";

const t = new Table(SCHEMA).fill(DATA);
const formatter = new Formatter();

formatter.print(t.rows);

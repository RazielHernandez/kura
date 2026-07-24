export interface Migration {
  version: number;
  name: string;
  up: string;
}

import { migration001 } from "./migration001";

export const migrations: Migration[] = [
  migration001,
];
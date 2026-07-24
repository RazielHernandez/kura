import { Migration } from "./index";

export const migration001: Migration = {
  version: 1,
  name: "Initial Database",

  up: `
    CREATE TABLE IF NOT EXISTS collections (

        id TEXT PRIMARY KEY NOT NULL,

        name TEXT NOT NULL,

        icon TEXT,

        color TEXT,

        description TEXT,

        sortOrder INTEGER DEFAULT 0,

        createdAt TEXT NOT NULL,

        updatedAt TEXT NOT NULL

    );

    CREATE TABLE IF NOT EXISTS items (

        id TEXT PRIMARY KEY NOT NULL,

        collectionId TEXT NOT NULL,

        name TEXT NOT NULL,

        description TEXT,

        favorite INTEGER DEFAULT 0,

        createdAt TEXT NOT NULL,

        updatedAt TEXT NOT NULL,

        FOREIGN KEY(collectionId)
            REFERENCES collections(id)
            ON DELETE CASCADE

    );

    CREATE TABLE IF NOT EXISTS collection_fields (

        id TEXT PRIMARY KEY NOT NULL,

        collectionId TEXT NOT NULL,

        name TEXT NOT NULL,

        type TEXT NOT NULL,

        required INTEGER DEFAULT 0,

        sortOrder INTEGER DEFAULT 0,

        createdAt TEXT NOT NULL,

        FOREIGN KEY(collectionId)
            REFERENCES collections(id)
            ON DELETE CASCADE

    );
    
    CREATE TABLE IF NOT EXISTS item_values (

        id TEXT PRIMARY KEY NOT NULL,

        itemId TEXT NOT NULL,

        fieldId TEXT NOT NULL,

        value TEXT,

        FOREIGN KEY(itemId)
            REFERENCES items(id)
            ON DELETE CASCADE,

        FOREIGN KEY(fieldId)
            REFERENCES collection_fields(id)
            ON DELETE CASCADE

    );`
}

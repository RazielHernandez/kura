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

        updatedAt TEXT NOT NULL,

        deletedAt TEXT

    );

    CREATE TABLE IF NOT EXISTS items (

        id TEXT PRIMARY KEY NOT NULL,

        collectionId TEXT NOT NULL,

        name TEXT NOT NULL,

        description TEXT,

        favorite INTEGER DEFAULT 0,

        createdAt TEXT NOT NULL,

        updatedAt TEXT NOT NULL,

        deletedAt TEXT,

        FOREIGN KEY(collectionId)
            REFERENCES collections(id)
            ON DELETE CASCADE

    );

    CREATE TABLE IF NOT EXISTS collection_fields (

        id TEXT PRIMARY KEY NOT NULL,

        collectionId TEXT NOT NULL,

        name TEXT NOT NULL,

        fieldType TEXT NOT NULL,

        required INTEGER DEFAULT 0,

        sortOrder INTEGER DEFAULT 0,

        createdAt TEXT NOT NULL,

        updatedAt TEXT NOT NULL,

        deletedAt TEXT,

        FOREIGN KEY(collectionId)
            REFERENCES collections(id)
            ON DELETE CASCADE

    );
    
    CREATE TABLE IF NOT EXISTS item_values (

        id TEXT PRIMARY KEY NOT NULL,

        itemId TEXT NOT NULL,

        fieldId TEXT NOT NULL,

        value TEXT,

        createdAt TEXT NOT NULL,

        updatedAt TEXT NOT NULL,

        deletedAt TEXT,

        FOREIGN KEY(itemId)
            REFERENCES items(id)
            ON DELETE CASCADE,

        FOREIGN KEY(fieldId)
            REFERENCES collection_fields(id)
            ON DELETE CASCADE

    );
    
    CREATE TABLE IF NOT EXISTS item_images (

        id TEXT PRIMARY KEY NOT NULL,

        itemId TEXT NOT NULL,

        uri TEXT NOT NULL,

        thumbnailUri TEXT,

        sortOrder INTEGER DEFAULT 0,

        createdAt TEXT NOT NULL,

        updatedAt TEXT NOT NULL,

        deletedAt TEXT,

        FOREIGN KEY(itemId)
            REFERENCES items(id)
            ON DELETE CASCADE

    );
    
    CREATE TABLE IF NOT EXISTS tags (

        id TEXT PRIMARY KEY NOT NULL,

        collectionId TEXT NOT NULL,

        name TEXT NOT NULL,

        color TEXT,

        createdAt TEXT NOT NULL,

        updatedAt TEXT NOT NULL,

        deletedAt TEXT,

        FOREIGN KEY(collectionId)
            REFERENCES collections(id)
            ON DELETE CASCADE

    );
    
    CREATE TABLE IF NOT EXISTS item_tags (

        itemId TEXT NOT NULL,

        tagId TEXT NOT NULL,

        PRIMARY KEY(itemId, tagId),

        FOREIGN KEY(itemId)
            REFERENCES items(id)
            ON DELETE CASCADE,

        FOREIGN KEY(tagId)
            REFERENCES tags(id)
            ON DELETE CASCADE

    );
    
    CREATE TABLE IF NOT EXISTS item_notes (

        id TEXT PRIMARY KEY NOT NULL,

        itemId TEXT NOT NULL,

        content TEXT NOT NULL,

        createdAt TEXT NOT NULL,

        updatedAt TEXT NOT NULL,

        deletedAt TEXT,

        FOREIGN KEY(itemId)
            REFERENCES items(id)
            ON DELETE CASCADE

    );
    
    CREATE TABLE IF NOT EXISTS custom_lists (

        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        createdAt TEXT NOT NULL,

        updatedAt TEXT NOT NULL,

        deletedAt TEXT,
    );
    
    CREATE TABLE IF NOT EXISTS list_items (

        listId TEXT NOT NULL,
        itemId TEXT NOT NULL,
        PRIMARY KEY(listId, itemId),
        FOREIGN KEY(listId)
            REFERENCES custom_lists(id)
            ON DELETE CASCADE,
        FOREIGN KEY(itemId)
            REFERENCES items(id)
            ON DELETE CASCADE

    );
    
    CREATE TABLE IF NOT EXISTS item_history (

        id TEXT PRIMARY KEY NOT NULL,
        itemId TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY(itemId)
            REFERENCES items(id)
            ON DELETE CASCADE

    );
    
    CREATE TABLE IF NOT EXISTS app_settings (

        key TEXT PRIMARY KEY NOT NULL,
        value TEXT

    );
    
    CREATE INDEX IF NOT EXISTS idx_items_collection
    ON items(collectionId);

    CREATE INDEX IF NOT EXISTS idx_fields_collection
    ON collection_fields(collectionId);

    CREATE INDEX IF NOT EXISTS idx_values_item
    ON item_values(itemId);

    CREATE INDEX IF NOT EXISTS idx_values_field
    ON item_values(fieldId);

    CREATE INDEX IF NOT EXISTS idx_images_item
    ON item_images(itemId);

    CREATE INDEX IF NOT EXISTS idx_notes_item
    ON item_notes(itemId);

    CREATE INDEX IF NOT EXISTS idx_history_item
    ON item_history(itemId);

    CREATE INDEX IF NOT EXISTS idx_tags_collection
    ON tags(collectionId);`
}

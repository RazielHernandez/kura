import { SQLiteDatabase } from "expo-sqlite";
import { db } from "./database";

class DatabaseService {

    private readonly database: SQLiteDatabase;

    constructor() {
        this.database = db;
    }

    get connection(): SQLiteDatabase {
        return this.database;
    }

}

export const databaseService = new DatabaseService();
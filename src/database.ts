import sqlite3 from 'sqlite3';

export interface weatherData { 
	id: string;
	location: string;
	temperature: string;	
}

export async function createDatabase() {
    try {        
        const db = new sqlite3.Database('./duress.sqlite');
        return db;
    } catch (error) {
        console.error(`Unable to create database: ${error}`);
    }
}

export async function insertRecords(db: any, weatherRecords: any[]) {
    try {
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS weatherTable (
                id TEXT PRIMARY KEY,
                location TEXT NOT NULL,
                temperature TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT (datetime('now', 'utc'))
                );
            `, function (error) {
                if (error) {
                    console.error(`Error creating table: ${error.message}`);
                } else {
                    console.log('Table created successfully');
                }
            });
            db.run("BEGIN TRANSACTION;");

            const insert = db.prepare(`
                INSERT INTO weatherTable (id, location, temperature)
                VALUES (?, ?, ?)
            `);
    
            for (const weatherRecord of weatherRecords) {
                insert.run(weatherRecord.id, weatherRecord.location, weatherRecord.temperature);
            }
    
            insert.finalize();
            db.run("COMMIT;");
        });
        console.log('Records inserted successfully.');
    } catch (error) {
        console.error(`Unable to insert records: ${error}`);
    }
}


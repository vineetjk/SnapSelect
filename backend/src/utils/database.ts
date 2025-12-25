import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) {
    return db;
  }

  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database.sqlite');

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  return db;
}

export async function initializeDatabase(): Promise<void> {
  const database = await getDb();

  // Create photographers table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS photographers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      studio_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create clients table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      photographer_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      unique_link TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE CASCADE
    )
  `);

  // Create photos table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      photographer_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      is_selected BOOLEAN DEFAULT 0,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE CASCADE
    )
  `);

  // Create favorites/likes table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      photo_id INTEGER NOT NULL,
      client_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(photo_id, client_id),
      FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  await database.exec(`
    CREATE INDEX IF NOT EXISTS idx_clients_photographer ON clients(photographer_id);
    CREATE INDEX IF NOT EXISTS idx_photos_client ON photos(client_id);
    CREATE INDEX IF NOT EXISTS idx_photos_photographer ON photos(photographer_id);
    CREATE INDEX IF NOT EXISTS idx_favorites_photo ON favorites(photo_id);
    CREATE INDEX IF NOT EXISTS idx_favorites_client ON favorites(client_id);
  `);

  console.log('Database initialized successfully');
}

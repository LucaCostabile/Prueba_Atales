const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./productos.db', (err) => {
  if (err) {
    console.error('Error al conectar con SQLite:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite');
  }
});

// Crear la tabla de productos si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      precio REAL NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error al crear la tabla de productos:', err.message);
    }
  });

  // Crear la tabla de usuarios si no existe
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error al crear la tabla de usuarios:', err.message);
    }
  });

  // Verificar si las columnas reset_token y reset_token_expiry existen antes de añadirlas
  db.all("PRAGMA table_info(users);", (err, columns) => {
    if (err) {
      console.error('Error al obtener la información de las columnas:', err.message);
    } else {
      const columnNames = columns.map(col => col.name);

      // Añadir reset_token si no existe
      if (!columnNames.includes('reset_token')) {
        db.run(`
          ALTER TABLE users ADD COLUMN reset_token TEXT;
        `, (err) => {
          if (err) {
            console.error('Error al agregar la columna reset_token:', err.message);
          }
        });
      }

      // Añadir reset_token_expiry si no existe
      if (!columnNames.includes('reset_token_expiry')) {
        db.run(`
          ALTER TABLE users ADD COLUMN reset_token_expiry INTEGER;
        `, (err) => {
          if (err) {
            console.error('Error al agregar la columna reset_token_expiry:', err.message);
          }
        });
      }
    }
  });
});

module.exports = db;

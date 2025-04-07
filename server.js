const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');
const auth = require('./backend/auth');
const rest = require('./backend/Rest');
const path = require('path');

// Crear una instancia de Express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Para parsear el cuerpo de las solicitudes POST en formato JSON
app.use(express.static(path.join(__dirname, 'frontend'))); // Servir archivos estáticos desde la carpeta frontend
app.use(express.static('frontend'));


// Rutas de autenticación
app.use('/auth', auth);

// Rutas de restablecimiento de contraseña
app.use('/reset', rest);

// Crear producto (POST)
app.post('/api/productos', (req, res) => {
  const { nombre, precio } = req.body;
  const query = 'INSERT INTO productos (nombre, precio) VALUES (?, ?)';
  
  db.run(query, [nombre, precio], function (err) {
    if (err) {
      res.status(500).json({ message: 'Error al agregar el producto' });
    } else {
      res.status(201).json({ id: this.lastID, nombre, precio });
    }
  });
});

// Leer productos (GET)
app.get('/api/productos', (req, res) => {
  const query = 'SELECT * FROM productos';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ message: 'Error al obtener los productos' });
    } else {
      res.json(rows);
    }
  });
});

// Actualizar producto (PUT)
app.put('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio } = req.body;
  const query = 'UPDATE productos SET nombre = ?, precio = ? WHERE id = ?';
  
  db.run(query, [nombre, precio, id], function (err) {
    if (err) {
      res.status(500).json({ message: 'Error al actualizar el producto' });
    } else {
      res.json({ id, nombre, precio });
    }
  });
});

// Eliminar producto (DELETE)
app.delete('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM productos WHERE id = ?';
  
  db.run(query, [id], function (err) {
    if (err) {
      res.status(500).json({ message: 'Error al eliminar el producto' });
    } else {
      res.json({ message: 'Producto eliminado' });
    }
  });
});

// Iniciar el servidor
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

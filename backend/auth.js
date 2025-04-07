const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../database'); 
const router = express.Router();
const SECRET_KEY = 'secreto_super_seguro';

// Registro de usuario 
router.post('/register', async (req, res) => {
    const { email, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verificar si el email ya está registrado
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (user) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }

        db.run('INSERT INTO users (email, username, password) VALUES (?, ?, ?)', [email, username, hashedPassword], (err) => {
            if (err) return res.status(400).json({ error: 'Error al registrar usuario' });
            res.json({ message: 'Registro exitoso' });
        });
    });
});

// Login de usuario
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    });
});

module.exports = router;

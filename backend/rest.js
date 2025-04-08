const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const db = require('../database'); 
const sgMail = require('@sendgrid/mail');
const path = require('path');

const router = express.Router();  
require('dotenv').config({ path: './api.env' });


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Ruta para solicitar restablecimiento de contraseña
router.post('/reset-password', (req, res) => {
  const { email } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      console.error('Error al buscar el usuario:', err);
      return res.status(500).json({ error: 'Error al buscar el usuario' });
    }

    if (!user) {
      return res.status(400).json({ error: 'El correo electrónico no está registrado' });
    }

    try {
      // Generar token de restablecimiento
      const token = crypto.randomBytes(20).toString('hex');
      const expireTime = Date.now() + 3600000; // Token expira en 1 hora

      console.log('Token generado:', token);  // Mostrar el token generado para depuración

      // Almacenar token en la base de datos
      db.run('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?', [token, expireTime, email], (err) => {
        if (err) {
          console.error('Error al actualizar el token en la base de datos:', err);
          return res.status(500).json({ error: 'Error al generar el token' });
        }

        // Enviar correo con el enlace de restablecimiento usando SendGrid
        const resetLink = `http://localhost:3000/reset/reset-password/${token}`;

        const msg = {
          to: email,
          from: 'atalmendoza03@gmail.com',  
          subject: 'Restablecimiento de contraseña',
          text: `Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para restablecerla: ${resetLink}`,
        };

        sgMail
          .send(msg)
          .then(() => {
            res.json({ message: 'Te hemos enviado un enlace para restablecer tu contraseña' });
          })
          .catch((error) => {
            console.error('Error al enviar el correo:', error);
            res.status(500).json({ error: 'Error al enviar el correo' });
          });
      });
    } catch (err) {
      console.error('Error al generar el token:', err);
      return res.status(500).json({ error: 'Error al generar el token' });
    }
  });
});

// Ruta para confirmar el restablecimiento de la contraseña
router.post('/confirm-reset-password', async (req, res) => {
  const { resetToken, newPassword } = req.body;
  
  console.log("Token recibido en el backend:", resetToken); // Agrega esto para ver el token en el servidor

  if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Faltan datos: resetToken o newPassword' });
  }

  db.get('SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?', [resetToken, Date.now()], async (err, user) => {
      if (!user) {
          return res.status(400).json({ error: 'Token inválido o expirado' });
      }

      try {
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          db.run('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?', 
          [hashedPassword, user.id], (err) => {
              if (err) return res.status(500).json({ error: 'Error al actualizar la contraseña' });
              res.json({ message: 'Contraseña actualizada con éxito' });
          });
      } catch (error) {
          console.error('Error al hashear la contraseña:', error);
          res.status(500).json({ error: 'Error al actualizar la contraseña' });
      }
  });
});



// Ruta para servir la página de restablecer contraseña con el token
router.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;  // Esto captura el token desde la URL
  console.log('Restableciendo la contraseña con el token:', token);  // Verificar si el token es null

  db.get('SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?', [token, Date.now()], (err, user) => {
    if (err) {
      console.error('Error al buscar el usuario:', err);
      return res.status(500).send('Error en la base de datos');
    }

    if (!user) {
      console.log('Token no encontrado o expirado');
      return res.status(400).send('Token inválido o expirado');
    }

    res.sendFile(path.join(__dirname, '../frontend/reset-password.html'));
  });
});


module.exports = router;

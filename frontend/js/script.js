const apiUrl = 'http://localhost:3000/api/productos';

document.addEventListener('DOMContentLoaded', () => {
  // Verificar si estamos en la página 'crud.html'
  if (document.location.pathname.indexOf("crud.html") !== -1) {
    obtenerProductos(); // Llamar la función para cargar los productos
  }
});

// Obtener productos
const obtenerProductos = async () => {
  // Verificar si el elemento con id 'productos-lista' existe
  const tbody = document.getElementById('productos-lista');
  if (!tbody) {
    console.log('El elemento productos-lista no se encontró.');
    return; // Si no se encuentra el elemento, salimos de la función
  }

  try {
    const res = await fetch(apiUrl);
    const productos = await res.json();

    // Limpiar la tabla antes de insertar los productos
    tbody.innerHTML = '';

    // Insertar los productos en la tabla
    productos.forEach((producto) => {
      tbody.innerHTML += `
        <tr id="producto-${producto.id}">
          <td>${producto.id}</td>
          <td>
            <input type="text" value="${producto.nombre}" id="nombre-${producto.id}" disabled />
          </td>
          <td>
            <input type="number" value="${producto.precio}" id="precio-${producto.id}" disabled />
          </td>
          <td>
            <button onclick="eliminarProducto(${producto.id})">Eliminar</button>
            <button onclick="habilitarEdicion(${producto.id})">Actualizar</button>
            <button id="guardar-${producto.id}" style="display:none;" onclick="guardarCambios(${producto.id})">Guardar Cambios</button>
          </td>
        </tr>
      `;
    });
  } catch (error) {
    console.error('Error al obtener los productos:', error);
  }
};

// Agregar producto
const formulario = document.getElementById('producto-form');
if (formulario) {
  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const precio = document.getElementById('precio').value;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, precio }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(`Error al agregar el producto: ${errorData.message}`);
    } else {
      obtenerProductos();
      e.target.reset();
    }
  });
}

// Eliminar producto
const eliminarProducto = async (id) => {
  await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
  obtenerProductos();
};

// Habilitar edición
const habilitarEdicion = (id) => {
  document.getElementById(`nombre-${id}`).disabled = false;
  document.getElementById(`precio-${id}`).disabled = false;
  document.getElementById(`guardar-${id}`).style.display = 'inline'; // Mostrar botón de guardar
};

// Guardar cambios
const guardarCambios = async (id) => {
  const nombre = document.getElementById(`nombre-${id}`).value;
  const precio = document.getElementById(`precio-${id}`).value;

  await fetch(`${apiUrl}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, precio }),
  });

  document.getElementById(`nombre-${id}`).disabled = true;
  document.getElementById(`precio-${id}`).disabled = true;
  document.getElementById(`guardar-${id}`).style.display = 'none'; // Ocultar botón de guardar
  obtenerProductos();
};

// Inicializar
obtenerProductos();

// Logeo y Registro
document.addEventListener('DOMContentLoaded', function() {
  // Lógica para el inicio de sesión
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
      loginForm.addEventListener('submit', async function(event) {
          event.preventDefault(); // Evitar la recarga de la página

          const email = document.getElementById('email').value; // Recoger el email
          const password = document.getElementById('password').value;

          console.log('Intentando iniciar sesión con:', email, password); // Mensaje de depuración

          const response = await fetch('http://localhost:3000/auth/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email, password })
          });

          const result = await response.json();
          console.log('Resultado de la respuesta de inicio de sesión:', result); // Mensaje de depuración

          if (response.ok) {
              localStorage.setItem('token', result.token); // Guardar el token
              alert('Login exitoso');
              window.location.href = 'index.html'; // Redirigir a la página principal
          } else {
              alert(`Error: ${result.error || result.message}`); // Mostrar mensaje de error
          }
      });
  }

  // Lógica para el registro
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Evitar la recarga de la página

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        console.log('Intentando registrar usuario:', username, email); // Mensaje de depuración

        const response = await fetch('http://localhost:3000/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const result = await response.json();
        console.log('Resultado de la respuesta de registro:', result); // Mensaje de depuración

        if (response.ok) {
            alert('Registro exitoso, ahora puedes iniciar sesión.');
            window.location.href = 'login.html'; // Redirigir a la página de inicio de sesión
        } else {
            alert(`Error: ${result.error || result.message}`); // Mostrar mensaje de error
        }
    });
  }
});

// Lógica para el restablecimiento de contraseña
const resetPasswordForm = document.getElementById('reset-password-form');
if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Evitar recarga de página

        const email = document.getElementById('email').value; // Obtener email

        console.log('Solicitando restablecimiento de contraseña para:', email); // Mensaje de depuración

        const response = await fetch('http://localhost:3000/reset/reset-password', {  
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email })
        });

        const result = await response.json();
        console.log('Resultado de la solicitud de restablecimiento:', result); // Mensaje de depuración

        if (response.ok) {
            alert('Te hemos enviado un enlace para restablecer tu contraseña');
            window.location.href = 'login.html'; // Redirigir a login
        } else {
            alert(`Error: ${result.error || result.message}`); // Mostrar error
        }
    });
}

// Lógica para restablecer la contraseña con un token
document.addEventListener('DOMContentLoaded', function () {
  const newPasswordForm = document.getElementById('new-password-form');

  if (newPasswordForm) {
      newPasswordForm.addEventListener('submit', async function (event) {
          event.preventDefault(); // Evitar recarga de página

          const newPassword = document.getElementById('new-password').value;
          const confirmPassword = document.getElementById('confirm-password').value;

          if (newPassword !== confirmPassword) {
              alert('Las contraseñas no coinciden');
              return;
          }

          // Obtener el token desde la URL
          const pathParts = window.location.pathname.split('/');
          const resetToken = pathParts[pathParts.length - 1];

          console.log('Restableciendo la contraseña con el token:', resetToken);

          if (!resetToken) {
              alert('Token de restablecimiento no encontrado.');
              return;
          }

          const response = await fetch('http://localhost:3000/reset/confirm-reset-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ resetToken, newPassword })
          });

          const result = await response.json();
          console.log('Resultado del restablecimiento:', result);

          if (response.ok) {
            alert('Contraseña restablecida con éxito');
            localStorage.removeItem('resetToken');  // Eliminar token almacenado
            window.location.replace('/login.html');  // Redirigir sin que recuerde la página anterior
          } else {
              console.error(`Error: ${result.error || result.message}`);
              alert(`Error: ${result.error || result.message}`);
          }
        
      });
  } else {
      console.log('ℹ️ No se encontró el formulario de restablecimiento. Esto es normal si no estás en la página de restablecimiento.');
  }
});


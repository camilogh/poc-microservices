require('dotenv').config(); // Carga variables de entorno desde el .env de la raíz

const express = require('express');
const { testDbConnection } = require('./config/db'); // Importa la función de prueba de conexión
const userRoutes = require('./routes/user.routes'); // Importa las rutas de usuario

const app = express();
const PORT = process.env.USER_SERVICE_PORT;


// Middleware para que Express pueda entender JSON en las solicitudes
app.use(express.json());

// Probar la conexión a la base de datos al iniciar la aplicación
testDbConnection();

// Usar las rutas de usuario
// Todas las rutas definidas en user.routes.js se prefijarán con '/api/users'
app.use('/api/users', userRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Middleware de manejo de errores global
// Este middleware captura errores que no fueron manejados por rutas o otros middlewares
app.use((err, req, res, next) => {
  console.error(err.stack); // Registra el error en la consola del servidor
  res.status(500).send('Algo salió mal en el servidor!');
});


// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Microservicio de usuarios escuchando en el puerto ${PORT}`);
  console.log(`Puedes acceder a los endpoints de usuarios en: http://localhost:${PORT}/api/users`);
});
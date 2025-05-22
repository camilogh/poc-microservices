require('dotenv').config();  // Carga variables de entorno desde el .env de la raíz

// orders-service/src/app.js
const express = require('express');
const { testDbConnection } = require('./config/db');
const orderRoutes = require('./routes/order.routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Probar la conexión a la base de datos al iniciar la aplicación
testDbConnection();

app.get('/', (req, res) => {
  res.send('¡Hola desde el microservicio de pedidos!');
});

app.use('/api/orders', orderRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal en el servidor de pedidos!');
});

app.listen(PORT, () => {
  console.log(`Microservicio de pedidos escuchando en el puerto ${PORT}`);
  console.log(`Puedes acceder a los endpoints de pedidos en: http://localhost:${PORT}/api/orders`);
});
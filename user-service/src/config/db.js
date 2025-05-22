const mysql = require('mysql2/promise');

// Configuración de la conexión a la base de datos MySQL
// Es buena práctica usar variables de entorno para esto en producción.
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Crear un pool de conexiones para mejor rendimiento y manejo de conexiones.
// Un pool mantiene varias conexiones abiertas y listas para ser usadas.
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión al iniciar la aplicación
async function testDbConnection() {
  try {
    const connection = await pool.getConnection(); // Obtener una conexión del pool
    console.log('Conexión a la base de datos MySQL establecida correctamente a través del pool.');
    connection.release(); // Liberar la conexión de vuelta al pool
  } catch (error) {
    console.error('Error al conectar con la base de datos MySQL:', error.message);
    process.exit(1); // Salir del proceso si no podemos conectar
  }
}

// Exporta el pool de conexiones para que pueda ser usado en otros módulos
module.exports = {
  pool,
  testDbConnection
};
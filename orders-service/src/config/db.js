// orders-service/src/config/db.js
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión a la base de datos MySQL para Orders establecida correctamente a través del pool.');
    connection.release();
  } catch (error) {
    console.error('Error al conectar con la base de datos MySQL para Orders:', error.message);
    process.exit(1);
  }
}

module.exports = {
  pool,
  testDbConnection
};
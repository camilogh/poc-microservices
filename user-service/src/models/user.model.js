const { pool } = require('../config/db'); // Importa el pool de conexiones

// Clase UserModel para interactuar con la tabla 'users'
class UserModel {
  constructor() {
    this.table = 'users';
  }

  // Método para crear un nuevo usuario
  async create(userData) {
    const { name, email, password } = userData;
    const query = `INSERT INTO ${this.table} (name, email, password) VALUES (?, ?, ?)`;
    try {
      const [result] = await pool.execute(query, [name, email, password]);
      return { id: result.insertId, ...userData }; // Devuelve el usuario creado con su ID
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('El correo electrónico ya está registrado.');
      }
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  // Método para obtener todos los usuarios
  async getAll() {
    const query = `SELECT id, name, email, created_at, updated_at FROM ${this.table}`;
    try {
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  // Método para obtener un usuario por su ID
  async getById(id) {
    const query = `SELECT id, name, email, created_at, updated_at FROM ${this.table} WHERE id = ?`;
    try {
      const [rows] = await pool.execute(query, [id]);
      return rows[0]; // Devuelve el primer (y único) resultado
    } catch (error) {
      throw new Error(`Error al obtener usuario por ID: ${error.message}`);
    }
  }

  // Método para actualizar un usuario por su ID
  async update(id, userData) {
    const { name, email, password } = userData;
    let query = `UPDATE ${this.table} SET name = ?, email = ?`;
    const params = [name, email];

    if (password) { // Si se proporciona una nueva contraseña, actualízala
      query += `, password = ?`;
      params.push(password);
    }

    query += ` WHERE id = ?`;
    params.push(id);

    try {
      const [result] = await pool.execute(query, params);
      if (result.affectedRows === 0) {
        return null; // No se encontró el usuario para actualizar
      }
      return { id, ...userData }; // Devuelve el usuario actualizado
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('El correo electrónico ya está registrado.');
      }
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  // Método para eliminar un usuario por su ID
  async delete(id) {
    const query = `DELETE FROM ${this.table} WHERE id = ?`;
    try {
      const [result] = await pool.execute(query, [id]);
      return result.affectedRows > 0; // true si se eliminó, false si no se encontró
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }
}

module.exports = new UserModel(); // Exporta una instancia de la clase
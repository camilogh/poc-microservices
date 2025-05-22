const UserModel = require('../models/user.model'); // Importa el modelo de usuario

// Clase UserController para manejar la lógica de las solicitudes de usuario
class UserController {
  // Método para crear un nuevo usuario
  async createUser(req, res) {
    try {
      const userData = req.body; // Los datos del usuario vienen en el cuerpo de la solicitud
      // Aquí podrías agregar validaciones de entrada (ej. joi, express-validator)
      if (!userData.name || !userData.email || !userData.password) {
        return res.status(400).json({ message: 'Todos los campos (name, email, password) son requeridos.' });
      }

      const newUser = await UserModel.create(userData);
      res.status(201).json({ message: 'Usuario creado exitosamente', user: newUser });
    } catch (error) {
      console.error('Error en UserController.createUser:', error.message);
      if (error.message.includes('correo electrónico ya está registrado')) {
        return res.status(409).json({ message: error.message }); // 409 Conflict
      }
      res.status(500).json({ message: 'Error interno del servidor al crear usuario', error: error.message });
    }
  }

  // Método para obtener todos los usuarios
  async getAllUsers(req, res) {
    try {
      const users = await UserModel.getAll();
      res.status(200).json(users);
    } catch (error) {
      console.error('Error en UserController.getAllUsers:', error.message);
      res.status(500).json({ message: 'Error interno del servidor al obtener usuarios', error: error.message });
    }
  }

  // Método para obtener un usuario por ID
  async getUserById(req, res) {
    try {
      const { id } = req.params; // El ID viene de los parámetros de la URL
      const user = await UserModel.getById(id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error('Error en UserController.getUserById:', error.message);
      res.status(500).json({ message: 'Error interno del servidor al obtener usuario', error: error.message });
    }
  }

  // Método para actualizar un usuario
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const userData = req.body;

      if (Object.keys(userData).length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron datos para actualizar.' });
      }

      const updatedUser = await UserModel.update(id, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: 'Usuario no encontrado para actualizar' });
      }
      res.status(200).json({ message: 'Usuario actualizado exitosamente', user: updatedUser });
    } catch (error) {
      console.error('Error en UserController.updateUser:', error.message);
      if (error.message.includes('correo electrónico ya está registrado')) {
        return res.status(409).json({ message: error.message }); // 409 Conflict
      }
      res.status(500).json({ message: 'Error interno del servidor al actualizar usuario', error: error.message });
    }
  }

  // Método para eliminar un usuario
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const deleted = await UserModel.delete(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Usuario no encontrado para eliminar' });
      }
      res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
      console.error('Error en UserController.deleteUser:', error.message);
      res.status(500).json({ message: 'Error interno del servidor al eliminar usuario', error: error.message });
    }
  }
}

module.exports = new UserController(); // Exporta una instancia de la clase
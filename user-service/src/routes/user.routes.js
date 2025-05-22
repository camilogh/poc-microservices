const express = require('express');
const router = express.Router(); // Router de Express para manejar rutas
const UserController = require('../controllers/user.controller'); // Importa el controlador

// Rutas para las operaciones CRUD de usuarios

// POST /api/users - Crear un nuevo usuario
router.post('/', UserController.createUser);

// GET /api/users - Obtener todos los usuarios
router.get('/', UserController.getAllUsers);

// GET /api/users/:id - Obtener un usuario por ID
router.get('/:id', UserController.getUserById);

// PUT /api/users/:id - Actualizar un usuario por ID
router.put('/:id', UserController.updateUser);

// DELETE /api/users/:id - Eliminar un usuario por ID
router.delete('/:id', UserController.deleteUser);

module.exports = router; // Exporta el router para usarlo en app.js
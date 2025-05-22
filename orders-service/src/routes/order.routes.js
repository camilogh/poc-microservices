// orders-service/src/routes/order.routes.js
const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');

// POST /api/orders - Crear un nuevo pedido
router.post('/', OrderController.createOrder);

// GET /api/orders - Obtener todos los pedidos
router.get('/', OrderController.getAllOrders);

// GET /api/orders/:id - Obtener un pedido por ID
router.get('/:id', OrderController.getOrderById);

module.exports = router;
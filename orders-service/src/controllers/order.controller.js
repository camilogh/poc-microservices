// orders-service/src/controllers/order.controller.js
const OrderModel = require('../models/order.model');
const axios = require('axios'); // Necesitaremos Axios para hacer solicitudes HTTP a user-service

// ** Importante: Asegúrate de instalar axios: npm install axios **

class OrderController {
  async createOrder(req, res) {
    try {
      const { user_id, items } = req.body;

      // 1. Validar datos de entrada básicos
      if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'user_id y items (array no vacío) son requeridos.' });
      }

      // Calcular el total_amount basado en los ítems
      const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      if (isNaN(total_amount) || total_amount <= 0) {
        return res.status(400).json({ message: 'El cálculo del total_amount es inválido.' });
      }

      // 2. Comunicación RESTful: Validar si el user_id existe en user-service
      // URL del microservicio de usuarios (ajusta el puerto si es necesario)
      const USER_SERVICE_URL = `${process.env.USER_SERVICE_URL}:${process.env.USER_SERVICE_PORT}`;


      try {
        const userResponse = await axios.get(`${USER_SERVICE_URL}/api/users/${user_id}`);
        // Si el usuario no se encuentra, axios lanzará un error con status 404
        if (userResponse.status !== 200 || !userResponse.data) {
             return res.status(400).json({ message: 'El user_id proporcionado no existe.' });
        }
        console.log(`Usuario ${user_id} validado correctamente.`);
      } catch (axiosError) {
        if (axiosError.response && axiosError.response.status === 404) {
          return res.status(400).json({ message: `El user_id ${user_id} no existe en el servicio de usuarios.` });
        }
        console.error('Error al validar user_id con user-service:', axiosError.message);
        return res.status(500).json({ message: 'Error al comunicarse con el servicio de usuarios.' });
      }

      // 3. Crear el pedido en la base de datos de orders-service
      const newOrder = await OrderModel.createOrder({ user_id, total_amount, items });
      res.status(201).json({ message: 'Pedido creado exitosamente', order: newOrder });

    } catch (error) {
      console.error('Error en OrderController.createOrder:', error.message);
      res.status(500).json({ message: 'Error interno del servidor al crear pedido', error: error.message });
    }
  }

  async getAllOrders(req, res) {
    try {
      const orders = await OrderModel.getAllOrders();
      res.status(200).json(orders);
    } catch (error) {
      console.error('Error en OrderController.getAllOrders:', error.message);
      res.status(500).json({ message: 'Error interno del servidor al obtener pedidos', error: error.message });
    }
  }

  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await OrderModel.getOrderById(id);
      if (!order) {
        return res.status(404).json({ message: 'Pedido no encontrado' });
      }
      res.status(200).json(order);
    } catch (error) {
      console.error('Error en OrderController.getOrderById:', error.message);
      res.status(500).json({ message: 'Error interno del servidor al obtener pedido', error: error.message });
    }
  }

  // Puedes añadir aquí updateOrder y deleteOrder si lo deseas.
}

module.exports = new OrderController();
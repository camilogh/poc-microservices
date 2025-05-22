// orders-service/src/models/order.model.js
const { pool } = require('../config/db');

class OrderModel {
  constructor() {
    this.table = 'orders';
    this.itemsTable = 'order_items';
  }

  async createOrder(orderData) {
    const { user_id, total_amount, items } = orderData;
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // 1. Insertar el pedido principal
      const [orderResult] = await connection.execute(
        `INSERT INTO ${this.table} (user_id, total_amount) VALUES (?, ?)`,
        [user_id, total_amount]
      );
      const orderId = orderResult.insertId;

      // 2. Insertar los ítems del pedido
      if (items && items.length > 0) {
        const itemValues = items.map(item => [orderId, item.product_name, item.quantity, item.price]);
        // Para inserciones múltiples, se puede usar `query` con un array de arrays
        // Esto es más eficiente que múltiples inserts individuales
        const itemQuery = `INSERT INTO ${this.itemsTable} (order_id, product_name, quantity, price) VALUES ?`;
        await connection.query(itemQuery, [itemValues]);
      }

      await connection.commit();
      return { id: orderId, ...orderData };
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      throw new Error(`Error al crear pedido: ${error.message}`);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  async getAllOrders() {
    let connection;
    try {
      connection = await pool.getConnection();

      // 1. Obtener todos los pedidos principales
      const [orders] = await connection.execute(
        `SELECT id, user_id, total_amount, status, created_at, updated_at FROM ${this.table}`
      );

      // Si no hay pedidos, devolver array vacío
      if (orders.length === 0) {
        return [];
      }

      // 2. Obtener todos los ítems de pedidos y agruparlos
      const [items] = await connection.execute(
        `SELECT id, order_id, product_name, quantity, price FROM ${this.itemsTable}`
      );

      // Mapear ítems a un objeto para fácil acceso por order_id
      const itemsByOrderId = {};
      items.forEach(item => {
        if (!itemsByOrderId[item.order_id]) {
          itemsByOrderId[item.order_id] = [];
        }
        itemsByOrderId[item.order_id].push({
          id: item.id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price
        });
      });

      // 3. Combinar pedidos con sus ítems
      const ordersWithItems = orders.map(order => ({
        ...order,
        items: itemsByOrderId[order.id] || [] // Asigna ítems o un array vacío si no hay
      }));

      return ordersWithItems;
    } catch (error) {
      throw new Error(`Error al obtener pedidos: ${error.message}`);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }


  async getOrderById(id) {
    let connection;
    try {
      connection = await pool.getConnection();

      // 1. Obtener el pedido principal
      const [orders] = await connection.execute(
        `SELECT id, user_id, total_amount, status, created_at, updated_at FROM ${this.table} WHERE id = ?`,
        [id]
      );

      if (orders.length === 0) {
        return null; // Pedido no encontrado
      }
      const order = orders[0];

      // 2. Obtener los ítems para este pedido específico
      const [items] = await connection.execute(
        `SELECT id, product_name, quantity, price FROM ${this.itemsTable} WHERE order_id = ?`,
        [id]
      );

      // 3. Combinar el pedido con sus ítems
      order.items = items;

      return order;
    } catch (error) {
      throw new Error(`Error al obtener pedido por ID: ${error.message}`);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  // Puedes añadir métodos para actualizar y eliminar pedidos/items si es necesario
}

module.exports = new OrderModel();
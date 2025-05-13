import { Telegraf } from "telegraf";
import Order from "../models/orders.js";

// Инициализация бота Telegram
const bot = new Telegraf("7095638242:AAGY5RGu26_GFqM60YEVKt6WPwrSXiM6NQ0");
const TELEGRAM_CHAT_ID = -4730504232;

class OrderController {
  async createOrder(req, res) {
    try {
      const { text, customerName, phoneNumber } = req.body;

      if (!text || !customerName || !phoneNumber) {
        return res.status(400).json({
          message: "Необходимо указать текст заказа, ФИО и номер телефона",
        });
      }

      // Сохраняем заказ в базу данных
      const order = new Order({
        text,
        customerName,
        phoneNumber,
      });

      const savedOrder = await order.save();

      // Формируем сообщение для отправки в Telegram
      const message = `
📋 Новый заказ #${savedOrder._id}!
👤 ФИО: ${customerName}
📞 Телефон: ${phoneNumber}
📝 Текст заказа: ${text}
      `;

      // Отправляем сообщение в Telegram
      await bot.telegram.sendMessage(TELEGRAM_CHAT_ID, message);

      return res.status(200).json({
        success: true,
        message: "Заказ успешно создан и отправлен",
        order: savedOrder,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Ошибка при создании заказа",
        error: error.message,
      });
    }
  }

  async getAllOrders(req, res) {
    try {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.json(orders);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Ошибка при получении заказов",
      });
    }
  }

  async getOrderById(req, res) {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Заказ не найден" });
      }
      return res.json(order);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Ошибка при получении заказа",
      });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { status } = req.body;
      if (!status) {
        return res
          .status(400)
          .json({ message: "Необходимо указать статус заказа" });
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!updatedOrder) {
        return res.status(404).json({ message: "Заказ не найден" });
      }

      return res.json(updatedOrder);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Ошибка при обновлении статуса заказа",
      });
    }
  }
}

export default new OrderController();

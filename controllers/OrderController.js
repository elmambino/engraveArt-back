import { Telegraf } from "telegraf";
import Order from "../models/Orders.js";

// Инициализация бота Telegram
const bot = new Telegraf("7916561506:AAFIZ9WeSGBYOfv1LRQ4MZuDSSvERhNfyag");
const TELEGRAM_CHAT_ID = -4730504232;

// Вынесем функции валидации за пределы класса
const validatePhoneNumber = (phoneNumber) => {
  // Удаляем все пробелы, дефисы, скобки и плюсы
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
  
  // Проверяем, что остались только цифры
  if (!/^\d+$/.test(cleanPhone)) {
    return { isValid: false, message: "Номер телефона должен содержать только цифры" };
  }
  
  // Проверяем длину номера (от 10 до 15 цифр - международный стандарт)
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return { isValid: false, message: "Номер телефона должен содержать от 10 до 15 цифр" };
  }
  
  // Дополнительные проверки для российских номеров
  if (cleanPhone.length === 11 && cleanPhone.startsWith('8')) {
    // Российский номер, начинающийся с 8
    if (!/^8[3-9]\d{9}$/.test(cleanPhone)) {
      return { isValid: false, message: "Неверный формат российского номера телефона" };
    }
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('7')) {
    // Российский номер, начинающийся с 7
    if (!/^7[3-9]\d{9}$/.test(cleanPhone)) {
      return { isValid: false, message: "Неверный формат российского номера телефона" };
    }
  } else if (cleanPhone.length === 10) {
    // Российский номер без кода страны
    if (!/^[3-9]\d{9}$/.test(cleanPhone)) {
      return { isValid: false, message: "Неверный формат номера телефона" };
    }
  }
  
  return { isValid: true, cleanPhone };
};

const validateCustomerName = (name) => {
  // Проверяем, что имя содержит только буквы, пробелы и дефисы
  const nameRegex = /^[а-яёА-ЯЁa-zA-Z\s\-]+$/;
  
  if (!nameRegex.test(name.trim())) {
    return { isValid: false, message: "ФИО должно содержать только буквы" };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, message: "ФИО должно содержать минимум 2 символа" };
  }
  
  return { isValid: true, cleanName: name.trim() };
};

class OrderController {
  async createOrder(req, res) {
    try {
      const { text, customerName, phoneNumber } = req.body;

      if (!text || !customerName || !phoneNumber) {
        return res.status(400).json({
          message: "Необходимо указать текст заказа, ФИО и номер телефона",
        });
      }

      // Валидация ФИО
      const nameValidation = validateCustomerName(customerName);
      if (!nameValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: nameValidation.message,
        });
      }

      // Валидация номера телефона
      const phoneValidation = validatePhoneNumber(phoneNumber);
      if (!phoneValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: phoneValidation.message,
        });
      }

      // Валидация текста заказа
      if (text.trim().length < 5) {
        return res.status(400).json({
          success: false,
          message: "Текст заказа должен содержать минимум 5 символов",
        });
      }

      // Сохраняем заказ в базу данных с очищенными данными
      const order = new Order({
        text: text.trim(),
        customerName: nameValidation.cleanName,
        phoneNumber: phoneValidation.cleanPhone,
      });

      const savedOrder = await order.save();

      // Формируем сообщение для отправки в Telegram
      const message = `
📋 Новый заказ #${savedOrder._id}!
👤 ФИО: ${nameValidation.cleanName}
📞 Телефон: ${phoneValidation.cleanPhone}
📝 Текст заказа: ${text.trim()}
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

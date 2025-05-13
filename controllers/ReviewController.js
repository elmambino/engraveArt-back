import Review from "../models/Review.js";
import { Telegraf } from "telegraf";
const bot = new Telegraf("7095638242:AAGY5RGu26_GFqM60YEVKt6WPwrSXiM6NQ0");
const TELEGRAM_CHAT_ID = -4730504232;

class ReviewController {
  async createReview(req, res) {
    try {
      const { stars, name, text } = req.body;

      if (!stars || !name || !text) {
        return res.status(400).json({
          message: "Необходимо указать количество звезд, имя и текст отзыва",
        });
      }

      if (stars < 1 || stars > 5) {
        return res.status(400).json({
          message: "Количество звезд должно быть от 1 до 5",
        });
      }

      const review = new Review({
        stars,
        name,
        text,
      });

      const savedReview = await review.save();

      const starsDisplay = "⭐".repeat(stars);
      const message = `
  📣 Новый отзыв!
  👤 Имя: ${name}
  ⭐ Оценка: ${starsDisplay} (${stars}/5)
  💬 Текст: ${text}
        `;

      await bot.telegram.sendMessage(TELEGRAM_CHAT_ID, message);

      return res.status(201).json({
        success: true,
        message: "Отзыв успешно создан",
        review: savedReview,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Ошибка при создании отзыва",
        error: error.message,
      });
    }
  }

  async getAllReviews(req, res) {
    try {
      const reviews = await Review.find().sort({ createdAt: -1 });
      return res.json(reviews);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Ошибка при получении отзывов",
      });
    }
  }
}

export default new ReviewController();

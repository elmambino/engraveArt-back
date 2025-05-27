import Review from "../models/Review.js";
import { Telegraf, Markup } from "telegraf";

const bot = new Telegraf("7916561506:AAFIZ9WeSGBYOfv1LRQ4MZuDSSvERhNfyag");
const TELEGRAM_CHAT_ID = -4730504232;

// Настройка обработчиков для кнопок
bot.action(/approve_(.+)/, async (ctx) => {
  try {
    const reviewId = ctx.match[1];
    
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status: 'approved' },
      { new: true }
    );

    if (review) {
      await ctx.editMessageText(
        `✅ Отзыв одобрен!\n\n👤 Имя: ${review.name}\n⭐ Оценка: ${"⭐".repeat(review.stars)} (${review.stars}/5)\n💬 Текст: ${review.text}`
      );
      await ctx.answerCbQuery('Отзыв одобрен!');
    } else {
      await ctx.answerCbQuery('Отзыв не найден');
    }
  } catch (error) {
    console.error('Ошибка при одобрении отзыва:', error);
    await ctx.answerCbQuery('Ошибка при одобрении отзыва');
  }
});

bot.action(/reject_(.+)/, async (ctx) => {
  try {
    const reviewId = ctx.match[1];
    
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status: 'rejected' },
      { new: true }
    );

    if (review) {
      await ctx.editMessageText(
        `❌ Отзыв отклонен!\n\n👤 Имя: ${review.name}\n⭐ Оценка: ${"⭐".repeat(review.stars)} (${review.stars}/5)\n💬 Текст: ${review.text}`
      );
      await ctx.answerCbQuery('Отзыв отклонен!');
    } else {
      await ctx.answerCbQuery('Отзыв не найден');
    }
  } catch (error) {
    console.error('Ошибка при отклонении отзыва:', error);
    await ctx.answerCbQuery('Ошибка при отклонении отзыва');
  }
});

// Запускаем бота
bot.launch();

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
        status: 'pending' // Отзыв создается со статусом "ожидает модерации"
      });

      const savedReview = await review.save();

      const starsDisplay = "⭐".repeat(stars);
      const message = `
📣 Новый отзыв на модерацию!

👤 Имя: ${name}
⭐ Оценка: ${starsDisplay} (${stars}/5)
💬 Текст: ${text}

Выберите действие:`;

      // Создаем inline клавиатуру с кнопками
      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback('✅ Опубликовать', `approve_${savedReview._id}`),
          Markup.button.callback('❌ Удалить', `reject_${savedReview._id}`)
        ]
      ]);

      await bot.telegram.sendMessage(TELEGRAM_CHAT_ID, message, keyboard);

      return res.status(201).json({
        success: true,
        message: "Отзыв отправлен на модерацию",
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
      // Возвращаем только одобренные отзывы для публичного API
      const reviews = await Review.find({ status: 'approved' }).sort({ createdAt: -1 });
      return res.json(reviews);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Ошибка при получении отзывов",
      });
    }
  }

  // Получение всех отзывов для админки (включая pending и rejected)
  async getAllReviewsAdmin(req, res) {
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

  // Ручное изменение статуса отзыва (для админки)
  async updateReviewStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Неверный статус. Допустимые значения: pending, approved, rejected"
        });
      }

      const review = await Review.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Отзыв не найден"
        });
      }

      return res.json({
        success: true,
        message: "Статус отзыва обновлен",
        review
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Ошибка при обновлении статуса отзыва"
      });
    }
  }

  // Удаление отзыва
  async deleteReview(req, res) {
    try {
      const { id } = req.params;
      
      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Отзыв не найден"
        });
      }

      await Review.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: "Отзыв удален"
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Ошибка при удалении отзыва"
      });
    }
  }
}

export default new ReviewController();

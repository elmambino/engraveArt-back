import Router from "express";
import OrderController from "./controllers/OrderController.js";
import ReviewController from "./controllers/ReviewController.js";

const router = new Router();

// Маршруты для заказов
router.post("/orders", OrderController.createOrder);
router.get("/orders", OrderController.getAllOrders);
router.get("/orders/:id", OrderController.getOrderById);
router.put("/orders/:id/status", OrderController.updateOrderStatus);

// Маршруты для отзывов
router.post("/reviews", ReviewController.createReview);
router.get("/reviews", ReviewController.getAllReviews);

export default router;

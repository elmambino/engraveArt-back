import express from "express";
import mongoose from "mongoose";
import router from "./router.js";
// import cors from "cors";

const PORT = 8182;
const DB_URL = process.env.MONGO_URI || "mongodb://localhost:27017/engraveDB";

const app = express();

app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://engraveart.space",
    "http://engraveart.space:3000",
    "https://engraveart.space",
    "http://api.engraveart.space",
    "https://api.engraveart.space",
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use("/api", router);

app.get("/", (req, res) => {
  res.send("API сервер работает");
});

app.get("/test", (req, res) => {
  res.json({
    status: "success",
    message: "Тестовый маршрут работает",
    time: new Date().toISOString(),
  });
});

async function startApp() {
  try {
    await mongoose.connect(DB_URL);
    console.log("Подключение к MongoDB успешно установлено");
    app.listen(PORT, () => {
      console.log("Сервер завелся на порту", PORT);
    });
  } catch (error) {
    console.log("Ошибка подключения к MongoDB:", error);
  }
}
startApp();

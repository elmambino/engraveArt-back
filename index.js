import express from "express";
// import mongoose from "mongoose";
import router from "./router.js";
// import cors from "cors";

const PORT = 8182;
// const DB_URL = "mongodb://localhost:27017/engraveDB";

const app = express();

// Разрешаем все CORS запросы
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
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

async function startApp() {
  try {
    // await mongoose.connect(DB_URL);
    app.listen(PORT, () => {
      console.log("Сервер завелся на порту", PORT);
    });
  } catch (error) {
    console.log(error);
  }
}
startApp();

import express from "express";
import "dotenv/config";
import mongoose from "mongoose";

import Category from "./models/Category.js";
import Product from "./models/Product.js";

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

const app = express();

// Позволяет Express читать JSON из req.body
app.use(express.json());

// ==============================
// HOME
// Проверка работы сервера
// ==============================
app.get("/", (_req, res) => {
  res.send("Welcome to Homework 14!");
});

// ==============================
// CREATE CATEGORY
// POST /categories
// Создание новой категории
// ==============================
app.post("/categories", async (req, res, next) => {
  try {
    // Получаем name из тела запроса
    const { name } = req.body ?? {};

    // Проверяем, что name — непустая строка
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Category name is required and must be a string",
      });
    }

    // Category.create()
    // Создаёт документ и сохраняет его в MongoDB
    const category = await Category.create({
      name: name.trim(),
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

// ==============================
// CREATE PRODUCT
// POST /products
// Создание нового продукта
// ==============================
app.post("/products", async (req, res, next) => {
  try {
    // Получаем данные продукта
    const { name, price, category } = req.body ?? {};

    // Проверяем name
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Product name is required and must be a string",
      });
    }

    // Проверяем price
    if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        message: "Product price is required and must be a non-negative number",
      });
    }

    // Проверяем наличие category
    if (!category) {
      return res.status(400).json({
        message: "Product category is required",
      });
    }

    // mongoose.isObjectIdOrHexString()
    // Проверяет корректность MongoDB ObjectId
    if (!mongoose.isObjectIdOrHexString(category)) {
      return res.status(400).json({
        message: "Invalid category ID",
      });
    }

    // Проверяем, существует ли такая категория
    const categoryExists = await Category.exists({
      _id: category,
    });

    if (!categoryExists) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Product.create()
    // Создаёт новый продукт
    // category содержит ObjectId связанной Category
    const product = await Product.create({
      name: name.trim(),
      price,
      category,
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

// ==============================
// GET PRODUCTS
// GET /products
// Получение продуктов с Category
// ==============================
app.get("/products", async (_req, res, next) => {
  try {
    // populate("category")
    // Вместо ObjectId подставляет документ Category
    const products = await Product.find().populate("category").exec();

    res.json(products);
  } catch (error) {
    next(error);
  }
});

// ==============================
// ERROR HANDLER
// Общая обработка ошибок
// ==============================
app.use((error, _req, res, _next) => {
  console.error(error.message);

  // Ошибки валидации Mongoose
  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: error.message,
    });
  }

  // Некорректный ObjectId
  if (error.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID",
    });
  }

  res.status(500).json({
    message: "Internal server error",
  });
});

// ==============================
// START SERVER
// ==============================
async function start() {
  try {
    // Подключаемся к MongoDB
    await mongoose.connect(MONGO_URL);

    console.log("MongoDB successfully connected");

    const server = app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

    // Корректное завершение работы приложения
    const shutdown = async (signal) => {
      console.log(`Signal received: ${signal}. Shutting down.`);

      server.close(async () => {
        await mongoose.connection.close();

        console.log("Connection with MongoDB closed");

        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("MongoDB connection error:", error.message);

    process.exit(1);
  }
}

start();

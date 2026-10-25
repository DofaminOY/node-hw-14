import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Product price cannot be negative"],
    },

    // Связь "один ко многим"
    // Одна Category может иметь много Product
    category: {
      // Храним ObjectId документа Category
      type: mongoose.Schema.Types.ObjectId,

      // Указываем, с какой моделью связан ObjectId
      ref: "Category",

      required: [true, "Product category is required"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Product = mongoose.model("Product", productSchema);

export default Product;

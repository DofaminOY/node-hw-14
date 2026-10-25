import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
  },
  {
    // Автоматически создаёт createdAt и updatedAt
    timestamps: true,

    // Не создаёт поле __v
    versionKey: false,
  },
);

const Category = mongoose.model("Category", categorySchema);

export default Category;

import mongoose from "mongoose";

const Schema = mongoose.Schema;

enum BlogCategoryEnum {
  TRAVELERS = "travelers",
  ADVENTURE = "adventure",
  INFORMATION = "information",
  EDUCATION = "education",
  OTHER = "other",
}

export interface IBlogCategory {
  category_name: string;
  category_type: BlogCategoryEnum;
  category_description: string;
  isactive: boolean;
  isdeleted: boolean;
  deleted_at: Date;
}

const blogCategorySchema = new Schema<IBlogCategory>(
  {
    category_name: {
      type: String,
      required: true,
    },
    category_type: {
      type: String,
      enum: BlogCategoryEnum,
    },
    category_description: {
      type: String,
    },
    isactive: {
      type: Boolean,
      default: true,
    },
    isdeleted: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const blogCategory = mongoose.model("blogCategory", blogCategorySchema);

export default blogCategory;

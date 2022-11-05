import { Schema, model, PopulatedDoc } from "mongoose";
import { IUser } from "./user";
import { IBlogCategory } from "./BlogCategoryModel";

export interface IBlog {
  blog_owner?: PopulatedDoc<IUser>;
  blog_category?: PopulatedDoc<IBlogCategory>;
  blog_name: string;
  title: string;
  post_body: string;
  post_summary: string;
  blog_image: string;
  isactive: boolean;
  isdeleted: boolean;
  deleted_at: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    blog_owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    blog_category: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "blogCategory",
    },
    blog_name: {
      type: String,
    },
    title: {
      type: String,
    },
    post_body: {
      type: String,
    },
    post_summary: {
      type: String,
    },
    blog_image: {
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

const Blog = model("Blog", BlogSchema);
export default Blog;

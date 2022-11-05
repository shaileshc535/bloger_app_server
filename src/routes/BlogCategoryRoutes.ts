import express from "express";
import Controller from "../controller/blogCategory/blogCategory.Controller";
import auth from "../middleware/auth.middleware";

const Router = express.Router();

Router.post("/create", auth, Controller.CreateBlogCategory);
Router.put("/delete", auth, Controller.DeleteBlogCategory);
Router.post("/list", auth, Controller.ListBlogCategory);

export default Router;

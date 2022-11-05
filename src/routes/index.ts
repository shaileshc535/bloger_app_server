import express from "express";
import userRoutes from "./userRoute";
import BlogCategoryRoutes from "./BlogCategoryRoutes";
import BlogRoutes from "./BlogRoutes";

const Router = express.Router();

Router.use("/user", userRoutes);
Router.use("/blog-category", BlogCategoryRoutes);
Router.use("/blog", BlogRoutes);

export default Router;

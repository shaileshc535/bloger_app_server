import express from "express";
import Controller from "../controller/blog/blog.Controller";
import auth from "../middleware/auth.middleware";
import multer from "multer";
import { ensureDir } from "fs-extra";
import path from "path";

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    await ensureDir("./public/");
    cb(null, "./public/");
  },

  filename: function (req, file, cb) {
    const datetimestamp = Date.now();
    cb(null, file.fieldname + "-" + datetimestamp + "." + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: function (req, file, callback) {
    const ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      return callback(new Error("Only images are allowed"));
    }
    callback(null, true);
  },
}).single("blog_image");

const Router = express.Router();

Router.post("/create", upload, auth, Controller.CreateBlog);
Router.put("/delete", auth, Controller.DeleteBlog);
Router.get("/get/:id", auth, Controller.GetBlogById);
Router.post("/list", auth, Controller.ListBlogs);

export default Router;

import express from "express";
import Login from "../controller/user/login.controller";
import Register from "../controller/user/register.controller";
import Passwordcontroller from "../controller/user/Password.controller";
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
}).single("profile_photo");

const router = express.Router();

router.post("/register", upload, Register);
router.post("/login", Login);
router.post("/forgotPass", Passwordcontroller.forgotPassword);
router.post("/password-reset/:userId/:token", Passwordcontroller.resetPassword);
router.post("/forgot-reset-password", Passwordcontroller.changeTempPassword);
router.post("/password-change", auth, Passwordcontroller.changePassword);
router.post("/list-users", auth, Passwordcontroller.ListAllUsers);

export default router;

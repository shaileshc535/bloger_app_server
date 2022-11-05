import express from "express";
import cors from "cors";
import methodOverride from "method-override";
import { config } from "dotenv";
import getConnection from "./config/connection";
import Router from "./routes/index";

config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(methodOverride("X-HTTP-Method-Override"));

//DATABASE CONNECTION
app.use(getConnection);
app.use("/public", express.static("./public"));

//ROUTES

app.use("/", Router);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});

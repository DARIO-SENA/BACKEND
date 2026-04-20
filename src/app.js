import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import { verifyToken } from "./middlewares/auth.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});
app.get("/api/test", verifyToken, (req, res) => {
  res.json({
    message: "Ruta protegida funcionando 🔒",
    user: req.user
  });
});
export default app;
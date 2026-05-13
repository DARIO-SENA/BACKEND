import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import bienestarRoutes from "./modules/bienestar/routes.js";
import swaggerSpec from "./swagger.js";
import { healthCheck } from "./modules/bienestar/controller.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

app.get("/api/health", healthCheck);
app.use("/api/bienestar", bienestarRoutes);

export default app;
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Backend API - Módulo Bienestar",
      version: "1.0.0",
      description: "API de bienestar emocional con check-ins, diario personal, insights y micro-pausas",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./src/modules/bienestar/routes.js"],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;

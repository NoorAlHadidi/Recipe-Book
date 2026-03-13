import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Application } from "express";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Recipe Book API",
    version: "1.0.0",
    description: "API documentation for the Recipe Book project",
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
    },
  ],
};

const swaggerOptions: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: [
    "src/auth/**/*.ts",
    "src/admins/**/*.ts",
    "src/categories/**/*.ts",
    "src/routes/**/*.ts",
  ], // where swagger looks for route comments
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export function setupSwagger(app: Application) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

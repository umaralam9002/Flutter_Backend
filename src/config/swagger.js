const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AMS API",
      version: "1.0.0",
      description: "API documentation for Attendance Management system",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  
  apis: ["./src/routes/*.js","./src/swagger/*.js"]
   
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;
import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Book Store API",
      version: "1.0.0",
      description: "API documentation for Book Store project",
    },
    servers: [
      {
        url: "http://localhost:5000",
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
      schemas: {
        Book: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "64123456789abcdef0123456",
            },
            title: {
              type: "string",
              example: "Clean Code",
            },
            author: {
              type: "string",
              example: "Robert C. Martin",
            },
            description: {
              type: "string",
              example: "A Handbook of Agile Software Craftsmanship",
            },
            price: {
              type: "number",
              example: 25,
            },
            ratings: {
              type: "number",
              example: 4.5,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-12-14T18:30:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2025-12-14T18:30:00.000Z",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "64123456789abcdef0123456",
            },
            name: {
              type: "string",
              example: "Ahmed Ali",
            },
            email: {
              type: "string",
              example: "ahmed@email.com",
            },
            role: {
              type: "string",
              example: "user",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-12-14T18:30:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2025-12-14T18:30:00.000Z",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "64123456789abcdef0123456",
            },
            name: {
              type: "string",
              example: "Ahmed Ali",
            },
            email: {
              type: "string",
              example: "ahmed@email.com",
            },
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], // Read the comment from routes file which contain @swagger
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;

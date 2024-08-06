E-commerce Product Listing Application
This application is a simple e-commerce product listing platform with a Vue.js frontend and a Node.js + Express.js backend. The application provides functionalities for product management and user authentication.

Backend Documentation
Overview
The backend of this application is built using Node.js and Express.js and provides RESTful APIs for managing products and users. It uses MongoDB as the database to store product and user data.

Features
User Authentication: Users can sign up and log in to access protected routes.
Product Management: Authenticated users can create, read, update, and delete products.
Middleware: Authentication middleware to protect routes.
Cloudinary Integration: For storing product images.

Technologies
Node.js
Express.js
MongoDB
Mongoose
Cloudinary
JWT (JSON Web Tokens)

Project Structure

backend/
├── controllers/
│   ├── auth.controller.js
│   └── product.controller.js
├── middleware/
│   └── auth.middleware.js
├── models/
│   ├── user.models.js
│   └── product.models.js
├── routes/
│   ├── auth.routes.js
│   └── product.routes.js
├── utils/
│   ├── api_response.js
│   └── cloudinary.js
├── .env
└── server.js


API Endpoints
Authentication Routes
POST /api/auth/signup - Register a new user
POST /api/auth/login - Log in an existing user

Product Routes
POST /api/product/create - Create a new product (Authenticated users only)
GET /api/product/ - Get all products (Paginated)
GET /api/product/all-products - Get all products with pagination
GET /api/product/:id - Get a product by ID
PATCH /api/product/:id - Update a product by ID (Authenticated users only)
DELETE /api/product/:id - Delete a product by ID (Authenticated users only)

Authentication Middleware
The verifyUser middleware checks for a valid JWT token in the request header and ensures that the user is authenticated before accessing protected routes.

Models
User Model
username: String, unique
email: String, unique, required
password: String, required

Product Model
name: String, required
description: String, required
price: Number, required
createdBy: ObjectId, references User
imageURL: String, required
cloudinary_id: String

Environment Variables
JWT_SECRET - Secret key for JWT token
CLOUDINARY_URL - Cloudinary URL for image uploads

How to Run
Install dependencies using "yarn install" and run application using "yarn run dev"

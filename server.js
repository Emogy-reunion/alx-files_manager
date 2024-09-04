#!/usr/bin/node

const express = require('express'); // Import the Express framework for building the server
const router = require('./routes/index'); // Import route definitions from the routes folder

const server = express(); // Initialize an Express application
const PORT = process.env.PORT || 5000; // Set the port from environment variable or default to 5000

server.use(express.json()); // Middleware to parse JSON bodies in incoming requests
server.use(router); // Register the router for handling API routes

server.listen(PORT, () =>
  console.log(`Server is running on port: ${PORT}`) // Log the port number on which the server is running
);

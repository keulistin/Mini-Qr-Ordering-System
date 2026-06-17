const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

module.exports = app;

//ROUTES

//Product routes
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

//Order routes
const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes);
const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");

//POST /api/orders
router.post("/", orderController.createOrder);


//GET /api/orders
router.get("/", orderController.getAllOrders);


//PATCH /api/orders/:id/payment-status
router.patch("/:id/payment-status", orderController.updatePaymentStatus);
module.exports = router;
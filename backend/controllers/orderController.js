/**
 * Order Controller
 * This controller handles all operations related to orders, including:
 * - Retrieving orders
 * - Creating a new order
 */

const orderService = require("../services/orderService");

/**
 * POST ORDER
 */
exports.createOrder = async (req, res) => {
    try {
        const result = await orderService.createOrder(req.body);

        return res.status(201).json({
            message: "Order created successfully",
            data: result
        });

    } catch (error) {
        console.error("Create Order Error:", error);

        return res.status(400).json({
            message: error.message || "Failed to create order"
        });
    }
};



/**
 * GET ALL ORDERS
 */
exports.getAllOrders = async (req, res) => {
    try {
        const result = await orderService.getAllOrders();

        return res.status(200).json({
            message: "Orders retrieved successfully",
            data: result
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to retrieve orders"
        });
    }
};


/**
 * PATCH STATUS
 */
 exports.updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;

        const result = await orderService.updatePaymentStatus(id, payment_status);

        return res.status(200).json({
            message: "Payment status updated successfully",
            data: result
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message || "Failed to update payment status"
        });
    }
};


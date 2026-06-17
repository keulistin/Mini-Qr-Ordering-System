/**
 * Order Controller
 * This controller handles all operations related to orders, including:
 * - Retrieving orders
 * - Creating a new order
 */

const db = require('../config/db');

// Get orders
exports.getOrders = (req, res) => {
    const orderSql = `
        SELECT
            order_id,
            order_amount,
            order_status,
            order_payment_status,
            order_created
        FROM orders
        ORDER BY order_created DESC
    `;

    db.query(orderSql, (err, orders) => {
        if (err) {
            console.error('Error fetching orders:', err);

            return res.status(500).json({
                message: "Failed to fetch orders"
            });
        }

    const itemSql = `
        SELECT
            order_items_id,
            order_id,
            product_id,
            order_product_quantity,
            order_item_price
        FROM order_items
    `;

    db.query(itemSql, (err, items) => {
        if (err) {
            console.error('Error fetching order items:', err);
            return res.status(500).json({
                message: "Failed to fetch order items"
            });
        }


    //Merge orders with their items
    const formattedOrders = orders.map(order => {
        const orderItems = items.filter(item => item.order_id === order.order_id);
        return {
            ...order,
            items: orderItems
        };
    });

    return res.status(200).json({   
        message: "Orders fetched successfully",
        data: formattedOrders
    });
    });
});
};



// Create a new order
exports.createOrder = (req, res) => {
    
    const items = req.body.items; // Array of items in the order

    if(!items || items.length === 0) {
        return res.status(400).json({
            message: "Order must contain at least one item"
        });
    }

    const productIds = items.map(item => item.product_id); // Extract product IDs from the order items

    const sql= `
        SELECT product_id, product_price
        FROM products
        WHERE product_id IN (?)
    `;

    db.query(sql, [productIds], (err, results) => {
        if (err) {
            console.error('Error fetching product prices:', err);
            return res.status(500).json({
                message: "Failed to fetch product prices"
            });
        }

        const priceMap = {}; // Map product_id to product_price
        products.forEach(p => {
            priceMap[p.product_id] = p.product_price;
        });

        let totalAmount = 0; // Calculate total order amount

        items.forEach(item => {
            const price = priceMap[item.product_id];
            totalAmount += price * item.quantity;
        });


        // Insert order
        const orderSql = `
            INSERT INTO orders (order_amount, order_status, order_payment_status)
            VALUES (?, 'pending', 'unpaid')
        `;

        db.query(orderSql, [totalAmount], (err, result) => {
            if (err) {
                console.error('Error creating order:', err);
                return res.status(500).json({
                    message: "Failed to create order"
                });
            }

            const order_id = orderResult.insertId; // Get the generated order ID

            // Prepare order items for batch insert
            const orderItems = items.map(item => [
                order_id,
                item.product_id, 
                item.quantity,
                priceMap[item.product_id]
            ]);

            const itemSql = `
                INSERT INTO order_items (order_id, product_id, quantity, item_price)
                VALUES ?
            `;

            db.query(itemSql, [orderItems], (err) => {
                if (err) {
                    console.error('Error inserting order items:', err);
                    return res.status(500).json({
                        message: "Failed to insert order items"
                    });
                }

                return res.status(201).json({
                    message: "Order created successfully",
                    order_id: order_id,
                    totalAmount: totalAmount
                });
            });
        });
    });
};



/**
 * Update order status
 * This function updates the status of an existing order.
 */
 
// Validate order statuses for consistency and to avoid typos in the codebase.
const ORDER_STATUSES = {
    PENDING: "pending",
    PREPARING: "preparing",
    COMPLETED: "completed",
    CANCELED: "canceled"
};

const PAYMENT_STATUSES = {
    UNPAID: "unpaid",
    PAID: "paid",
    FAILED: "failed"
};


// Update function to handle order status updates
exports.updateOrderStatus = (req, res) => {

    const orderId = req.params.id; // Get order ID from request parameters
    const { order_status } = req.body; // Get new status from request body

    //Validate if status is valid
    const allowedStatuses = Object.values(ORDER_STATUSES);
    if (!allowedStatuses.includes(order_status)) {
        return res.status(400).json({
            message: "Invalid order status"
        });
    }

    const sql = `
        UPDATE orders
        SET order_status = ?
        WHERE order_id = ?
    `; 

    db.query(sql, [order_status, orderId], (err, result) => {
        if (err) {
            console.error('Error updating order status:', err);
            return res.status(500).json({
                message: "Failed to update order status"
            });
        }

        return res.status(200).json({
            message: "Order status updated successfully",
            order_id: orderId,
            new_status: order_status
        });
    });
};    


/**
 * Simulate payment processing for an order
 * This function updates the payment status of an order to "paid". 
 * If payment is successful, it also updates the order status to "preparing".
 * If payment is marked as failed, it updates the payment status to "failed" and order status to "canceled".
 */

//Simulate payment processing for an order



const db = require("../config/db");

/**
 * Create order with transaction
 */
const createOrder = (orderData) => {
    return new Promise((resolve, reject) => {

        db.beginTransaction((err) => {
            if (err) return reject(err);

            const items = orderData.items;

            if (!items || items.length === 0) {
                return db.rollback(() => {
                    reject(new Error("Order items are required"));
                });
            }

            const productIds = items.map(i => i.product_id);

            const sql = `
                SELECT 
                    product_id, 
                    product_price, 
                    product_name
                FROM products
                WHERE product_id IN (?)
            `;

            db.query(sql, [productIds], (err, products) => {

                if (err) {
                    return db.rollback(() => reject(err));
                }

                if (products.length !== productIds.length) {
                    return db.rollback(() => {
                        reject(new Error("One or more products do not exist"));
                    });
                }

                let totalAmount = 0;

                const orderItems = items.map(item => {

                    const product = products.find(
                        p => p.product_id === item.product_id
                    );

                    const price = Number(product.product_price);
                    const quantity = Number(item.quantity);

                    totalAmount += price * quantity;

                    return {
                        product_id: item.product_id,
                        quantity,
                        price
                    };
                });

                const insertOrderSql = `
                    INSERT INTO orders (
                        order_amount, 
                        payment_status)
                    VALUES (?, 'pending', 'unpaid')
                `;

                db.query(insertOrderSql, [totalAmount], (err, orderResult) => {

                    if (err) {
                        return db.rollback(() => reject(err));
                    }

                    const orderId = orderResult.insertId;

                    const orderItemsSql = `
                        INSERT INTO orderitems (
                            order_id, 
                            product_id, 
                            order_product_quantity, 
                            order_item_price)
                        VALUES ?
                    `;

                    const values = orderItems.map(item => [
                        orderId,
                        item.product_id,
                        item.quantity,
                        item.price
                    ]);

                    db.query(orderItemsSql, [values], (err) => {

                        if (err) {
                            return db.rollback(() => reject(err));
                        }

                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => reject(err));
                            }

                            resolve({
                                order_id: orderId,
                                total_amount: totalAmount,
                                items: orderItems
                            });
                        });

                    });

                });

            });

        });

    });
};


/**
 * Get all orders
 */
const getAllOrders = () => {
    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                o.order_id,
                o.order_amount,
                o.payment_status,
                oi.order_items_id,
                oi.product_id,
                oi.order_product_quantity,
                oi.order_item_price
            FROM orders o
            INNER JOIN orderitems oi
                ON o.order_id = oi.order_id
            ORDER BY o.order_id DESC
        `;

        db.query(sql, (err, rows) => {
            if (err) return reject(err);

            // STEP 1: group by order_id
            const grouped = {};

            rows.forEach(row => {

                // create order if not exists
                if (!grouped[row.order_id]) {
                    grouped[row.order_id] = {
                        order_id: row.order_id,
                        order_amount: row.order_amount,
                        payment_status: row.payment_status,
                        items: []
                    };
                }

                // push item into order
                grouped[row.order_id].items.push({
                    order_items_id: row.order_items_id,
                    product_id: row.product_id,
                    quantity: row.order_product_quantity,
                    price: row.order_item_price
                });
            });

            // convert object → array
            resolve(Object.values(grouped));
        });

    });
};


/**
 * Update order
 */
// Validate statuses for consistency and to avoid typos in the codebase.
const payment_status = {
    UNPAID: "unpaid",
    PAID: "paid",
    FAILED: "failed"
};

const updatePaymentStatus = (orderId, paymentStatus) => {
    return new Promise((resolve, reject) => {
        const allowedStatuses = Object.values(payment_status);

        if (!allowedStatuses.includes(paymentStatus)) {
            return reject(new Error("Invallid payment status"));
        }

        const sql = `
            UPDATE orders
            SET payment_status = ?
            WHERE order_id = ?
        `;

        db.query(sql, [paymentStatus, orderId], (err, result) => {
            if (err) return reject(err);

            resolve({
                order_id: orderId,
                payment_status: paymentStatus
            });
        });
    });
};

module.exports = {
    createOrder,
    getAllOrders,
    updatePaymentStatus
};

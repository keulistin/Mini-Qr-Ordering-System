/**
 * Product Controller
 * This controller handles all operations related to products, including:
 * - Retrieving all products
 */

const db= require('../config/db');

// Get all products
exports.getAllProducts = (req, res) => {

    //SQL query to fetch products 
    const sql = `
        SELECT 
            product_id,
            product_name,
            product_description,
            product_price,
            is_available,
            img_url,
            product_created
        FROM products
        ORDER BY product_name DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).json({ 
                message: "Failed to fetch products" 
            });
        }

        return res.status(200).json({
            message: "Products fetched successfully",
            data: results
        });
    });
};

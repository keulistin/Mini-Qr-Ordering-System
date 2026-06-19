const db = require("../config/db");

/**
 * Fetch all products
 * Newest products appear first
 */

const getAllProducts = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                product_id,
                product_name,
                product_description,
                product_price,
                is_available,
                product_created,
                img_url
            FROM products
            ORDER BY product_created DESC
        `;

        db.query(sql, (err, results) => {
            if (err) {
                return reject(err);
            }

            resolve(results);
        });
    });
};

module.exports = {
    getAllProducts
};
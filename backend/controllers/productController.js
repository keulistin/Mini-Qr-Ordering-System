/**
 * Product Controller
 * This controller handles all operations related to products, including:
 * - Retrieving all products
 */

const productService = require("../services/productService");

/**
 * GET /api/products
 */

exports.getProducts = async (req, res) => {

    try {
        const products = await productService.getAllProducts();

        return res.status(200).json({
            message: "Products retrieved successfully",
            data: products
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to retrieve products"
        });
    }
};
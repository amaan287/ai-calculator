import express from 'express'
import { analyzeImage } from '../utils/utlis.js'
import { body, validationResult } from 'express-validator';

const router = express.Router();
const validateImageData = [
    body('image').isString().notEmpty()
        .withMessage('Image data is required and must be a base64 string'),
    body('dict_of_vars').isObject()
        .withMessage('dict_of_vars must be an object'),
];

// Helper function to convert base64 to buffer
function base64ToBuffer(base64Str) {
    // Remove data URL prefix if present
    const base64Data = base64Str.split(',')[1] || base64Str;
    return Buffer.from(base64Data, 'base64');
}

router.post('/', validateImageData, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation error',
                errors: errors.array()
            });
        }

        const { image: base64Image, dict_of_vars = {} } = req.body;

        // Convert base64 to buffer
        const imageBuffer = base64ToBuffer(base64Image);

        // Process the image
        const responses = await analyzeImage(imageBuffer, dict_of_vars);

        // Format the response
        const data = responses.map(response => ({
            ...response
        }));

        console.log('response in route: ', responses);

        return res.json({
            message: "Image processed",
            data: data,
            status: "success"
        });

    } catch (error) {
        console.error('Error processing image:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error processing image',
            error: error.message
        });
    }
});

export default router
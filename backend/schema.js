import { body } from 'express-validator'

// Validation schema for ImageData
const imageDataValidation = [
    body('image')
        .isString()
        .notEmpty()
        .withMessage('Image must be a non-empty string')
        .matches(/^data:image\/[a-zA-Z+]+;base64,/)
        .withMessage('Image must be a valid base64 data URL'),

    body('dict_of_vars')
        .isObject()
        .withMessage('dict_of_vars must be an object')
        .custom((value) => {
            // Additional validation for dict values if needed
            for (const [key, val] of Object.entries(value)) {
                if (typeof val !== 'number' && typeof val !== 'string') {
                    throw new Error(`Value for key '${key}' must be a number or string`);
                }
            }
            return true;
        })
];

// Helper function to validate imageData object structure
const validateImageData = (data) => {
    const errors = [];

    if (!data.image) {
        errors.push('Image is required');
    }

    if (!data.dict_of_vars || typeof data.dict_of_vars !== 'object') {
        errors.push('dict_of_vars must be an object');
    }

    return errors;
};

module.exports = {
    imageDataValidation,
    validateImageData
};
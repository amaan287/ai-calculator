import { GoogleGenerativeAI } from '@google/generative-ai';
import { configDotenv } from 'dotenv';

configDotenv.apply()

// Initialize Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const genai = new GoogleGenerativeAI(GEMINI_API_KEY);

async function analyzeImage(imageBuffer, dictOfVars) {
    try {
        // Initialize the model
        const model = genai.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Convert dictOfVars to string
        const dictOfVarsStr = JSON.stringify(dictOfVars);

        // Construct the prompt
        const prompt = `You have been given an image with some mathematical expressions, equations, or graphical problems, and you need to solve them. 
        Note: Use the PEMDAS rule for solving mathematical expressions. PEMDAS stands for the Priority Order: Parentheses, Exponents, Multiplication and Division (from left to right), Addition and Subtraction (from left to right). Parentheses have the highest priority, followed by Exponents, then Multiplication and Division, and lastly Addition and Subtraction. 
        For example: 
        Q. 2 + 3 * 4 
        (3 * 4) => 12, 2 + 12 = 14. 
        Q. 2 + 3 + 5 * 4 - 8 / 2 
        5 * 4 => 20, 8 / 2 => 4, 2 + 3 => 5, 5 + 20 => 25, 25 - 4 => 21. 
        YOU CAN HAVE FIVE TYPES OF EQUATIONS/EXPRESSIONS IN THIS IMAGE, AND ONLY ONE CASE SHALL APPLY EVERY TIME: 
        Following are the cases: 
        1. Simple mathematical expressions like 2 + 2, 3 * 4, 5 / 6, 7 - 8, etc.: In this case, solve and return the answer in the format of a LIST OF ONE DICT [{"expr": given expression, "result": calculated answer}]. 
        2. Set of Equations like x^2 + 2x + 1 = 0, 3y + 4x = 0, 5x^2 + 6y + 7 = 12, etc.: In this case, solve for the given variable, and the format should be a COMMA SEPARATED LIST OF DICTS, with dict 1 as {"expr": "x", "result": 2, "assign": true} and dict 2 as {"expr": "y", "result": 5, "assign": true}. This example assumes x was calculated as 2, and y as 5. Include as many dicts as there are variables. 
        3. Assigning values to variables like x = 4, y = 5, z = 6, etc.: In this case, assign values to variables and return another key in the dict called {"assign": true}, keeping the variable as "expr" and the value as "result" in the original dictionary. RETURN AS A LIST OF DICTS. 
        4. Analyzing Graphical Math problems, which are word problems represented in drawing form, such as cars colliding, trigonometric problems, problems on the Pythagorean theorem, adding runs from a cricket wagon wheel, etc. These will have a drawing representing some scenario and accompanying information with the image. PAY CLOSE ATTENTION TO DIFFERENT COLORS FOR THESE PROBLEMS. You need to return the answer in the format of a LIST OF ONE DICT [{"expr": given expression, "result": calculated answer}]. 
        5. Detecting Abstract Concepts that a drawing might show, such as love, hate, jealousy, patriotism, or a historic reference to war, invention, discovery, quote, etc. USE THE SAME FORMAT AS OTHERS TO RETURN THE ANSWER, where "expr" will be the explanation of the drawing, and "result" will be the abstract concept. 
        Analyze the equation or expression in this image and return the answer according to the given rules: 
        Make sure to use extra backslashes for escape characters like \\f -> \\\\f, \\n -> \\\\n, etc. 
        Here is a dictionary of user-assigned variables. If the given expression has any of these variables, use its actual value from this dictionary accordingly: ${dictOfVarsStr}. 
        RETURN ONLY THE JSON ARRAY WITH NO ADDITIONAL TEXT, MARKDOWN, OR FORMATTING.`;

        // Create image part from buffer
        const imagePart = {
            inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType: 'image/jpeg'
            }
        };

        // Generate content
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();


        const cleanedText = text
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();                    // Remove any extra whitespace

        console.log('Cleaned response:', cleanedText);

        // Parse the cleaned response
        let answers = [];
        try {
            answers = JSON.parse(cleanedText);
        } catch (error) {
            console.error(`Error parsing cleaned response: ${error}`);
            console.error('Attempted to parse:', cleanedText);

            // Fallback: Try to extract JSON array using regex
            const jsonMatch = cleanedText.match(/\[.*\]/s);
            if (jsonMatch) {
                try {
                    answers = JSON.parse(jsonMatch[0]);
                } catch (error) {
                    console.error('Fallback parsing failed:', error);
                }
            }
        }

        // Validate the answers structure
        if (!Array.isArray(answers)) {
            console.error('Invalid response format - expected array');
            return [];
        }

        // Process and validate each answer
        return answers.map(answer => {
            if (!answer || typeof answer !== 'object') {
                console.error('Invalid answer format:', answer);
                return null;
            }
            return {
                expr: answer.expr || '',
                result: answer.result,
                assign: answer.assign || false
            };
        }).filter(Boolean); // Remove any null entries

    } catch (error) {
        console.error('Error in analyzeImage:', error);
        throw error;
    }
}

// Express route handler
const analyzeImageHandler = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const dictOfVars = req.body.variables || {};
        const results = await analyzeImage(req.file.buffer, dictOfVars);

        if (!results.length) {
            return res.status(422).json({
                error: 'Unable to process image response',
                message: 'The image analysis did not return any valid results'
            });
        }

        res.json(results);

    } catch (error) {
        console.error('Error handling image analysis:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

export { analyzeImage, analyzeImageHandler };
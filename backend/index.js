// Import required dependencies
import express from 'express'
import cors from 'cors'
import calculatorRouter from './routes/calculator.routes.js'
import { configDotenv } from 'dotenv';

configDotenv.apply()
const app = express();
app.use(cors({
    origin: '*',
    credentials: true,
    methods: '*',
    allowedHeaders: '*'
}));

// Parse JSON bodies
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
    res.json({ message: "Server is running" });
});

// Register calculator routes
app.use('/api/v1/calculate', calculatorRouter);
const PORT = process.env.PORT
const SERVER_URL = process.env.SERVER_URL
const ENV = process.env.ENV
// Start the server
{
    try {
        app.listen(PORT, SERVER_URL, () => {
            console.log(`Server running on http://${SERVER_URL}:${PORT}`);
            if (ENV === 'dev') {
                console.log('Running in development mode');
            }
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};




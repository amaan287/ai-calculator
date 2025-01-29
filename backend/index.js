// Import required dependencies
import express from 'express'
import cors from 'cors'
import calculatorRouter from './routes/calculator.routes.js'
import { configDotenv } from 'dotenv';
import path from 'path';

configDotenv.apply()
const app = express();
const __dirname = path.resolve();

app.use(cors({
    origin: '*',
    credentials: true,
    methods: '*',
    allowedHeaders: '*'
}));

// Parse JSON bodies
app.use(express.json());


// Register calculator routes
app.use('/api/v1/calculate', calculatorRouter);

app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});
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




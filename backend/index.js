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

app.use(express.json());


app.use('/api/v1/calculate', calculatorRouter);

app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});
const PORT = process.env.PORT
const ENV = process.env.ENV
{
    try {
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            if (ENV === 'dev') {
                console.log('Running in development mode');
            }
            if (ENV === 'production') {
                console.log('Running in production mode');
            }
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};




import express from 'express'
import { configDotenv } from 'dotenv'
import cors from cors
configDotenv.apply()
const app = express()
app.use(express.json())
app.use(cors)
const port = process.env.PORT

app.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`)
})

import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./lib/connectDb.js";
import { Error } from "./middlewares/Error.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import morgan from "morgan";
import cors from 'cors'

dotenv.config({
    path: './.env'
});
const app = express();
connectDb()

const options = {
    origin:['http://localhost:5173',process.env.CLIENT_URL],
    credentials:true
}

//middlewares 
app.use(express.json()); 
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('tiny'))
app.use(cors(options))

//user routes
app.use('/api/v1/user' , userRoutes);

//chat routes
app.use('/api/v1/chat' , chatRouter);

app.get('/', (req, res) => {
    res.send('Home page');
})

app.use('*', (req, res) => {
    res.status(404).send('Page not found');
});

app.use(Error);


app.listen(3000, () => {
    console.log('app listning on port 3000');
});
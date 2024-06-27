import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./lib/connectDb.js";
import { Error } from "./middlewares/Error.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";

dotenv.config({
    path: './.env'
});
const app = express();
connectDb()

//middlewares 

app.use(express.json()); 
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

//user routes
app.use('/user' , userRoutes);
app.use('/chat' , chatRouter);

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
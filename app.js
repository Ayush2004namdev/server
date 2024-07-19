import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./lib/connectDb.js";
import { Error } from "./middlewares/Error.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import morgan from "morgan";
import cors from 'cors'
import {v2 as cloudinary} from 'cloudinary'
import {Server} from 'socket.io'
import {createServer} from 'http'
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from "./lib/Constant.js";
import {v4 as uuid} from 'uuid'
import { getSockets } from "./lib/features.js";

dotenv.config({
    path: './.env'
});
const app = express();
const server = createServer(app)
const io = new Server(server,{});
connectDb()
const userSocketIds = new Map();

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET 
});

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


io.on('connection', (socket) => {
    console.log('user connected',socket.id);
    const user = {
        _id:'hfakjdf',
        name:'abra ka dabra'
    }
    userSocketIds.set(user._id,socket.id);
    socket.on(NEW_MESSAGE , ({chatId , message , members}) => {
        const messageForRealTime = {
            content:message,
            _id:uuid(),
            sender:{
                _id:user._id,
                name:user.name
            },
            chat:chatId,
            createdAt:new Date().toISOString()
        }
        
        const messageForDB = {
            content:message,
            sender:user._id,
            chat:chatId
        }
        const userSockets = getSockets(members);
        io.to(userSockets).emit(NEW_MESSAGE , {message:messageForRealTime , chatId});
        io.to(userSockets).emit(NEW_MESSAGE_ALERT, {chatId});
        
        console.log('userSockets',userSockets);

        console.log('message',messageForRealTime);
    })

    socket.on('disconnect', () => {
        userSocketIds.delete(user._id.toString());
        console.log('user disconnected');
    });
});

app.use(Error);


server.listen(3000, () => {
    console.log('app listning on port 3000');
});


export {userSocketIds};
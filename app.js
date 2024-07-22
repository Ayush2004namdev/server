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
import { socketAuthentication } from "./middlewares/IsAuthenticated.js";
import { Message } from "./models/messages.js";

dotenv.config({
    path: './.env'
});
const options = {
    origin:['http://localhost:5173',process.env.CLIENT_URL],
    credentials:true
}
const app = express();
const server = createServer(app)
const io = new Server(server,{cors:options});
app.set('io' , io);

connectDb()
const userSocketIds = new Map();

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET 
});


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

io.use((socket,next) => {
    
    cookieParser()(socket.request,socket.request.res,async(err) => {
        await socketAuthentication(err,socket,next);
    });
});

io.on('connection', (socket) => {
    const user = socket.user;
    userSocketIds.set(user._id.toString(),socket.id.toString());
    socket.on(NEW_MESSAGE ,async ({chatId , message , members=[]}) => {
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
        
        await Message.create(messageForDB); 
        
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
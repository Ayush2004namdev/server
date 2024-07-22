import { User } from "../models/user.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import jwt from 'jsonwebtoken';

const isAuthenticated = (req,res,next) => {
    const token = req.cookies['chat-app'];
    console.log(token);
    if(!token) return next(new ErrorHandler('please login first' , 401));
    const user = jwt.verify(token , process.env.JWT_SECRET);
    req.user = user['id'];
    next();
}

const socketAuthentication = async (err,socket,next) => {
    try {
        if(err) return next(err);
        const authToken = socket.request.cookies['chat-app'];
        if(!authToken) return next(new ErrorHandler('please login first' , 401));
        const decoded = jwt.verify(authToken , process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if(!user) return next(new ErrorHandler('please login first' , 401));         
        socket.user = user;
        next();
    } catch (error) {
        console.log(error);
        return next(new ErrorHandler('please login first' , 401));
    }
   
}

export {isAuthenticated , socketAuthentication};
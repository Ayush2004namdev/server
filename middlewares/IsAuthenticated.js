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

export {isAuthenticated};
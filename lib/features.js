import jwt from 'jsonwebtoken';
import { userSocketIds } from '../app.js';

const cookieOptions = {
    httpOnly: true,
    maxAge:  7 * 24 * 60 * 60 * 1000,
    sameSite: process.env.COOKIE_SETTINGS,
    secure:true,
}
//send cookie
const sendCookie = async(user , res ,status=201 , secret) => {
    const token = jwt.sign({id:user._id} , secret);
    res.status(status).cookie('chat-app' , token , cookieOptions).json({user});
}

const emmit = (req,event,user,data) => {
    const io = req.app.get('io');
    
    console.log(io)
    const userSocket = getSockets(user)
    io.to(userSocket).emit(event,data); 
}

const getOtherUser = (user , id) => {
    return user.filter(i => i._id.toString() !== id.toString())
}

const deleteFromClodinary = () => {};


const getSockets = (users=[]) => {
    const socket = users.map((user) => userSocketIds.get(user.toString()));
    return socket;
}

export {sendCookie, cookieOptions , emmit,getOtherUser,deleteFromClodinary , getSockets};
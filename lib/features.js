import jwt from 'jsonwebtoken';
import { userSocketIds } from '../app.js';

const cookieOptions = {
    httpOnly: true,
    maxAge:  7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    secure:false,
}
//send cookie
const sendCookie = async(user , res ,status=201 , secret) => {
    const token = jwt.sign({id:user._id} , secret);
    res.status(status).cookie('chat-app' , token , cookieOptions).json({user});
}

const emmit = (req,event,emmit,data) => {
    console.log({event});
}

const getOtherUser = (user , id) => {
    return user.filter(i => i.id.toString() !== id.toString())
}

const deleteFromClodinary = () => {};


const getSockets = (users=[]) => {
    return users.map((user) => userSocketIds.get(user._id.toString()));
}

export {sendCookie, cookieOptions , emmit,getOtherUser,deleteFromClodinary , getSockets};
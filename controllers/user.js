import { NEW_REQUEST, REFETCH_CHATS } from "../lib/Constant.js";
import { cookieOptions, emmit, sendCookie } from "../lib/features.js";
import { Chat } from "../models/chat.js";
import { Request } from "../models/request.js";
import { User } from "../models/user.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

const createUser = TryCatch(async (req, res) => {
    const {name , username , password,bio} = req.body;
    console.log(req.body);
    // save to cloudinary
    const avatar = {
        public_id : 'ausijd',
        url : 'kdjf'
    }
    const user = await User.create({
        name,
        username,
        password,
        bio,
        avatar
    });
    const secret = process.env.JWT_SECRET;
    sendCookie(user , res, 201 , secret)
})


const loginUser = TryCatch(async(req,res,next) => {
    const {username , password} = req.body;
    console.log(username,password)
    const user = await User.findOne({username}).select('+password');
    if(!user) return next(new ErrorHandler('Invalid Credentials' , 401));
    let isMatch = await user.comparePassword(password);
    if(!isMatch) return next(new ErrorHandler('Invalid Credentials' , 401));
    const secret = process.env.JWT_SECRET;
    sendCookie(user , res, 201 , secret);
})

const logoutUser = TryCatch((req,res) => {

    res.status(200).cookie('chat-app','',{...cookieOptions , maxAge:1}).json({
        success : true,
        message : 'logged out'
    });
})

const myData = TryCatch(async(req,res,next) => {
    const userId = req.user;
    const user = await User.findById(userId);
    if(!user) return next(new ErrorHandler('User Not found' ,404 ))
    res.status(200).json({
        success : true,
        user
    });
});


const searchUser = TryCatch(async (req,res,next) => {
    const {name=''} = req.query;
    const myChats = await Chat.find({members:req.user , groupChat:false});
    const allUsersInMyChats = myChats.flatMap(chat => chat.members);
    const allUsersExceptMyFriens = await Chat.find({
        _id:{$nin:allUsersInMyChats},
        name:{$regex:name , $options:'i'}
    })

    const transformedData = allUsersExceptMyFriens.map(({_id,name,avatar}) => ({
        _id,name,avatar:avatar.url
    }))

    res.status(200).json({
        success:true,
        transformedData
    })

})


const sendFriendRequest = TryCatch(async(req,res,next) => {
    const {userId} = req.body;
    const request = await Request.findOne({
        $or:[
            {sender:req.user , reciver:userId},
            {sender:userId , reciver:req.user}
        ]
    })
    if(request) return next(new ErrorHandler('Request Allready sent' , 202));
    await Request.create({
        sender:req.user,
        reciver:userId
    })
    emmit(req,NEW_REQUEST,[userId]);
    res.status(200).json({
        success:true,
        message:'request sent successfully'
    })

})

const acceptFriendRequest = TryCatch(async(req,res,next) => {
    const { reqId , accept } = req.body;
    const request = await Request.findById(reqId).populate('sender' , 'name').populate('reciver', 'name')
    if(!request) return next(new ErrorHandler('please provide a valid ID' , 400));
    if(request.reciver._id.toString() !== req.user.toString()) return next(new ErrorHandler('you are not Authorized to perform this action', 402))
    if(!accept){    
        await request.deleteOne()
        res.status(200).json({
            success:true,
            message:"Request Rejected Successfully"
        })
    }else{
        const members = [request.sender._id , request.reciver._id];
        await Chat.create({members,name:`${request.sender.name}-${request.reciver.name}`});
        await request.deleteOne();
        emmit(req,REFETCH_CHATS,members)
        res.status(200).json({
            success:true,
            message:"Request accepted Successfully",
            sender:request.sender.name
        })
    }
})

const getNotifications = TryCatch(async(req,res,next) => {
    const request = await Request.find({reciver:req.user})
    .populate('sender' , 'name avatar')
    const allRequest =  request.map(({_id,sender}) => ({
        _id,sender:{
            name:sender.name,
            _id:sender._id,
            avatar:sender.avatar.url
        }
    }))

    res.status(200).json({
        success:true,
        request:allRequest
    })
})


export { createUser, loginUser, logoutUser, myData, searchUser, sendFriendRequest , acceptFriendRequest,getNotifications};


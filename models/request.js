import mongoose , { Schema, Types, model } from "mongoose";

const requestSchema = new Schema({
    status:{
        type:String,
        default:'pending',
        emun:['pending' , 'accepted' , 'rejected']
    },
    sender:{
        type:Types.ObjectId,
        ref:'User',
        required:true
    },
    reciver:{
        type:Types.ObjectId,
        ref:'User',
        required:true
    }
},
{
    timestamps:true
})

export const Request = mongoose.models.Request || model('Request' , requestSchema);
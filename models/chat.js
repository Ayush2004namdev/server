import mongoose, { Schema, Types, model } from "mongoose";


const chatSchema = new Schema({
    members: [{
        type: Types.ObjectId,
        ref:'User'
    }],
    creator: {
        type: String,
    },
    groupChat: {
        type: Boolean,
        default: false
    },
    name: {
        type: String
    }
}, { timestamps: true });

export const Chat = mongoose.models.Chat || model('Chat', chatSchema);
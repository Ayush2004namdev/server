import mongoose, { Schema, Types, model } from "mongoose";

const messageSchema = new Schema(
  {
    content: {
      type: String,
    },
    attachments: [
      {
        url: {
             type: String, 
             required: true 
            },
        public_id: { 
            type: String, 
            required: true 
        },
      },
    ],
    chat: {
      type: Types.ObjectId,
      ref: "Chat",
    },
    sender: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Message =
  mongoose.models.Message || model("Message", messageSchema);

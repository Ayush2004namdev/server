import express from 'express';
import { addToGroups, createGroup, deleteChat, getAllChats, getChatDetails, getChatMessages, getMyGroups, leaveGroup, removeFromGroup, renameGroup, sendAttachment } from '../controllers/chat.js';
import { isAuthenticated } from '../middlewares/IsAuthenticated.js';
import { addAttachments } from '../middlewares/multer.js';
import { AddtoGroupValidation, CreateGroupValidator, RemoveFromGroupValidation, renameValidation, validationHandler } from '../middlewares/Validator.js';

const app = express.Router();

// middleware to check if user is logged in or not
app.use(isAuthenticated);

//create a group
app.post('/create' , CreateGroupValidator() , validationHandler,createGroup);

//get details of chats that i am a member in
app.get('/me' , getAllChats);

//get details of my groups
app.get('/my/groups' , getMyGroups);

//add members to the group
app.post('/add/group' ,AddtoGroupValidation() , validationHandler,  addToGroups);

//remove from the group
app.put('/remove'  , RemoveFromGroupValidation() , validationHandler , removeFromGroup);

//leave group
app.delete('/leave/:id', leaveGroup);

//send attachments to the chat
app.post('/attachment',addAttachments,sendAttachment);  

//get all the messages in the chat
app.get('/message/:id' ,  getChatMessages);

//get chat details , rename groups , delete chats
app.route('/:id').get( getChatDetails).put(renameValidation(),validationHandler, renameGroup).delete(deleteChat);



export default app;
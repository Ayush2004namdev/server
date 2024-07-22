import {
  ALERT,
  NEW_ATTACHMENTS,
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  REFETCH_CHATS,
} from "../lib/Constant.js";
import { deleteFromClodinary, emmit, getOtherUser } from "../lib/features.js";
import { Chat } from "../models/chat.js";
import { TryCatch } from "../utils/TryCatch.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import { User } from "../models/user.js";
import { Message } from "../models/messages.js";
import uploadToClodinary from "../lib/clodinary.js";

const createGroup = TryCatch(async (req, res, next) => {
  const { name, members } = req.body;
  if (!members || members.length < 3)
    return next(
      new ErrorHandler("A Group must contain atleast 3 members", 400)
    );
  const newChat = await Chat.create({
    name,
    members: [req.user, ...members],
    creator: req.user,
    groupChat: true,
  });

  const allMembers = [req.user, ...members];
  emmit(res, ALERT, allMembers, `welcome to ${name} Group`);
  emmit(res, REFETCH_CHATS, members);
  res.status(200).json({
    success: true,
    message: newChat,
  });
});


const getAllChats = TryCatch(async (req, res, next) => {
  const user = req.user;
  const chats = await Chat.find({ members: user }).populate(
    "members",
    "avatar name username"
  );
  console.log(chats);

  const transformedChats = chats.map((chat) => {
    const otherMember = getOtherUser(chat.members, req.user);
    console.log({ otherMember });
    return {
      _id: chat.id,
      groupChat: chat.groupChat,
      name: chat.groupChat ? chat.name : otherMember[0].name,
      avatar: chat.groupChat
        ? chat.members.slice(0, 3).map((e) => e.avatar.url)
        : [otherMember[0].avatar.url],
      members: chat.members
        .filter((item) => item._id != req.user)
        .map((i) => i._id),
    };
  });

  res.status(200).json({
    success: true,
    message: transformedChats,
  });
});


const getMyGroups = TryCatch(async (req, res, next) => {
  const userChats = await Chat.find({
    members: req.user,
    creator: req.user,
    groupChat: true,
  }).populate("members");
  if (!userChats) return next(new ErrorHandler("No Chat found", 200));
  const transformedChats = userChats.map(
    ({ _id, members, groupChat, name, creator }) => {
      return {
        _id,
        groupChat,
        name,
        creator,
        avatar: members.slice(0, 3).map((me) => me.avatar.url),
        members: members.map((me) => me._id),
      };
    }
  );
  res.status(200).json({
    success: true,
    message: transformedChats,
  });
});


const addToGroups = TryCatch(async (req, res, next) => {
  const { groupId, members } = req.body;
  if (!members || members?.length < 1)
    return next(new ErrorHandler("no users were given", 400));
  const groups = await Chat.findOne({ _id: groupId });
  if (!groups) return next(new ErrorHandler("no such groups", 400));
  if (groups.creator.toString() !== req.user.toString())
    return next(
      new ErrorHandler("You are not allowed to perform this task", 401)
    );
  const allNewMembersPromise = members.map((m) => User.findById(m, "name"));
  const allNewMembers = await Promise.all(allNewMembersPromise);
  const uniqueUsers = allNewMembers.filter(
    (i) => !groups.members.includes(i._id.toString())
  );
  console.log(uniqueUsers);
  groups.members.push(...uniqueUsers);
  await groups.save();
  res.status(200).json({
    success: true,
    message: groups,
  });
});


const removeFromGroup = TryCatch(async (req, res, next) => {
  const { groupId, userId } = req.body;
  const [group, user] = await Promise.all([
    Chat.findById(groupId),
    User.findById(userId, "name"),
  ]);
  if (group.creator.toString() !== req.user.toString())
    return next(
      new ErrorHandler("you are not allowed to perform this task", 401)
    );
  if (!user)
    return next(new ErrorHandler("no such user exist in this Group", 302));
  if (group.members.length <= 3)
    return next(new ErrorHandler("A group must have atleast 3 members", 302));
  group.members = group.members.filter(
    (member) => member.toString() !== user._id.toString()
  );
  await group.save();

  emmit(
    req,
    ALERT,
    group.members,
    `${user.name} has been removed from the group`
  );
  emmit(req.REFETCH_CHATS, group.members);

  res.status(200).json({
    success: true,
    message: "member removed successfully",
  });
});


const leaveGroup = TryCatch(async (req, res, next) => {
  const GroupId = req.params.id;
  const group = await Chat.findById(GroupId);
  if (!group) return next(new ErrorHandler("No Such Group Exist", 400));
  const remainingMembers = group.members.filter(
    (id) => id.toString() !== req.user.toString()
  );
  if (group.creator.toString() === req.user) {
    const element = Math.floor(Math.random() * remainingMembers.length);
    group.creator = remainingMembers[element];
  }
  group.members = remainingMembers;
  await group.save();
  res.status(200).json({
    success: true,
    message: "member left successfully",
  });
});


const sendAttachment = TryCatch(async (req, res, next) => {
  const { chatId } = req.body;
  const [chat, me] = await Promise.all([
    Chat.findById(chatId),
    User.findById(req.user),
  ]);
  if (!chat) return next(new ErrorHandler("no such chat found", 404));
  const files = req.files || [];
  if (files.length < 1)
    return next(new ErrorHandler("please provide Attachments", 400));

  //add to cloudinary
  const attachments = await uploadToClodinary(files) // save data in this array

  const messageForRealTime = {
    content: "",
    attachments,
    sender: {
      _id: me._id,
      name: me.name,
    },
    chat: chatId,
  };
  const messageForDB = {
    content: "",
    attachments,
    sender: me._id,
    chat: chatId,
  };

  const message = await Message.create(messageForDB);

  emmit(req, NEW_MESSAGE, chat.members, {
    message: messageForRealTime,
    chatId,
  });

  emmit(req, NEW_MESSAGE_ALERT, chat.members, { chatId });

  res.status(200).json({
    success: true,
    message,
  });
});


const getChatDetails = TryCatch(async(req, res, next) => {
  const chatId = req.params.id;
  if (req.query.populate === "true") {
    const chats =await Chat.findById(chatId)
      .populate("members", "name avatar")
      .lean();
    if (!chats) return next(new ErrorHandler(" chat not found ", 404));
    chats.members = chats.members.map(({_id,name,avatar}) => ({_id,name,avatar:avatar.url}));
    res.status(200).json({
        success:true,
        chats
    })
  } else {
    const chats = await Chat.findById(chatId);
    if (!chats) return next(new ErrorHandler(" chat not found ", 404));
    res.status(200).json({
        success:true,
        chats
    })
  }
});


const renameGroup = TryCatch(async(req, res, next) =>{
    const chatId = req.params.id;
    const {name} = req.body;
    const [chat,me] = await Promise.all([Chat.findById(chatId) , User.findById(req.user)])
    if(!chat) return next(new ErrorHandler('no chat found' , 404));
    if(!chat.groupChat  || chat.creator.toString() !== req.user.toString()) return next(new ErrorHandler("you Can't rename the Chat" , 400));
    if(chat.name == name) return next(new ErrorHandler('cannot set the same name' , 400));
    chat.name = name;
    await chat.save();

    emmit(req,REFETCH_CHATS,chat.members,`${me.name} changed the name to ${name}`);

    res.status(200).json({
        success:true,
        message:'chat renamed successfully'
    })
})

const deleteChat = TryCatch(async (req,res,next) => {
    const chatId = req.params.id;

    const chat = await Chat.findById(chatId);
    if(!chat) return next(new ErrorHandler('no chat found' , 404));
    if(!chat.groupChat || chat.creator.toString() !== req.user.toString()) return next(new ErrorHandler('you cannot delete this group'));
    const members = chat.members
    //delete all messages as well as attachments from the couldinary
    const messageWithAttachments = await Message.find({
        chat:chatId,
        attachments:{$exists : true , $ne:[]}
    })

    const publicIds = [];
    messageWithAttachments.map(({attachments}) => {
        attachments.map(({public_id}) => publicIds.push(public_id));
    })

    await Promise.all([
        deleteFromClodinary(publicIds),
        chat.deleteOne(),
        Message.deleteMany({chat:chatId})
    ])

    emmit(req,REFETCH_CHATS,members);
    res.status(200).json({
        success:true,
        message:'group deleted successfully'
    })
})

const getChatMessages = TryCatch(async(req,res,next) => {

  const chatId = req.params.id;
  const limit = 20;
  const {page = 1 } = req.query;
  const chat = await Message.find({chat:chatId})
    .populate('sender','name')
    .sort({createdAt:-1})
    .lean()
    .limit(20)
    .skip((page-1) * limit)
    const allChats = await Message.countDocuments({chat:chatId});
    const length = allChats.length;
    const pages = Math.ceil(length/limit);

    res.status(200).json({
      success:true,
      message:chat.reverse(),
      pages
    })
})  

export {
  getAllChats,
  createGroup,
  getMyGroups,
  addToGroups,
  removeFromGroup,
  leaveGroup,
  sendAttachment,
  getChatDetails,
  renameGroup,
  deleteChat,
  getChatMessages
};

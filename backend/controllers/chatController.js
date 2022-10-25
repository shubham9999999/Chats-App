const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = expressAsyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    console.log("userId parameter not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: "false",
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  console.log(isChat);

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createChat = await Chat.create(chatData);

      const fullChat = await Chat.findOne({ _id: createChat._id }).populate(
        "users",
        "-password"
      );

      res.status(200).send(fullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const fetchChats = expressAsyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroup = expressAsyncHandler(async (req, res) => {
  if (!req.body.name || !req.body.users) {
    return res.status(400).send("Please fill all the required fields");
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res.status(400).send("Minimum 2 users are required to form a group");
  }

  users.push(req.user);

  try {
    const createChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: createChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).send(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const renameGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  if (chatName.length === 0) {
    return res.status(400).send("Please Enter Non empty Chat Name");
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName: chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(400);
    throw new Error("Chat does not exist");
  } else {
    res.json(updatedChat);
  }
});

const addToGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  console.log(chatId, userId);
  const addUserToGrp = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  console.log(addUserToGrp);
  if (!addUserToGrp) {
    res.status(400);
    throw new Error("Chat not found");
  } else {
    res.json(addUserToGrp);
  }
});

const removeFromGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const removeUserFromGrp = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removeUserFromGrp) {
    res.status(400);
    throw new Error("Chat not found");
  } else {
    res.json(removeUserFromGrp);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroup,
  renameGroup,
  addToGroup,
  removeFromGroup,
};

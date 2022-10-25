const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

const sendMessages = expressAsyncHandler(async (req, res) => {
  const { content, chatId } = req.body;
  console.log(content, chatId);

  if (!content || !chatId) {
    console.log("invalid data passed in the request");
    return res.status(400);
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");

    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic",
    });
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const getAllMessages = expressAsyncHandler(async (req, res) => {
  const chatId = req.params.chatId;

  if (!chatId) {
    console.log("chat id not provided in request");
    return res.status(400);
  }

  try {
    const messages = await Message.find({
      chat: chatId,
    })
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { sendMessages, getAllMessages };

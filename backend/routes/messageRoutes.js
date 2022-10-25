const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  sendMessages,
  getAllMessages,
} = require("../controllers/messageController");

const router = express.Router();

router.route("/:chatId").get(protect, getAllMessages);
router.route("/").post(protect, sendMessages);

module.exports = router;

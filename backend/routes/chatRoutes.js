const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroup,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroup);
router.route("/renameGroup").put(protect, renameGroup);
router.route("/removeFromGroup").put(protect, removeFromGroup);
router.route("/addToGroup").put(protect, addToGroup);

module.exports = router;

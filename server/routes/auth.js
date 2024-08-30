const express = require("express");
const {
  login,
  register,
  getAllUsers,
  setAvatar,
  logOut,
  checkBlockStatus,
  blockUser,
  unblockUser,
} = require("../controllers/userController");

const router = express.Router();

// Login route
router.post("/login", login);

// Registration route
router.post("/register", register);

// Get all users excluding the logged-in user
router.get("/allusers/:id", getAllUsers);

// Set avatar for a user
router.post("/setavatar/:id", setAvatar);

// Log out a user
router.get("/logout/:id", logOut);

// Check block status between users
router.post("/check-block-status", checkBlockStatus);

// Block a user
router.post("/blockUser", blockUser);

// Unblock a user
router.post("/unblockUser", unblockUser);

// Default error handler for invalid routes
router.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = router;

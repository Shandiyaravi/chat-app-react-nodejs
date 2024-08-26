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

const router = require("express").Router();

router.post("/login", login);
router.post("/register", register);
router.get("/allusers/:id", getAllUsers);
router.post("/setavatar/:id", setAvatar);
router.get("/logout/:id", logOut);
router.post("/check-block-status", checkBlockStatus)
router.post("/blockUser", blockUser); // Ensure the endpoint is correctly defined
router.post("/unblockUser", unblockUser);

module.exports = router;
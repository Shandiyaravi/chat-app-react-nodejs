const User = require("../models/userModel")
const bcrypt = require("bcrypt");

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt:", { username, password });

    // Fetch user from database
    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found");
      return res.json({ msg: "Incorrect Username or Password", status: false });
    }

    console.log("Fetched user:", user);

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password hash from db:", user.password);
    console.log("Password comparison result:", isPasswordValid);

    if (!isPasswordValid) {
      return res.json({ msg: "Incorrect Username or Password", status: false });
    }

    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    console.error("Error during login:", ex);
    next(ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.logOut = (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};

// Block User
module.exports.blockUser = async (req, res, next) => {
  try {
    const { blockerId, blockedId } = req.body;

    const user = await User.findByIdAndUpdate(
      blockerId,
      { $addToSet: { blockedUsers: blockedId } }, // $addToSet ensures no duplicates
      { new: true }
    );

    return res.json({ status: true, blockedUsers: user.blockedUsers });
  } catch (ex) {
    next(ex);
  }
};

// Unblock User
module.exports.unblockUser = async (req, res, next) => {
  try {
    const { blockerId, blockedId } = req.body;

    const user = await User.findByIdAndUpdate(
      blockerId,
      { $pull: { blockedUsers: blockedId } }, // $pull removes the blockedId from the array
      { new: true }
    );

    return res.json({ status: true, blockedUsers: user.blockedUsers });
  } catch (ex) {
    next(ex);
  }
};


module.exports.checkBlockStatus = async (req, res) => {
  try {
    const { blockerId, blockedId } = req.body;

    // Ensure both IDs are provided
    if (!blockerId || !blockedId) {
      return res
        .status(400)
        .json({ msg: "Both blockerId and blockedId are required" });
    }

    const user = await User.findById(blockerId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const isBlocked = user.blockedUsers.includes(blockedId);
    return res.json({ isBlocked });
  } catch (error) {
    console.error("Error checking block status:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
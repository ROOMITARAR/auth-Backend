const express = require("express");
const router = express.Router();
const {
  userRegistration,
  userLogin,
  changePassword,
  loggedUser,
  resetPasswordLink,
  resetPassword,
} = require("../controllers/userController");
const checkUserAuth = require("../middlewares/authMiddleware");

// Public Routes

router.post("/register", userRegistration);
router.post("/login", userLogin);
router.post("/reset-password-link", resetPasswordLink);
router.post("/reset-password/:id/:token", resetPassword);

// Route level Middleware
router.use("/changepassword", checkUserAuth);
router.use("/loggeduser", checkUserAuth);

// Protected Routes // These routes are used where user is logged in

router.post("/changepassword", changePassword);
router.get("/loggeduser", loggedUser);

module.exports = router;

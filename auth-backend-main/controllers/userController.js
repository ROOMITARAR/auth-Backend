const cors = require("cors");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/emailConfig");

const userRegistration = async (req, res) => {
  const { name, email, password, confirm_password, tc } = req.body;
  try {
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      res
        .status(500)
        .send({ Status: "Failed", Message: "Email already exists" });
    } else {
      if (name && email && password && confirm_password && tc) {
        if (password === confirm_password) {
          try {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const createUser = new User({
              name: name,
              email: email,
              password: hashPassword,
              tc: tc,
            });
            await createUser.save();
            const savedUser = await User.findOne({ email: email });
            const token = jwt.sign(
              { userID: savedUser._id },
              process.env.SECRET_KEY,
              { expiresIn: "1h" }
            );
            res.status(200).send({
              Status: "Success",
              Message: "User created Successfully",
              token: token,
            });
          } catch (error) {
            res
              .status(500)
              .send({ Status: "Failed", Message: "Error creating user" });
          }
        } else {
          res.status(500).send({
            Status: "Failed",
            Message: "Password doesn't match confirm password",
          });
        }
      } else {
        res
          .status(500)
          .send({ Status: "Failed", Message: "All fields are required" });
      }
    }
  } catch (error) {}
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (email && password) {
      const user = await User.findOne({ email: email });
      if (user != null) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (user.email === email && isMatch) {
          const token = jwt.sign({ userID: user._id }, process.env.SECRET_KEY, {
            expiresIn: "1h",
          });
          res.status(200).send({
            Status: "Success",
            Message: "Login Successfully",
            token: token,
          });
        } else {
          res.status(500).send({
            Status: "Failed",
            Message: "Email or Password is incorrect",
          });
        }
      } else {
        res
          .status(500)
          .send({ Status: "Failed", Message: "You are not a registered User" });
      }
    } else {
      res
        .status(500)
        .send({ Status: "Failed", Message: "All fields are required" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      Status: "Failed",
      Message: "Unable to Login or Invalid Credientals",
    });
  }
};

const changePassword = async (req, res) => {
  const { password, confirm_password } = req.body;
  if (password && confirm_password) {
    if (password === confirm_password) {
      try {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        const userID = req.user._id;
        console.log(userID);
        await User.findByIdAndUpdate(userID, {
          $set: { password: newHashPassword },
        });
        res.status(200).send({
          Status: "Success",
          Message: "Password changed successfully",
        });
      } catch (error) {
        console.log(error);
        res
          .status(500)
          .send({ Status: "Failed", Message: "Error changing password" });
      }
    } else {
      res.status(500).send({
        Status: "Failed",
        Message: "Password and confirm password doesn't match",
      });
    }
  } else {
    res
      .status(500)
      .send({ Status: "Failed", Message: "All fields are required" });
  }
};

// Get Logged In User

const loggedUser = async (req, res) => {
  res.send({ User: req.user });
};

// Controller function to reset user password using email

const resetPasswordLink = async (req, res) => {
  const { email } = req.body;
  if (email) {
    const user = await User.findOne({ email: email });
    if (user) {
      const secret = user._id + process.env.SECRET_KEY;
      const token = jwt.sign({ userID: user._id }, secret, {
        expiresIn: "15m",
      });
      const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;
      console.log(link);
      const info = await transporter.sendMail({
        from: "your_email",
        to: user.email,
        subject: "Password Reset Link",
        html: `<a href=${link}>Click here</a> to reset password`,
      });
      res.status(200).send({
        Status: "Success",
        Message: "Email sent successfully... Please check your email",
        Info: info,
      });
    } else {
      res
        .status(500)
        .send({ Status: "Failed", Message: "No such email exists" });
    }
  } else {
    res
      .status(500)
      .send({ Status: "Failed", Message: "Email field is required" });
  }
};

// Controller function to reset password

const resetPassword = async (req, res) => {
  const { password, confirm_password } = req.body;
  const { id, token } = req.params;
  const user = await User.findById(id);
  const newToken = user._id + process.env.SECRET_KEY;
  try {
    jwt.verify(token, newToken);
    if (password && confirm_password) {
      if (password === confirm_password) {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        await User.findByIdAndUpdate(user._id, {
          $set: { password: newHashPassword },
        });
        res.status(200).send({
          Status: "Success",
          Message: "Password reset successfully",
        });
      } else {
        res.status(500).send({
          Status: "Failed",
          Message: "Password and Confirm password doesn't match",
        });
      }
    } else {
      res
        .status(500)
        .send({ Status: "Failed", Message: "ALl fields are required" });
    }
  } catch (error) {}
};

module.exports = {
  userRegistration,
  userLogin,
  changePassword,
  loggedUser,
  resetPasswordLink,
  resetPassword,
};

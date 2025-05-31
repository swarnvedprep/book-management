const User = require("../models/User");
const { sendSMS } = require("../config/sms");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    if (users.length > 0) {
      res
        .status(200)
        .json({ message: "Users fetched successfully", data: users });
    } else res.status(400).json({ message: "No User Found" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (user) {      
      res.status(200)
        .json({ message: "User fetched successfully", data: user });
    } else res.status(400).json({ message: "No User Found" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.set(req.body);

      await user.save();

      res.status(200).json({ message: "User updated successfully", updatedUser: user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error.message);

    res.status(500).json({ message: error.message || "Internal server error" });
  }
};


const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (user) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};
// @desc    Register a new user
// @route   POST /api/users/register
// @access  Private/Admin
const register = async (req, res) => {
  const { name, email, password, role, phoneNumber } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phoneNumber,
    });

    if (user) {
      const message = `Welcome to Book Management System, ${name}. Your account has been created as ${role}.`;
      await sendSMS(phoneNumber, message);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  getAllUsers,
  updateUser,
  deleteUser,
  register,
  getUserById
};

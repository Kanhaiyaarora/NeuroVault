import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { JWT_SECRET, NODE_ENV } from "../config/env.js";

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
};

const getCookieOptions = () => ({
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

export const registerController = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required",
      });
    }

    const existingUser = await userModel.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      const field =
        existingUser.email === email.toLowerCase() ? "email" : "username";
      return res.status(409).json({
        success: false,
        message: `${field} already in use`,
      });
    }

    const user = await userModel.create({
      username,
      email: email.toLowerCase(),
      password,
    });

    const token = createToken(user);

    res.cookie("token", token, getCookieOptions());

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("registerController error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to register user",
      error: error.message || "Internal server error",
    });
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = createToken(user);

    res.cookie("token", token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    console.error("loginController error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to login",
      error: error.message || "Internal server error",
    });
  }
};

export const logoutController = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("logoutController error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to logout",
      error: error.message || "Internal server error",
    });
  }
};

export const getmeController = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await userModel.findById(req.user.id).select("-password -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("getmeController error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve user",
      error: error.message || "Internal server error",
    });
  }
};

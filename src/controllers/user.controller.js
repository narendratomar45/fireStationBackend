import mongoose from "mongoose";
import { uploadOnCloudinary } from "#config/cloudinary.js";
import { User } from "#models/user.model.js";
import { ApiError } from "#utils/ApiError.js";
import { ApiResponse } from "#utils/ApiResponse.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import nodemailer from "nodemailer";

const generateAccessTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();

    return { accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nitish44199@gmail.com",
    pass: "mffz xhok ybhi mslm",
  },
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  const {
    fullName,
    fireStation,
    mobile,
    email,
    designation,
    role,
    district,
    password,
    confirmPassword,
    pisNo,
  } = req.body;

  if (
    !fullName ||
    !fireStation ||
    !mobile ||
    !email ||
    !designation ||
    !role ||
    !district ||
    !password ||
    !confirmPassword ||
    !pisNo
  ) {
    throw new ApiError(401, "All fields are required");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(401, "User already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatarURL = await uploadOnCloudinary(avatarLocalPath);
  if (!avatarURL || !avatarURL.secure_url) {
    throw new ApiError(400, "Failed to upload avatar file");
  }

  const newUser = await User.create({
    fullName,
    fireStation,
    mobile,
    email,
    designation,
    role,
    district,
    password,
    avatar: avatarURL.secure_url,
    pisNo,
  });
  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User Created Successfully"));
});

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(401, "all fields require");
  }

  const existingEmployee = await User.findOne({ email });

  if (!existingEmployee) {
    throw new ApiError(400, "Employee not found");
  }

  const isPasswordValid = await existingEmployee.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const otp = generateOTP();
  existingEmployee.otp = otp;
  existingEmployee.otpExpires = Date.now() + 5 * 60 * 1000;
  await existingEmployee.save();

  console.log("Sending OTP to:", email);

  const mailOptions = {
    from: "nitish44199@gmail.com",
    to: email,
    subject: "Your OTP Code for fire Web Application Login",
    text: `Dear ${existingEmployee.fullName},
  
  Thank you for using fire web Application service.
  
  This is regarding your login request.
  
  ${otp} is the OTP to verify your login.
  
  It is valid till ${new Date(Date.now() + 5 * 60 * 1000).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST.
  
  To avoid any security risks, please do not share this OTP with anyone.
  
  Always here to assist you.
  
  Regards,  
  Fire Station Support Team`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending OTP email:", error);
      return res
        .status(500)
        .json({ message: "Error sending OTP email", error: error.message });
    }
    console.log("Email sent successfully:", info.response);
    res
      .status(200)
      .json({ otp, message: "OTP sent to your email. Please verify." });
  });
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const existingEmployee = await User.findOne({ email });

  if (!existingEmployee) {
    throw new ApiError(400, "Employee not found");
  }

  if (
    existingEmployee.otp !== otp ||
    Date.now() > existingEmployee.otpExpires
  ) {
    throw new ApiError(401, "Invalid or expired OTP");
  }

  existingEmployee.otp = null;
  existingEmployee.otpExpires = null;
  await existingEmployee.save();

  const { accessToken } = await generateAccessTokens(existingEmployee._id);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)

    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          user: existingEmployee,
          message: "Login successful",
        },
        "OTP verified. Login successful."
      )
    );
});

const getAllUsers = asyncHandler(async (req, res) => {
  const userList = await User.find({});
  if (!userList) {
    throw new ApiError(401, "User List Not Found");
  }
  res.status(201).json(new ApiResponse(201, userList, "user get successful"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, req.user, "Single user retrieved successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(401, "ID is not valid");
  }

  await User.findByIdAndDelete(id);

  res.status(200).json(new ApiResponse(200, "", "User delete Successful"));
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(401, "ID is not valid");
  }
});

export {
  createUser,
  userLogin,
  verifyOTP,
  getAllUsers,
  getCurrentUser,
  deleteUser,
};

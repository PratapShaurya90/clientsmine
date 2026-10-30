const User = require('../models/user')
const bcrypt = require('bcrypt')
const generateToken = require("../utils/generateToken")
const jwt = require('jsonwebtoken')

const Signup = async (req, res) => {
    try {
        const { phone, username, email, password, city, state, country, occupation } = req.body;
        if (!phone || !username || !email || !password || !city || !state || !country || !occupation) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const IsThatUser = await User.findOne({ $or: [{ email }, { phone }] })
        if (IsThatUser) {
            return res.status(400).json({ message: "User already exists" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const user = await User.create({
            username,
            email,
            password: hashPassword,
            country,
            state,
            city,
            phone,
            occupation,
        })

        res.status(201).json({
            message: "User created successfully",
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error Occured" })
    }
}

const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "Signup First" })
        }

        const passwordValid = await bcrypt.compare(password, user.password)
        if (!passwordValid) {
            return res.status(400).json({ message: "Invalid Password" })
        }

        const accessToken = generateToken(res, user._id)

        res.status(200).json({
            message: "User Login Successfully",
            token: accessToken,
            user

        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error Occured" })
    }
}

const Logout = async (req, res) => {
    try {
        res.cookie('refreshToken', '', {
            httpOnly: true,
            expires: new Date(0)
        });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error Occured during logout" })
    }
}

const RefreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "Not authorized, no refresh token provided" });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const accessToken = generateToken(res, user._id);

        res.status(200).json({
            message: "Token refreshed successfully",
            token: accessToken,
        });

    } catch (error) {
        console.log(error)
        res.status(401).json({ message: "Not authorized, refresh token failed" })
    }
}

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Occured" });
    }
}

const upgradePro = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { isPro: true },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ success: true, message: "Upgraded to Pro successfully", user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Occured during upgrade" });
    }
}

module.exports = { Login, Signup, RefreshToken, Logout, getMe, upgradePro }

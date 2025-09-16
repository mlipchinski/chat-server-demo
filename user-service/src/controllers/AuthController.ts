import config from "../config/config";
import { IUser, User } from "../database";
import { ApiError, encryptPassword, isPasswordMatch } from "../utils";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";

const jwtsecret = config.JWT_SECRET as string;
const COOKIE_EXP_DAYS = 90;
const expirationDate = new Date(
    Date.now() + COOKIE_EXP_DAYS * 24 * 60 * 60 * 1000
);
const cookieOptions = {
    expires: expirationDate,
    secure: false,
    httpOnly: true,
};

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        const userExists: boolean | null = await User.findOne({ email });

        if (userExists) {
            throw new ApiError(400, "User already exists");
        }

        const user = await User.create({
            name,
            email,
            password: await encryptPassword(password),
        })

        return res.json({
            status: 200,
            message: "User registered successfully!",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error: any) {
        return res.json({
            status: 500,
            message: error.message,
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");

        if (!user || !isPasswordMatch(password, user.password)) {
            throw new ApiError(400, "Incorrect email or password");
        }

        const token = await createSendToken(user!, res);

        return res.json({
            status: 200,
            message: "User logged in successfully",
            token,
        });
        
    } catch (error: any) {
        return res.json({
            status: 500,
            message: error.message,
        });
    }
};

const createSendToken = async (user: IUser, res: Response) => {
    const { name, email } = user;
    const token = jwt.sign({
        name,
        email,
    },
    jwtsecret,
    {
        expiresIn: "1d",
        });
    
    if (config.env === "production") {
        cookieOptions.secure = true;
    }

    res.cookie("jwt", token, cookieOptions);

    return res;
};
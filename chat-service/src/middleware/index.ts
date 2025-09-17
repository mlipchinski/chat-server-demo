import { NextFunction, Request, Response, ErrorRequestHandler } from "express";
import config from "../config/config";
import { ApiError } from "../utils";
import jwt from 'jsonwebtoken';

interface ITokenPayload {
    id: string;
    name: string;
    email: string;
    iat: number;
    exp: number;
}

interface IUser {
    _id: string;
    name: string;
    email: string;
    passwod: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAuthRequest extends Request {
    user: IUser;
}

const jwtsecret: string = config.JWT_SECRET as string;

export const authMiddleware = async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next(new ApiError(401, "Missing authorization header"));
    }

    const [, token] = authHeader.split(" ");

    try {
        const decoded = jwt.verify(token, jwtsecret) as ITokenPayload;
        req.user = {
            _id: decoded.id,
            email: decoded.email,
            createdAt: new Date(decoded.iat * 1000),
            updatedAt: new Date(decoded.exp * 1000),
            name: decoded.name,
            passwod: "",
        }

        return next();
    } catch (error) {
        console.error(error);
        return next(new ApiError(401, "Invalid token"));
    }

}

export const errorConverter: ErrorRequestHandler = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || (error instanceof Error ? 400 : 500);

        const message = error.message || (statusCode === 400 ? "Bad request" : "Internal server error");

        error = new ApiError(statusCode, message, false, err.stack.toString());
    }
    next(error);
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    if (process.env.NODE_ENV === "production" && !err.isOperational) {
        statusCode = 500;
        message = "Internal server error";
    }

    res.locals.errorMessage = err.message;

    const response = {
        code: statusCode,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    };

    if (process.env.NODE_ENV === "development") {
        console.error(err);
    }

    res.status(statusCode).json(response);

    next();
};
import bcrypt from 'bcrypt';

export class ApiError extends Error {
    statusCode: number; 
    isOperational: boolean;

    constructor(statusCode:number, message: string | undefined, isOperational: boolean = true, stack ="") {
        super(message);

        this.statusCode = statusCode;
        this.isOperational = isOperational;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export const encryptPassword = async (password: string) => {
    return await bcrypt.hash(password, 12);
};

export const isPasswordMatch = async (password: string, userPassword: string) => {
    return await bcrypt.compare(password, userPassword);
};
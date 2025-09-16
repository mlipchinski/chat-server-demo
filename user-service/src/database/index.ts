import { connectDB } from "./connection";
import User from "./models/UserModel";
import type { IUser } from "./models/UserModel";

export { User, connectDB };
export type { IUser };

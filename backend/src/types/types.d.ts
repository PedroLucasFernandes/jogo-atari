import { Request } from "express";
import { IUserResponse } from "../interfaces/user";

declare global {
    namespace Express {
        interface Request {
            user?: IUserResponse;
            cookies?: { [key: string]: string };
        }
    }
}

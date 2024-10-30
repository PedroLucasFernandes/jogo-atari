import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
    user?: { id: string; username: string; email: string };
}

export const auth = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    const token = req.cookies.session_id;

    if (!token) {
        res.status(401).json({ message: "Access Denied" });
        return;
    }

    jwt.verify(token, process.env.SECRET_KEY!, (err: any, decoded: any) => {
        if (err) {
            res.status(400).json({ message: "Invalid jwt token" });
            return;
        }

        // Definindo o objeto user com a tipagem da interface
        req.user = {
            id: (decoded as { id: string }).id,
            username: (decoded as { username: string }).username,
            email: (decoded as { email: string }).email
        };

        next();
    });
};
import * as loginServices from "../services/loginServices"
import { Request, Response } from "express"

export const authenticate = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const { auth, token, user } = await loginServices.authenticateUser(email, password);

        if (!auth) {
            res.status(400).json({ error: "Invalid username and/or password." });
            return;
        }

        const maxAge = 10 * 24 * 60 * 60 * 1000;
        res.cookie("session_id", token, { maxAge, httpOnly: true });

        // Retornando os dados do usuário junto com o token de autenticação
        res.status(200).json({ data: user, auth, message: "User successfully authenticated!" });
    } catch (error) {
        res.status(500).json({ error: "Failed to authenticate user, server error." });
    }
};

export const logout = (req: Request, res: Response) => {
    try {
        res.clearCookie("session_id", { path: "/" });
        res.status(200).json({ success: true, message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ error: "Failed to logout" });
    }
};




// import * as loginServices from "../services/loginServices"
// import { Request, Response } from "express"


// export const authenticate: (req: Request, res: Response) => Promise<Response> = async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const { auth, token, user } = await loginServices.authenticateUser(email, password);

//         if (!auth) {
//             return res.status(400).json({ error: "Invalid username and/or password." });
//         }

//         const maxAge = 10 * 24 * 60 * 60 * 1000;
//         res.cookie("session_id", token, { maxAge, httpOnly: true });

//         // Retornando os dados do usuário junto com o token de autenticação
//         return res.status(200).json({ data: user, auth, message: "User successfully authenticated!" });
//     } catch (error) {
//         return res.status(500).json({ error: "Failed to authenticate user, server error." });
//     }
// };

// export const logout = (req: Request, res: Response) => {
//     try {
//         res.clearCookie("session_id", { path: "/" });
//         return res.status(200).json({ success: true, message: "Logout successful" })
//     } catch (error) {
//         return res.status(500).json({ error: "Failed to logout" })
//     }
// }
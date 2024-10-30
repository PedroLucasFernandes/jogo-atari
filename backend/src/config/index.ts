require("dotenv").config();

export const NODE_ENV = process.env.NODE_ENV || "development";
export const DATABASE_URL = process.env.DATABASE_URL;
export const PORT = process.env.PORT;
export const SECRET_KEY = process.env.SECRET_KEY!;
const bcrypt = require("bcryptjs");

export async function comparePassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    try {
        const match: boolean = await bcrypt.compare(password, hashedPassword);
        return match;
    } catch (error: any) {
        console.error("Error comparing passwords:", error);
        return false;
    }
}
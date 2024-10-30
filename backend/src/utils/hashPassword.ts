
const bcrypt = require("bcryptjs");

// Função para criar um hash seguro para a senha
export async function hashPassword(password: string): Promise<string | null> {
    try {
        const salt: string = await bcrypt.genSalt(10);
        const hash: string = await bcrypt.hash(password, salt);
        return hash;
    } catch (error: any) {
        console.error("Error generating password hash:", error);
        return null;
    }
}

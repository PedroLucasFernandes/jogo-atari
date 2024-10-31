import React from "react";
import { GoogleLogin, googleLogout, CredentialResponse } from "@react-oauth/google";

const LoginButton: React.FC = () => {
    const handleLoginSuccess = async (response: CredentialResponse) => {
        if (response.credential) {
            try {
                // Enviar o token do Google para o backend
                const res = await fetch("http://localhost:3001/api/auth/google", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ token: response.credential })
                });

                const data = await res.json();

                if (res.ok) {
                    console.log("Autenticação bem-sucedida:", data);
                    // Aqui você pode salvar o token JWT no localStorage, no state ou cookie para futuras requisições
                } else {
                    console.error("Erro na autenticação:", data.error);
                }
            } catch (error) {
                console.error("Erro de rede ao autenticar:", error);
            }
        }
    };

    const handleLoginFailure = () => {
        console.error("Falha ao fazer login com o Google");
    };

    return (
        <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={handleLoginFailure}
        />
    );
};

export default LoginButton;

import React from "react";
import { GoogleLogin, googleLogout, CredentialResponse } from "@react-oauth/google";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { User } from "../../interfaces/User";

const LoginGoogleButton: React.FC = () => {
    const { setUser } = useUser();
    const navigate = useNavigate();
    const handleLoginSuccess = async (response: CredentialResponse) => {
        if (response.credential) {
            try {
                // Enviar o token do Google para o backend
                const res = await fetch("http://localhost:3001/api/auth/google", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({ token: response.credential })
                });

                const data = await res.json();

                if (data) {
                    setUser(data as User);
                    navigate('/monolito');
              
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

export default LoginGoogleButton;

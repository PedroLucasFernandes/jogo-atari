import React, { useState } from "react";
import './LogoutButton.css';
import Button from "@mui/joy/Button";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { logoutApi } from '../../api/logoutApi';
import { gameAudio } from '../../utils/audioManager';

export const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    const { success, error } = await logoutApi();

    if (error) {
      console.error(error);
      return;
    }

    if (success) {
      console.log("Deslogado com sucesso");
      setUser(null); // Limpar o estado de usuário
      gameAudio.stopAll(); // Parar todos os sons
      navigate('/'); // Redireciona para a tela de login
    }
  };

  return (
    <>
      <div
        onClick={() => setShowLogout(!showLogout)}
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          cursor: 'pointer',
          color: 'white',
          zIndex: 10,
        }}
      >
        <AccountCircle fontSize="large" />
      </div>

      {showLogout && (
        <div
        id="logout-button"
          style={{
            position: 'fixed',
            top: '60px',
            right: '16px',
            zIndex: 9,
          }}
        >
          <Button onClick={handleLogout}>
            Logout
          </Button>
        </div>
      )}
    </>
  );
};

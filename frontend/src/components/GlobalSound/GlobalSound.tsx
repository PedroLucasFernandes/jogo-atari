import React, { useEffect } from "react";
import { gameAudio } from "../../utils/audioManager";
import { useLocation } from "react-router-dom";

interface GlobalSoundProps {
  currentScreen: string;
}

export const GlobalSound: React.FC<GlobalSoundProps> = ({ currentScreen }) => {
  const location = useLocation();

  useEffect(() => {
     // Se estiver na tela de login ("/"), parar todos os sons
     if (location.pathname === '/' || gameAudio.isAudioMuted()) {
      gameAudio.stopAll();
      return;
    }
    // Tocar música com base na tela atual
    // Restaurar o áudio com base no estado após o recarregamento
  if (location.pathname === '/monolito') {
    if (currentScreen === 'game' && !gameAudio.isPlayingGameMusic) {
      gameAudio.startBackgroundMusic();
    } else if (!gameAudio.isPlayingHomeMusic) {
      gameAudio.playMenuSound();
    }
  }

    // Forçar a atualização no localStorage quando o estado do áudio mudar
    gameAudio.saveAudioState(); // Salvar estado a cada vez que o áudio mudar
  }, [location, currentScreen]);

  return null;
};
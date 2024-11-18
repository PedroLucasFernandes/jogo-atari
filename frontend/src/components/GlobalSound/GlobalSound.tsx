import React, { useEffect } from "react";
import { gameAudio } from "../../utils/audioManager";
import { useLocation } from "react-router-dom";

interface GlobalSoundProps {
  currentScreen: string;
}

export const GlobalSound: React.FC<GlobalSoundProps> = ({ currentScreen }) => {
  const location = useLocation();

  const playMusicWithFallback = async () => {
    try {
      // Tocar música com base no estado
      if (gameAudio.isAudioMuted()) {
        gameAudio.stopAll();
        gameAudio.saveAudioState(); // Garantir que o estado seja salvo
        return;
      }

      if (location.pathname === '/monolito') {
        if (currentScreen === 'game' && !gameAudio.isPlayingGameMusic) {
          console.log(currentScreen)
          gameAudio.stopAll(); // Parar músicas anteriores
          gameAudio.startBackgroundMusic();
          gameAudio.saveAudioState();
        } else if (!gameAudio.isPlayingHomeMusic) {
          console.log(currentScreen)
          gameAudio.stopAll(); // Parar músicas anteriores
          gameAudio.playMenuSound();
          gameAudio.saveAudioState();
        }
      }

      // // Salvar estado do áudio após tocar
      // gameAudio.saveAudioState();
    } catch (error) {
      console.log("Reprodução automática bloqueada, aguardando interação do usuário...");
      // Adicionar listener para tentar novamente após uma interação do usuário
      document.addEventListener('click', handleUserInteraction, { once: true });
    }
  };

  const handleUserInteraction = async () => {
    console.log("Interação detectada, tentando tocar música novamente...");
    playMusicWithFallback();
  };

  useEffect(() => {
    // Carregar estado do áudio do localStorage ao iniciar
    gameAudio.loadAudioState();

    // Tentar tocar música na montagem inicial
    playMusicWithFallback();

    // Tentar tocar música novamente ao voltar para a aba
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        gameAudio.loadAudioState(); // Garantir que o estado correto seja carregado
        playMusicWithFallback();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [location, currentScreen]);

  return null;
};




// import React, { useEffect } from "react";
// import { gameAudio } from "../../utils/audioManager";
// import { useLocation } from "react-router-dom";

// interface GlobalSoundProps {
//   currentScreen: string;
// }

// export const GlobalSound: React.FC<GlobalSoundProps> = ({ currentScreen }) => {
//   const location = useLocation();

//   useEffect(() => {

//     gameAudio.loadAudioState();

//      // Se estiver na tela de login ("/"), parar todos os sons
//      if (location.pathname === '/' || gameAudio.isAudioMuted()) {
//       gameAudio.stopAll();
//       return;
//     }
//     // Tocar música com base na tela atual
//     // Restaurar o áudio com base no estado após o recarregamento
//   if (location.pathname === '/monolito') {
//     if (currentScreen === 'game' && !gameAudio.isPlayingGameMusic) {
//       gameAudio.startBackgroundMusic();
//     } else if (!gameAudio.isPlayingHomeMusic) {
//       gameAudio.playMenuSound();
//     }
//   }

//     // Forçar a atualização no localStorage quando o estado do áudio mudar
//     gameAudio.saveAudioState(); // Salvar estado a cada vez que o áudio mudar
//   }, [location, currentScreen]);

//   return null;
// };
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
  }, [location, currentScreen]);

  return null;
};



// import React, { useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { gameAudio } from "../../utils/audioManager";

// interface GlobalSoundProps {
//   currentScreen: string;
// }

// export const GlobalSound: React.FC = () => {
//   const location = useLocation();

//   useEffect(() => {
//     if (location.pathname === '/') {
//       gameAudio.stopAll(); 
//     } else {
//       gameAudio.stopAll(); 
//       gameAudio.playMenuSound(); 
//     }

//     return () => {
      
//       gameAudio.stopAll();
//     };
//   }, [location]);

//   return null; 
// };

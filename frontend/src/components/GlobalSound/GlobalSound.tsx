import React, { useEffect } from "react";
import { gameAudio } from "../../utils/audioManager";
import { useLocation } from "react-router-dom";

interface GlobalSoundProps {
  currentScreen: string;
}

export const GlobalSound: React.FC<GlobalSoundProps> = ({ currentScreen }) => {
  const location = useLocation();

  useEffect(() => {
    // Parar todos os sons primeiro
    gameAudio.stopAll();

    // Se estiver na tela de login ("/"), não tocar nenhum som
    if (location.pathname === '/' || gameAudio.isAudioMuted()) return;

    // Tocar música com base na tela atual
    if (location.pathname === '/monolito') {
      if (currentScreen === 'game') {
        gameAudio.startBackgroundMusic();
      } else {
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

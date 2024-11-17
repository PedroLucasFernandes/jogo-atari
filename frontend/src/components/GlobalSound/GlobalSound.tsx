import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { gameAudio } from "../../utils/audioManager";

export const GlobalSound: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') {
      gameAudio.stopAll(); 
    } else {
      gameAudio.stopAll(); 
      gameAudio.playMenuSound(true); 
    }

    return () => {
      
      gameAudio.stopAll();
    };
  }, [location]);

  return null; 
};

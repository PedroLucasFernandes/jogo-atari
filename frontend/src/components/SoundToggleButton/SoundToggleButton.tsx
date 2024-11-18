import React, { useState, useEffect } from 'react';
import './SoundToggleButton.css';
import { gameAudio } from '../../utils/audioManager';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

export const SoundToggleButton: React.FC = () => {
  const [isMuted, setIsMuted] = useState(gameAudio.isAudioMuted());

  const handleToggleSound = () => {
    gameAudio.toggleMute();
    setIsMuted(gameAudio.isAudioMuted());
  };

  console.log("som está mutado",isMuted)

  return (
    <div
      className="sound-toggle-icon"
      onClick={handleToggleSound}
      style={{ cursor: 'pointer', position: 'fixed', top: '16px', right: '60px', zIndex: 10, color: 'white' }}
    >
      {isMuted ? <VolumeOffIcon fontSize="large" /> : <VolumeUpIcon fontSize="large" />}
    </div>
  );
};

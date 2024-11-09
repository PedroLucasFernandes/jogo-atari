// src/utils/audioManager.ts
const sounds = {
    hitPlayer: new Audio('/sounds/hitPlayer.mp3'),
    hitPlanet: new Audio('/sounds/hitPlanet.mp3'),
    ballBounce: new Audio('/sounds/ballBounce.mp3'),
  };
  
  export function playSound(soundName: keyof typeof sounds) {
    const sound = sounds[soundName];
    if (sound) {
      sound.currentTime = 0; // Reseta o som para o início
      sound.play();
    }
  }
  
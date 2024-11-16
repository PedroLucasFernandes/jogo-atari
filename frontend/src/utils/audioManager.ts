class GameAudio {
  private backgroundMusic: HTMLAudioElement;
  private destructionSound: HTMLAudioElement;
  private isMuted: boolean = false;
  private masterVolume: number = 1.0;
 
  constructor() {
    this.backgroundMusic = new Audio('/sounds/bg5.mp3');
    this.destructionSound = new Audio('/sounds/hitPlanet6.mp3');
    this.backgroundMusic.loop = true;
    
    // Volume base dos sons (muito baixo)
    this.backgroundMusic.volume = 0.05 * this.masterVolume;
    this.destructionSound.volume = 0.1 * this.masterVolume;
  }
  
  // Novo método para controlar volume mestre
  public setMasterVolume(value: number): void {
    // Garante que o valor está entre 0 e 1
    this.masterVolume = Math.max(0, Math.min(1, value));
    
    // Atualiza o volume de todos os sons
    this.backgroundMusic.volume = 0.05 * this.masterVolume;
    this.destructionSound.volume = 0.1 * this.masterVolume;
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }
 
  public startBackgroundMusic(): void {
    if (!this.isMuted) {
      this.backgroundMusic.play().catch(err => console.log('Áudio precisa de interação do usuário'));
    }
  }
 
  public playDestructionSound(): void {
    if (!this.isMuted) {
      const sound = this.destructionSound.cloneNode() as HTMLAudioElement;
      sound.volume = 0.1 * this.masterVolume; // Aplica volume mestre ao clone
      sound.play().catch(err => console.log('Erro ao tocar som de destruição'));
    }
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.backgroundMusic.pause();
    } else {
      this.backgroundMusic.play().catch(err => console.log('Áudio precisa de interação do usuário'));
    }
  }
 
  public stopAll(): void {
    this.backgroundMusic.pause();
    this.backgroundMusic.currentTime = 0;
  }
}
 
export const gameAudio = new GameAudio();
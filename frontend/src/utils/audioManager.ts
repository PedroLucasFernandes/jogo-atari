class GameAudio {
  private backgroundMusic: HTMLAudioElement;
  private destructionSound: HTMLAudioElement;
  private victorySound: HTMLAudioElement;
  private defeatSound: HTMLAudioElement;
  private isMuted: boolean = false;
  private masterVolume: number = 1.0;
  private clickSound: HTMLAudioElement;
  private erroSound: HTMLAudioElement;
  private menuSound: HTMLAudioElement;
  private isPlayingHomeMusic: boolean = false;
  private isPlayingGameMusic: boolean = false;

  constructor() {
    this.backgroundMusic = new Audio('/sounds/bg5.mp3');
    this.destructionSound = new Audio('/sounds/hitPlanet6.mp3');
    this.victorySound = new Audio('/sounds/win1.mp3');
    this.defeatSound = new Audio('/sounds/loser4.mp3');
    this.clickSound = new Audio('/sounds/click.mp3');
    this.erroSound = new Audio('/sounds/erro.mp3');
    this.menuSound = new Audio('/sounds/mainmenu.mp3');

    this.backgroundMusic.loop = true;
    this.menuSound.loop = true;

    this.updateVolume();
  }

  // Método para atualizar o volume de todos os sons de acordo com o volume mestre
  private updateVolume(): void {
    const volume = this.isMuted ? 0 : this.masterVolume;

    this.backgroundMusic.volume = 0.05 * volume;
    this.destructionSound.volume = 0.1 * volume;
    this.victorySound.volume = 0.1 * volume;
    this.defeatSound.volume = 0.1 * volume;
    this.clickSound.volume = 0.04 * volume;
    this.erroSound.volume = 0.1 * volume;
    this.menuSound.volume = 0.1 * volume;
  }

  // Novo método para controlar o volume mestre
  public setMasterVolume(value: number): void {
    this.masterVolume = Math.max(0, Math.min(1, value));
    this.updateVolume(); // Atualiza o volume de todos os sons
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.updateVolume();

    if (this.isMuted) {
      this.stopAll();
    } else {
      // Retomar a música que estava tocando antes do mute
      if (this.isPlayingHomeMusic) {
        this.playMenuSound();
      } else if (this.isPlayingGameMusic) {
        this.startBackgroundMusic();
      }
    }
  }

  
  public isAudioMuted(): boolean {
    return this.isMuted;
  }

  public playClickSound(): void {
    if (!this.isMuted) {
      const sound = this.clickSound.cloneNode() as HTMLAudioElement;
      sound.volume = this.clickSound.volume;
      sound.play().catch(err => console.log('Erro ao tocar som de clique'));
    }
  }

  public playMenuSound(): void {
    if (!this.isMuted) {
      this.menuSound.play().catch(err => console.log('Erro ao tocar som do menu'));
      this.isPlayingHomeMusic = true;
      this.isPlayingGameMusic = false;
    }
  }

  public startBackgroundMusic(): void {
    if (!this.isMuted) {
      this.backgroundMusic.play().catch(err => console.log('Erro ao tocar som de background'));
      this.isPlayingHomeMusic = false;
      this.isPlayingGameMusic = true;
    }
  }
  

  public playErrorSound(): void {
    if (!this.isMuted) {
      const sound = this.erroSound.cloneNode() as HTMLAudioElement;
      sound.play().catch(err => console.log('Erro ao tocar som de erro'));
    }
  }

  public playDestructionSound(): void {
    if (!this.isMuted) {
      const sound = this.destructionSound.cloneNode() as HTMLAudioElement;
      sound.play().catch(err => console.log('Erro ao tocar som de destruição'));
    }
  }

  public playVictorySound(): void {
    if (!this.isMuted) {
      const sound = this.victorySound.cloneNode() as HTMLAudioElement;
      sound.play().catch(err => console.log('Erro ao tocar som de vitória'));
    }
  }

  public playDefeatSound(): void {
    if (!this.isMuted) {
      const sound = this.defeatSound.cloneNode() as HTMLAudioElement;
      sound.play().catch(err => console.log('Erro ao tocar som de derrota'));
    }
  }



  public stopAll(): void {
    this.backgroundMusic.pause();
    this.backgroundMusic.currentTime = 0;
    this.menuSound.pause();
    this.menuSound.currentTime = 0;
  }
}

export const gameAudio = new GameAudio();

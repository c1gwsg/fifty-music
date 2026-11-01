type AudioCallback = (state: {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isBuffering: boolean;
  volume: number;
}) => void;

class AudioEngine {
  private audio: HTMLAudioElement;
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private currentVolume = 0.5;

  private onStateChange: AudioCallback | null = null;
  private onTrackEnded: (() => void) | null = null;
  private isBuffering = false;
  private expectedDuration = 210;

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.crossOrigin = 'anonymous';

    // Retrieve saved volume or default to 50%
    try {
      const savedVol = localStorage.getItem('fifty_app_volume');
      if (savedVol !== null) {
        this.currentVolume = Math.max(0, Math.min(1, parseFloat(savedVol)));
      }
    } catch {}

    this.audio.volume = this.currentVolume;

    this.audio.addEventListener('timeupdate', () => {
      this.emitState();
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.isBuffering = false;
      if (isFinite(this.audio.duration) && this.audio.duration > 0) {
        this.expectedDuration = this.audio.duration;
      }
      this.emitState();
    });

    this.audio.addEventListener('canplay', () => {
      this.isBuffering = false;
      this.emitState();
    });

    this.audio.addEventListener('canplaythrough', () => {
      this.isBuffering = false;
      this.emitState();
    });

    this.audio.addEventListener('durationchange', () => {
      if (isFinite(this.audio.duration) && this.audio.duration > 0) {
        this.expectedDuration = this.audio.duration;
      }
      this.emitState();
    });

    this.audio.addEventListener('waiting', () => {
      this.isBuffering = true;
      this.emitState();
    });

    this.audio.addEventListener('playing', () => {
      this.isBuffering = false;
      this.emitState();
    });

    this.audio.addEventListener('pause', () => {
      this.emitState();
    });

    this.audio.addEventListener('ended', () => {
      if (this.onTrackEnded) {
        this.onTrackEnded();
      }
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio playback event error:', e);
      this.isBuffering = false;
      this.emitState();
    });
  }

  // Setup Web Audio API GainNode for true independent software volume control on iOS/Mobile
  private initWebAudio() {
    if (this.audioContext) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.audioContext = new AudioCtx();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.setValueAtTime(this.currentVolume, this.audioContext.currentTime);

      this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
      this.sourceNode.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
    } catch (err) {
      console.warn('Web Audio gain node setup note (will use standard element volume):', err);
    }
  }

  public subscribe(callback: AudioCallback, onEnded: () => void) {
    this.onStateChange = callback;
    this.onTrackEnded = onEnded;
  }

  public async loadAndPlay(url: string, expectedDuration?: number) {
    if (!url) return;
    if (expectedDuration && expectedDuration > 0) {
      this.expectedDuration = expectedDuration;
    }
    this.initWebAudio();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }

    try {
      this.isBuffering = true;
      this.emitState();

      // Resolve full absolute URL to avoid duplicate reload bugs
      let fullUrl = url;
      try {
        fullUrl = new URL(url, window.location.href).href;
      } catch {}

      if (this.audio.src !== fullUrl) {
        this.audio.src = fullUrl;
        this.audio.load();
      }
      await this.audio.play();
      this.isBuffering = false;
      this.emitState();
    } catch (err) {
      console.error('Audio play request failed:', err);
      this.isBuffering = false;
      this.emitState();
    }
  }

  public async play() {
    this.initWebAudio();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    try {
      await this.audio.play();
      this.isBuffering = false;
      this.emitState();
    } catch (err) {
      console.error('Play failed:', err);
      this.isBuffering = false;
      this.emitState();
    }
  }

  public getSrc(): string {
    return this.audio.src || '';
  }

  public pause() {
    this.audio.pause();
  }

  public seek(seconds: number) {
    if (isNaN(seconds) || !isFinite(seconds)) return;
    const target = Math.max(0, Math.min(seconds, this.getDuration()));

    // Smoothly silence output during seek to prevent stale buffer leak
    if (this.gainNode && this.audioContext) {
      try {
        this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      } catch {}
    }

    this.isBuffering = true;
    this.emitState();

    try {
      this.audio.currentTime = target;
    } catch (err) {
      console.warn('Seek error:', err);
    }

    const restoreGain = () => {
      if (this.gainNode && this.audioContext) {
        try {
          this.gainNode.gain.setValueAtTime(this.currentVolume, this.audioContext.currentTime);
        } catch {}
      }
      this.isBuffering = false;
      this.emitState();
    };

    const onSeeked = () => {
      this.audio.removeEventListener('seeked', onSeeked);
      restoreGain();
    };

    this.audio.addEventListener('seeked', onSeeked, { once: true });

    // Safety fallback: restore gain after 250ms
    setTimeout(() => {
      this.audio.removeEventListener('seeked', onSeeked);
      restoreGain();
    }, 250);
  }

  // Independent App Software Volume: Scales audio level independently of iOS/system volume
  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.currentVolume = clamped;
    this.audio.volume = clamped;

    this.initWebAudio();
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.setValueAtTime(clamped, this.audioContext.currentTime);
    }

    try {
      localStorage.setItem('fifty_app_volume', String(clamped));
    } catch {}

    this.emitState();
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public getDuration(): number {
    if (isFinite(this.audio.duration) && this.audio.duration > 0) {
      return this.audio.duration;
    }
    return this.expectedDuration || 210;
  }

  public getCurrentTime(): number {
    return this.audio.currentTime || 0;
  }

  public getIsPlaying(): boolean {
    return !this.audio.paused && !this.audio.ended && this.audio.readyState > 2;
  }

  private emitState() {
    if (this.onStateChange) {
      this.onStateChange({
        currentTime: this.audio.currentTime || 0,
        duration: this.getDuration(),
        isPlaying: !this.audio.paused,
        isBuffering: this.isBuffering,
        volume: this.currentVolume,
      });
    }
  }
}

export const audioEngine = new AudioEngine();

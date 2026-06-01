// Speech Recognition and Synthesis utility classes for the browser

export type HearingState = 'idle' | 'listening' | 'error';

export class VoiceHearing {
  private recognition: any = null;

  constructor(
    onResult: (text: string) => void,
    onStateChange: (state: HearingState) => void
  ) {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US'; // Default language

    this.recognition.onstart = () => onStateChange('listening');
    this.recognition.onend = () => onStateChange('idle');
    this.recognition.onerror = (e: any) => {
      console.error("Speech recognition error:", e);
      onStateChange('error');
    };
    this.recognition.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      onResult(resultText);
    };
  }

  public setLang(lang: 'en' | 'fr') {
    if (this.recognition) {
      this.recognition.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
    }
  }

  public start() {
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (err) {
        console.error("Failed to start voice recognition:", err);
      }
    }
  }

  public stop() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.error("Failed to stop voice recognition:", err);
      }
    }
  }
}

export function speakText(
  text: string,
  lang: 'en' | 'fr',
  onBoundary: (amplitude: number) => void,
  onEnd: () => void
) {
  if (!('speechSynthesis' in window)) {
    onEnd();
    return;
  }

  // Cancel any ongoing speaking
  window.speechSynthesis.cancel();

  // Strip markdown symbols for clean reading
  const cleanText = text
    .replace(/[*#`_\-]/g, '')
    .substring(0, 300); // Speak up to 300 chars for responsive assistants

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = lang === 'fr' ? 'fr-FR' : 'en-US';

  // Find a suitable voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => {
    const voiceLang = v.lang.toLowerCase();
    return lang === 'fr' ? voiceLang.startsWith('fr') : voiceLang.startsWith('en');
  });
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.rate = 1.05; // Slightly faster for high-tech feel
  utterance.pitch = 1.1; // Friendly assistant pitch

  // Mock vocal amplitude simulation on word boundaries
  let timerId: any = null;
  utterance.onstart = () => {
    timerId = setInterval(() => {
      // Simulate speaking amplitudes (glowing pulsing visualiser)
      const randomAmp = 0.4 + Math.random() * 0.6;
      onBoundary(randomAmp);
    }, 100);
  };

  utterance.onend = () => {
    if (timerId) clearInterval(timerId);
    onBoundary(0);
    onEnd();
  };

  utterance.onerror = () => {
    if (timerId) clearInterval(timerId);
    onBoundary(0);
    onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

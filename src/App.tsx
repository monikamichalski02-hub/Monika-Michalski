import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Mic, MicOff, Volume2, VolumeX, Sparkles, 
  RefreshCw, RefreshCcw, SendHorizontal, LayoutGrid, FileText, Bot, HelpCircle 
} from 'lucide-react';
import { VoiceVisualizer } from './components/VoiceVisualizer';
import { ResumeViewer } from './components/ResumeViewer';
import { Message } from './types';
import { VoiceHearing, speakText, stopSpeaking } from './utils/speech';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [inputLanguage, setInputLanguage] = useState<'en' | 'fr'>('en');
  const [voiceModeActive, setVoiceModeActive] = useState(false); // Text-to-speech enabled
  const [hearingState, setHearingState] = useState<'idle' | 'listening' | 'error'>('idle');
  const [assistantSpeaking, setAssistantSpeaking] = useState(false);
  const [voiceVolumeScale, setVoiceVolumeScale] = useState(0); // For visualizing speech output
  const [visualizerColor, setVisualizerColor] = useState<'cyan' | 'purple' | 'matrix'>('cyan');
  const [isLoading, setIsLoading] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const voiceHearingRef = useRef<VoiceHearing | null>(null);

  // Initialize conversation and speech recognition on mount
  useEffect(() => {
    const defaultTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "I am Monika's assistant, how can I help you ?",
        timestamp: defaultTime,
      }
    ]);

    // Bootstrap speech recognition callbacks
    const handleVoiceResult = (text: string) => {
      if (text.trim()) {
        handleSubmitMessage(text);
      }
    };

    const handleHearingStateChange = (state: 'idle' | 'listening' | 'error') => {
      setHearingState(state);
    };

    voiceHearingRef.current = new VoiceHearing(handleVoiceResult, handleHearingStateChange);
  }, []);

  // Sync speech hearing language language changes
  useEffect(() => {
    if (voiceHearingRef.current) {
      voiceHearingRef.current.setLang(inputLanguage);
    }
  }, [inputLanguage]);

  // Scroll to bottom of message logs
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleSpeechRecognition = () => {
    if (!voiceHearingRef.current) return;
    if (hearingState === 'listening') {
      voiceHearingRef.current.stop();
    } else {
      stopSpeaking();
      setAssistantSpeaking(false);
      setVoiceVolumeScale(0);
      voiceHearingRef.current.start();
    }
  };

  const handleSuggest = (query: string) => {
    handleSubmitMessage(query);
  };

  const handleSubmitMessage = async (textToSend?: string) => {
    const rawContent = textToSend !== undefined ? textToSend : userInput;
    if (!rawContent.trim() || isLoading) return;

    if (textToSend === undefined) {
      setUserInput('');
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: rawContent,
      timestamp,
      isVoice: textToSend !== undefined && hearingState === 'listening',
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setIsLoading(true);

    // If assistant was speaking, abort current audio
    stopSpeaking();
    setAssistantSpeaking(false);
    setVoiceVolumeScale(0);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedHistory }),
      });

      if (!response.ok) {
        throw new Error('API server returned an error');
      }

      const data = await response.json();
      const assistantMsg: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically speak reply if voice mode is active
      if (voiceModeActive || hearingState === 'listening') {
        const detectLang = (data.reply || "").toLowerCase();
        // Simple heuristic to match language of output response
        const speechLang = (detectLang.includes('bonjour') || detectLang.includes('est') || detectLang.includes('monika est') || detectLang.includes('competences')) ? 'fr' : inputLanguage;
        
        setAssistantSpeaking(true);
        speakText(
          data.reply,
          speechLang,
          (amplitude) => setVoiceVolumeScale(amplitude),
          () => setAssistantSpeaking(false)
        );
      }
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: "System connection offline. Mona holographic replies require a valid environment key or connection.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatHistory = () => {
    stopSpeaking();
    setAssistantSpeaking(false);
    setVoiceVolumeScale(0);
    const defaultTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "I am Monika's assistant, how can I help you ?",
        timestamp: defaultTime,
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-[#050608] text-white/90 flex flex-col font-sans relative antialiased overflow-x-hidden selection:bg-[#00F5FF]/30" id="mona-app-root">
      
      {/* Background Deepspace Ambient Glows */}
      <div className="absolute top-[30%] left-[25%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00F5FF]/3 rounded-full blur-[120px] pointer-events-none" />

      {/* Futuristic Cockpit Header */}
      <header className="border-b border-white/5 bg-[#080A0D]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-4 flex items-center justify-between" id="app-header">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-[#00F5FF]/10 flex items-center justify-center border border-[#00F5FF]/30 shadow-[0_0_15px_rgba(0,245,255,0.15)]">
              <Bot className="text-[#00F5FF]" size={20} />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00F5FF] shadow-[0_0_8px_#00F5FF] border border-[#050608]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-[0.2em] text-[#00F5FF] uppercase">Mona interface</h1>
              <span className="font-mono text-[9px] bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/20 px-1.5 rounded">v4.2</span>
            </div>
            <p className="text-[10px] tracking-wider uppercase text-white/40">Bilingual neural network</p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          {/* Visualizer Theme Options */}
          <div className="hidden md:flex items-center gap-1 bg-[#080A0D]/50 p-1 rounded-lg border border-white/5">
            {(['cyan', 'purple', 'matrix'] as const).map((color) => (
              <button
                key={color}
                onClick={() => setVisualizerColor(color)}
                className={`w-4 h-4 rounded-full transition-all duration-300 transform scale-90 hover:scale-110 cursor-pointer
                  ${color === 'cyan' ? 'bg-[#00F5FF]' : color === 'purple' ? 'bg-[#a855f7]' : 'bg-[#22c55e]'}
                  ${visualizerColor === color ? 'ring-2 ring-white scale-100 shadow-[0_0_8px_currentColor]' : 'opacity-35'}`}
                title={`Switch visual Theme: ${color}`}
              />
            ))}
          </div>

          {/* Language Toggle */}
          <button
            onClick={() => setInputLanguage((prev) => prev === 'en' ? 'fr' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080A0D] hover:bg-white/5 border border-white/10 text-xs font-mono text-white/70 hover:text-white transition-all cursor-pointer"
            title="Switch Language / Changer de langue"
          >
            <span>{inputLanguage === 'en' ? 'ENG' : 'FRA'}</span>
          </button>

          {/* Toggle CV View */}
          <button
            onClick={() => setShowProfilePanel((p) => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer
              ${showProfilePanel 
                ? 'bg-[#00F5FF]/10 border-[#00F5FF]/30 text-[#00F5FF]' 
                : 'bg-[#080A0D] border-white/10 text-white/55 hover:text-white'}`}
          >
            <FileText size={14} />
            <span className="hidden sm:inline">Portfolio CV</span>
          </button>

          {/* Reset button */}
          <button
            onClick={clearChatHistory}
            className="p-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 text-white/40 hover:text-white transition-all cursor-pointer"
            title="Clear conversation"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="app-workspace">
        
        {/* Left Side: Mona Visualiser Centerplace */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="w-full bg-[#080A0D]/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center flex-1 relative overflow-hidden" id="viz-container">
            {/* Hologram Matrix Decoration details */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[9px] font-mono text-white/30">
              <span className="w-1.5 h-1.5 bg-[#00F5FF] rounded-full animate-ping shadow-[0_0_8px_#00F5FF]" />
              <span>neural_core_active</span>
            </div>
            <div className="absolute top-3 right-3 text-[9px] font-mono text-white/30">
              {inputLanguage === 'en' ? 'LANG_SYS: ENG' : 'LANG_SYS: FRA'}
            </div>

            {/* Visualizer center stage */}
            <div className="w-full max-w-[280px] aspect-square flex items-center justify-center">
              <VoiceVisualizer 
                amplitude={voiceVolumeScale}
                isListening={hearingState === 'listening'}
                isSpeaking={assistantSpeaking}
                colorMode={visualizerColor}
              />
            </div>

            {/* Vocal Interaction Controls */}
            <div className="flex flex-col items-center gap-3 w-full max-w-sm mt-4">
              <div className="flex items-center gap-4">
                {/* Micro Input Activator Button */}
                <button
                  onClick={toggleSpeechRecognition}
                  className={`px-8 py-3.5 rounded-full flex items-center justify-center gap-2 transition-all duration-300 transform outline-none shadow-xl cursor-pointer font-bold text-xs uppercase tracking-widest
                    ${hearingState === 'listening' 
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20 scale-105 animate-pulse' 
                      : 'bg-[#00F5FF] text-[#050608] shadow-[0_10px_30px_rgba(0,245,255,0.25)] hover:shadow-[0_0_25px_rgba(0,245,255,0.4)] hover:scale-103'}`}
                  title={hearingState === 'listening' ? 'Stop Listening' : 'Talk with Voice'}
                >
                  {hearingState === 'listening' ? <MicOff size={16} /> : <Mic size={16} />}
                  <span>{hearingState === 'listening' ? 'Stop' : 'Voice Active'}</span>
                </button>

                {/* Speech Synthesis toggler */}
                <button
                  onClick={() => {
                    if (voiceModeActive) {
                      stopSpeaking();
                      setAssistantSpeaking(false);
                      setVoiceVolumeScale(0);
                    }
                    setVoiceModeActive(!voiceModeActive);
                  }}
                  className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer
                    ${voiceModeActive
                      ? 'bg-[#00F5FF]/15 border-[#00F5FF]/30 text-[#00F5FF] shadow-inner'
                      : 'bg-white/[0.02] border-white/10 text-white/40 hover:text-white'}`}
                  title={voiceModeActive ? 'Deactivate Text to Speech replies' : 'Activate Text to Speech replies'}
                >
                  {voiceModeActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
              </div>

              {/* Status information log */}
              <div className="text-center">
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest min-h-[16px]">
                  {hearingState === 'listening' 
                    ? "Neural stream is listening..." 
                    : assistantSpeaking 
                      ? "Mona is broadcasting answer" 
                      : "Neural interface ready"}
                </p>
                <p className="text-[10px] text-white/30 mt-1">
                  {hearingState === 'listening' 
                    ? "Speak in " + (inputLanguage === 'en' ? 'English' : 'French') 
                    : "Toggle micro to speak, or toggle speaker to broadcast audio replies"}
                </p>
              </div>
            </div>
          </div>

          {/* Suggestion Chips Box */}
          <div className="space-y-2 bg-[#080A0D]/30 p-4 rounded-xl border border-white/5">
            <h4 className="text-[10px] font-mono text-white/30 uppercase tracking-widest flex items-center gap-1.5">
              <HelpCircle size={12} /> Suggesions de commande
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Qui est Monika?', query: 'Cherche la synthèse de Monika.' },
                { label: "Check her experience", query: 'Explain Monika Michalski\'s professional experiences at Aberdeen Services.' },
                { label: 'What are her core skills?', query: 'What hard and soft skills does Monika Michalski have on Notion or Trello?' },
                { label: 'Master degree info', query: 'What master studies has she followed?' },
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => handleSuggest(chip.query)}
                  className="text-[11px] font-mono px-2.5 py-1.5 rounded-lg bg-[#080A0D] hover:bg-white/5 border border-white/5 hover:border-[#00F5FF]/30 text-white/55 hover:text-[#00F5FF] transition-all cursor-pointer text-left"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Chat Dialog + Profile (Slick grid layout) */}
        <div className={`lg:col-span-7 flex flex-col space-y-6 ${showProfilePanel ? 'lg:col-span-7' : 'lg:col-span-7'}`}>
          
          <AnimatePresence mode="wait">
            {!showProfilePanel ? (
              // Chat conversation component full-span
              <motion.div 
                key="chat_only"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col flex-1 bg-[#080A0D]/50 backdrop-blur-md rounded-2xl border border-white/5 h-full min-h-[480px]"
                id="interactive-dialogue-panel"
              >
                {/* Chat conversation box body */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <span className="font-mono text-xs tracking-wider text-[#00F5FF] flex items-center gap-1.5 uppercase">
                    <span className="w-1.5 h-1.5 bg-[#00F5FF] rounded-full animate-pulse shadow-[0_0_8px_#00F5FF]" />
                    Bilingual dialogue stream
                  </span>
                  <span className="text-[10px] font-mono text-white/30">
                    {messages.length} neural logs
                  </span>
                </div>

                {/* Dialog scroll screen */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[380px] min-h-[340px] sm:max-h-[450px]">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed
                        ${msg.role === 'user' 
                          ? 'bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/20 rounded-tr-none' 
                          : 'bg-white/[0.02] text-white/85 border border-white/5 rounded-tl-none'}`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <span className="text-[9px] font-mono text-white/30 mt-1 px-1">{msg.timestamp}</span>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex flex-col items-start">
                      <div className="bg-[#080A0D] text-white/45 border border-white/5 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-3">
                        <div className="flex space-x-1.5">
                          <span className="w-1.5 h-1.5 bg-[#00F5FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-[#00F5FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-[#00F5FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs font-mono text-white/40">Mona processing query...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message controls input */}
                <div className="p-4 border-t border-white/5 bg-[#080A0D]/70 rounded-b-2xl">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmitMessage()}
                      placeholder={inputLanguage === 'en' ? "Ask Mona about Monika's resume..." : "Posez une question à Mona..."}
                      className="flex-1 bg-white/[0.02] border border-[#00F5FF]/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00F5FF]/50 transition-colors font-sans"
                    />
                    <button
                      onClick={() => handleSubmitMessage()}
                      className="p-3.5 bg-[#00F5FF] text-[#050608] rounded-xl transition-all duration-300 transform hover:scale-105 shadow-[0_4px_15px_rgba(0,245,255,0.2)] hover:shadow-[0_0_20px_rgba(0,245,255,0.4)] select-none cursor-pointer"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              // Shared layout split mode: Chat dialog + Interactive profile viewer
              <motion.div 
                key="chat_split"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[480px]"
              >
                {/* Column A: Interactive Resume CV Viewer */}
                <div className="h-full">
                  <ResumeViewer onSuggestQuery={handleSuggest} />
                </div>

                {/* Column B: Chat bubble assistant */}
                <div className="flex flex-col bg-[#080A0D]/50 backdrop-blur-md rounded-2xl border border-white/5 h-full">
                  <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <span className="font-mono text-xs tracking-wider text-[#00F5FF] flex items-center gap-1.5 uppercase">
                      <span className="w-1.5 h-1.5 bg-[#00F5FF] rounded-full animate-pulse shadow-[0_0_8px_#00F5FF]" />
                      Mona Chat
                    </span>
                    <span className="text-[10px] font-mono text-white/30">
                      Active
                    </span>
                  </div>

                  {/* Chat scrolls */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[280px] min-h-[220px] sm:max-h-[380px]">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`max-w-[90%] rounded-2xl p-3 text-xs leading-relaxed
                          ${msg.role === 'user' 
                            ? 'bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/20 rounded-tr-none' 
                            : 'bg-white/[0.02] text-white/85 border border-white/5 rounded-tl-none'}`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <span className="text-[9px] font-mono text-white/30 mt-1 px-1">{msg.timestamp}</span>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex flex-col items-start">
                        <div className="bg-[#080A0D] text-white/45 border border-white/5 rounded-2xl rounded-tl-none p-3 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[#00F5FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-[#00F5FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-[#00F5FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat input footer */}
                  <div className="p-3 border-t border-white/5 bg-[#080A0D]/70 rounded-b-2xl">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmitMessage()}
                        placeholder={inputLanguage === 'en' ? "Ask Mona..." : "Parler..."}
                        className="flex-1 bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#00F5FF]/50 font-sans"
                      />
                      <button
                        onClick={() => handleSubmitMessage()}
                        className="p-2.5 bg-[#00F5FF] text-[#050608] font-bold rounded-lg transition-all transform hover:scale-105 shadow-[0_4px_12px_rgba(0,245,255,0.2)] hover:shadow-[0_0_15px_rgba(0,245,255,0.35)] cursor-pointer"
                      >
                        <Send size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Cyber Footer */}
      <footer className="border-t border-white/5 bg-[#080A0D]/50 backdrop-blur-md px-4 py-4 text-center text-xs text-white/30 font-mono flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full mt-auto" id="app-footer-bar">
        <p>© 2026 MONA COGNITIVE PORTFOLIO INTERFACE</p>
        <div className="flex items-center gap-4 mt-2 sm:mt-0 text-white/40">
          <span>LANG: BILINGUAL [ENG/FRA]</span>
          <span>•</span>
          <span>SESSION ID: MONA-X-992-BETA</span>
        </div>
      </footer>
    </div>
  );
}

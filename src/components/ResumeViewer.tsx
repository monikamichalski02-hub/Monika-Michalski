import React, { useState } from 'react';
import { monikaData } from '../data/monika-data';
import { Mail, Phone, MapPin, Linkedin, Briefcase, GraduationCap, Code, Compass, Globe, Sparkles } from 'lucide-react';

interface ResumeViewerProps {
  onSuggestQuery: (query: string) => void;
}

export const ResumeViewer: React.FC<ResumeViewerProps> = ({ onSuggestQuery }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'experience' | 'education' | 'skills'>('profile');

  const tabs = [
    { id: 'profile', label: 'Overview', icon: Sparkles },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills & Info', icon: Code },
  ];

  return (
    <div className="w-full flex flex-col h-full bg-[#080A0D]/60 backdrop-blur-md rounded-2xl border border-white/5 p-4 sm:p-6 overflow-hidden relative" id="resume-viewer-card">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F5FF]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#00F5FF]/3 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-light tracking-tight text-white mb-1">
            {monikaData.name}
          </h2>
          <p className="text-[#00F5FF] font-mono text-xs tracking-[0.2em] uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#00F5FF] rounded-full animate-ping" />
            {monikaData.title}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-white/40 font-mono w-full sm:w-auto">
          <div className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone size={13} className="text-[#00F5FF]" />
            <span>{monikaData.contact.phone}</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Mail size={13} className="text-[#00F5FF]" />
            <span>{monikaData.contact.email}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-[#00F5FF]" />
            <span>{monikaData.contact.address}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Linkedin size={13} className="text-[#00F5FF]" />
            <a href={`https://${monikaData.contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
              LinkedIn Profile
            </a>
          </div>
        </div>
      </div>

      {/* Interactive Tabs Menu */}
      <div className="flex overflow-x-auto gap-1 border-b border-white/5 pb-2 mb-4 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs transition-all duration-300 transform whitespace-nowrap outline-none cursor-pointer
                ${isActive 
                  ? 'bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/20 font-medium' 
                  : 'text-white/45 hover:text-white border border-transparent'}`}
            >
              <Icon size={14} className={isActive ? 'text-[#00F5FF]' : 'text-white/30'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents - Scrollable Box */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[380px] sm:max-h-[460px] text-slate-350 text-sm">
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
              <h3 className="text-[#00F5FF] font-mono text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={12} /> Key Qualifications / Synthèse
              </h3>
              <p className="leading-relaxed text-white/75">
                Monika is a deeply talented, bilingual <strong>Marketing & Communication Manager</strong> who is native in <strong>French</strong> & <strong>Polish</strong>, and fluent in <strong>English</strong> and <strong>Spanish</strong>. She combines sharp strategic marketing development with hands-on artistic media content creation.
              </p>
            </div>

            <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
              <h3 className="text-[#00F5FF] font-mono text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Compass size={12} /> Quick Actions & preset inquiries
              </h3>
              <p className="text-xs text-white/40 mb-3">
                Click a query block below to automatically ask her custom AI assistant Mona about the topic:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => onSuggestQuery("Tell me about Monika's communication strategy achievements.")}
                  className="p-2.5 rounded-lg text-left bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-[#00F5FF]/30 text-xs font-mono text-[#00F5FF]/80 hover:text-[#00F5FF] transition-all duration-300 cursor-pointer"
                >
                  → Marketing & brand strategy
                </button>
                <button
                  onClick={() => onSuggestQuery("What video editing and design tools does Monika master?")}
                  className="p-2.5 rounded-lg text-left bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-[#00F5FF]/30 text-xs font-mono text-[#00F5FF]/80 hover:text-[#00F5FF] transition-all duration-300 cursor-pointer"
                >
                  → Video editing & Adobe skills
                </button>
                <button
                  onClick={() => onSuggestQuery("Can we talk about Monika's master's degree and education?")}
                  className="p-2.5 rounded-lg text-left bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-[#00F5FF]/30 text-xs font-mono text-[#00F5FF]/80 hover:text-[#00F5FF] transition-all duration-300 cursor-pointer"
                >
                  → Academic studies (ESCE & Sorbonne)
                </button>
                <button
                  onClick={() => onSuggestQuery("Parle-moi de ses intérêts (Danse jazz et voyages)")}
                  className="p-2.5 rounded-lg text-left bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-[#00F5FF]/30 text-xs font-mono text-[#00F5FF]/80 hover:text-[#00F5FF] transition-all duration-300 cursor-pointer"
                >
                  → Loisirs : danse jazz & voyages (FR)
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="space-y-4 animate-fade-in">
            {monikaData.experience.map((exp, idx) => (
              <div key={idx} className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-start gap-2 flex-wrap">
                  <div>
                    <h4 className="font-medium text-white">{exp.role}</h4>
                    <span className="text-[#00F5FF] text-xs font-mono">{exp.company}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-white/50 text-xs font-mono">{exp.period}</span>
                </div>
                <ul className="list-disc list-outside pl-4 space-y-1.5 text-xs text-white/70">
                  {exp.details.map((detail, dIdx) => (
                    <li key={dIdx} className="leading-relaxed">{detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'education' && (
          <div className="space-y-3 animate-fade-in">
            {monikaData.education.map((edu, idx) => (
              <div key={idx} className="flex gap-4 items-start bg-white/[0.01] border border-white/5 p-3.5 rounded-xl">
                <div className="p-2 rounded-lg bg-[#00F5FF]/5 text-[#00F5FF]">
                  <GraduationCap size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="font-medium text-white text-sm">{edu.degree}</h4>
                    <span className="text-xs font-mono text-white/45 whitespace-nowrap">{edu.period}</span>
                  </div>
                  <p className="text-xs text-[#00F5FF] font-mono mt-0.5">{edu.institution}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-4 animate-fade-in">
            {/* Languages */}
            <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-mono uppercase text-[#00F5FF] tracking-wider flex items-center gap-1.5 mb-1">
                <Globe size={13} /> Langues / Languages
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {monikaData.skills.languages.map((lang, lIdx) => (
                  <div key={lIdx} className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                    <p className="font-semibold text-white text-xs">{lang.name}</p>
                    <p className="text-[11px] text-[#00F5FF]/85 font-mono mt-0.5">{lang.level}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hard Skills */}
            <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-2.5">
              <h4 className="text-xs font-mono uppercase text-[#00F5FF] tracking-wider">
                Hard skills & tools
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {monikaData.skills.hard.map((skill, sIdx) => (
                  <span key={sIdx} className="px-2.5 py-1 rounded bg-black/40 border border-white/5 text-white/70 text-xs font-mono hover:border-[#00F5FF]/30 transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Soft Skills */}
            <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-2.5">
              <h4 className="text-xs font-mono uppercase text-[#00F5FF]/85 tracking-wider">
                Soft Skills / Atouts
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {monikaData.skills.soft.map((skill, sIdx) => (
                  <span key={sIdx} className="px-2.5 py-1 rounded bg-black/40 border border-white/5 text-white/70 text-xs font-mono hover:border-[#00F5FF]/20 transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl space-y-2">
              <h4 className="text-xs font-mono uppercase text-[#00F5FF] tracking-wider">
                Loisirs / Interests
              </h4>
              <div className="space-y-1.5 text-xs">
                {monikaData.interests.map((interest, iIdx) => (
                  <p key={iIdx} className="text-white/70 leading-relaxed pl-2 border-l border-[#00F5FF]/50">
                    {interest}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-white/5 mt-4 flex items-center justify-between text-xs text-white/30 font-mono">
        <span>Updated: 2026</span>
        <span className="flex items-center gap-1 text-[#00F5FF]">
          <Sparkles size={11} className="animate-pulse" /> Highly Creative Profile
        </span>
      </div>
    </div>
  );
};

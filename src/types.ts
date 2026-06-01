export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isVoice?: boolean;
}

export interface MonikaProfile {
  name: string;
  title: string;
  contact: {
    phone: string;
    email: string;
    address: string;
    linkedin: string;
  };
  experience: Array<{
    period: string;
    company: string;
    role: string;
    details: string[];
  }>;
  education: Array<{
    period: string;
    institution: string;
    degree: string;
  }>;
  skills: {
    languages: Array<{ name: string; level: string }>;
    hard: string[];
    soft: string[];
  };
  interests: string[];
}

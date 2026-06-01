import { MonikaProfile } from '../types';

export const monikaData: MonikaProfile = {
  name: "Monika Michalski",
  title: "Marketing & Communication Manager",
  contact: {
    phone: "+33 7 82 70 23 10",
    email: "monika.michalski02@gmail.com",
    address: "Pantin, France",
    linkedin: "www.linkedin.com/in/monika-michalski"
  },
  experience: [
    {
      period: "2024- 2026",
      company: "ABERDEEN SERVICES",
      role: "Communication and Marketing Manager",
      details: [
        "Contributed to the definition and execution of the 2025–2027 marketing strategy, working independently, collaboratively, and cross-functionally with multiple business teams",
        "Produced and edited video content dedicated to change management, helping clarify key messages and support clients through internal transformation projects",
        "Supported brand development through the redesign and refinement of the brand platform, creation of editorial guidelines, and coordination of visual identity testing and implementation",
        "Managed relationships with Aberdeen Services' software partners, including Sage and Workday, by participating in joint marketing meetings and coordinating the follow-up and execution of agreed actions"
      ]
    },
    {
      period: "2021-2022",
      company: "MAISON BONNEFOY",
      role: "Sales Representative",
      details: [
        "Export and sale of fashion accessories (beanies, scarves, gloves) for the brand on the Berlin market",
        "Prospecting for clients in Berlin",
        "Conducting a market study on the city of Berlin",
        "Meeting prospects in the field"
      ]
    },
    {
      period: "Mai-Juillet 2021",
      company: "VALIANS INTERNATIONAL",
      role: "Sales and Marketing Assistant",
      details: [
        "Supporting the consulting team in market research",
        "Preparing reports and creating a database",
        "Translating documents / preparing and publishing a newsletter",
        "Supporting the sales team: information research, preparation of travel arrangements and commercial offers"
      ]
    }
  ],
  education: [
    {
      period: "2024-2026",
      institution: "ESCE",
      degree: "Master in International Consumer Marketing"
    },
    {
      period: "2023-2024",
      institution: "Sorbonne University",
      degree: "Master 1 in European Studies"
    },
    {
      period: "2022-2023",
      institution: "Sorbonne University",
      degree: "Bachelor’s Degree in International Studies"
    },
    {
      period: "2020-2022",
      institution: "Lycée Charles Péguy",
      degree: "BTS in International Trade"
    }
  ],
  skills: {
    languages: [
      { name: "Polish", level: "Native" },
      { name: "French", level: "Native" },
      { name: "English", level: "Professional level" },
      { name: "Spanish", level: "Professional level" }
    ],
    hard: [
      "Premiere Pro",
      "Da Vinci",
      "Cap Cut",
      "Adobe Photoshop",
      "Illustrator",
      "Project management",
      "Office 365",
      "Notion",
      "Trello"
    ],
    soft: [
      "Creativity",
      "Autonomy",
      "Storytelling",
      "Adaptability",
      "Perseverance",
      "Organization"
    ]
  },
  interests: [
    "Video editing and content creation: filming and editing vlogs for each trip, and producing videos for events",
    "Jazz dance (2009–2025), Conservatoire de Pantin – Certificate in Choreographic Studies (2020)",
    "Travel across Europe (Poland, Hungary, Slovenia, Czech Republic, Germany, Italy, Spain, England)"
  ]
};


export interface Social {
  label: 'Email' | 'LinkedIn' | 'GitHub';
  href: string;
  handle: string;
}

export interface Role {
  title: string;
  org: string;
  /** Human-readable period, e.g. "May 2026 – Aug 2026". */
  period: string;
  current: boolean;
  bullets: string[];
  metrics: Array<{ value: string; label: string }>;
}

export interface SkillGroup {
  name: string;
  items: string[];
}

export const profile = {
  name: 'Elias Antoun',
  title: 'Computer and Communications Engineer',
  positioning:
    'I build systems that turn engineering concepts into working prototypes — autonomous document-processing agents, ROS 2 navigation stacks, and computer-vision pipelines.',
  availability: 'Graduating 2027 · open to internships and new-grad roles',
  about:
    'I am a fourth-year Computer and Communications Engineering student at Notre Dame University – Louaize, holding a 4.0 GPA and Dean’s Honor List recognition every semester. My work spans AI and machine learning, robotics, and embedded hardware, and I care most about the part where a concept becomes something that measurably runs. Two 2026 internships took me from evolutionary prompt optimisation over invoice corpora to containerised ROS 2 navigation on real robots.',
} as const;

// Address parts are kept split; joined at render time by src/lib/email.ts
export const socials: Social[] = [
  { label: 'Email', href: '#contact', handle: 'eyantoun' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/eliasyantoun', handle: 'eliasyantoun' },
  { label: 'GitHub', href: 'https://github.com/elias-antoun', handle: 'elias-antoun' },
];

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
] as const;

export const stats = [
  { value: '4.0', label: 'GPA' },
  { value: '6×', label: "Dean's List" },
  { value: '2', label: 'Internships' },
] as const;

export const experience: Role[] = [
  {
    title: 'AI Engineer Intern',
    org: 'ANB / Layer10',
    period: 'May 2026 – Aug 2026',
    current: false,
    bullets: [
      'Replaced manual accounting workflows at a retail automotive group with autonomous document-processing agents handling 1,000 invoices per month.',
      'Raised document classification accuracy through evolutionary prompt optimisation on a 165-PDF labeled set.',
      'Developed knowledge graph embeddings and visual similarity models powering supplier resolution and product matching.',
      'Benchmarked agent harnesses on token cost and extraction accuracy, designing a leakage-controlled evaluation cohort via UMAP/HDBSCAN clustering.',
    ],
    metrics: [
      { value: '81.4% → 95.3%', label: 'classification accuracy' },
      { value: '90%', label: 'less manual review time' },
      { value: '12,375', label: 'documents clustered' },
    ],
  },
  {
    title: 'Robotics Intern',
    org: 'inmind.academy',
    period: 'Jun 2026 – Aug 2026',
    current: false,
    bullets: [
      'Built and containerised ROS 2 applications with CMake, Docker, and Docker Compose.',
      'Implemented SLAM, path planning, and computer vision pipelines for autonomous robot navigation.',
    ],
    metrics: [{ value: 'ROS 2', label: 'containerised navigation stack' }],
  },
];

export const universityRoles = [
  {
    title: 'Teaching and Lab Assistant',
    org: 'Notre Dame University – Louaize',
    period: 'Sept 2024 – present',
    summary:
      'Support students in circuit analysis, simulations, and hardware implementation. Authored VHDL simulation tutorials using Synopsys tools.',
  },
  {
    title: 'Technical Coordinator',
    org: 'IEEE NDU MC',
    period: 'Sept 2024 – present',
    summary:
      'Organise and coordinate technical workshops and engineering events for IEEE student members.',
  },
  {
    title: 'Private Tutor',
    org: 'Independent',
    period: 'Sept 2023 – present',
    summary: 'Tutor grade 9 to 12 and university students in mathematics, physics, and chemistry.',
  },
] as const;

export const education = {
  institution: 'Notre Dame University – Louaize',
  degree: 'BE in Computer and Communication Engineering',
  period: '2023 – 2027',
  highlights: [
    'Cumulative GPA 4.0 / 4.0',
    'Dean’s Honor List every semester, Fall 2023 – Spring 2026',
  ],
} as const;

export const certifications = [
  {
    name: 'IP Design Training Program',
    issuer: 'SiliconCedars / Synopsys',
    date: 'Aug 2025',
    detail:
      'IC fundamentals, fabrication, and packaging. Sequential circuits, counters, registers, and RAM/ROM design.',
  },
  {
    name: 'NetAcad Summer Camp',
    issuer: 'Cisco Networking Academy',
    date: 'Aug 2024',
    detail: 'Network Technician Career Path and Python Essentials.',
  },
] as const;

export const skillGroups: SkillGroup[] = [
  { name: 'Programming', items: ['Python', 'C++', 'C#', 'Bash', 'SQL'] },
  {
    name: 'AI / ML',
    items: [
      'Claude Agent SDK',
      'AWS Bedrock',
      'Neo4j',
      'RAG & embeddings',
      'UMAP/HDBSCAN',
      'PyTorch',
    ],
  },
  {
    name: 'Infrastructure',
    items: ['Docker', 'AWS (S3, SQS, Lambda)', 'Oracle', 'PostgreSQL', 'Grafana', 'Git'],
  },
  {
    name: 'Embedded & Hardware',
    items: ['Arduino', 'ESP32', 'NodeMCU', 'VHDL', 'MATLAB/Simulink', 'Cadence Virtuoso'],
  },
];

export const languages = [
  { name: 'English', level: 'C2' },
  { name: 'French', level: 'C1' },
  { name: 'Arabic', level: 'Native' },
] as const;

import { DebateTopicItem, TopicCategory } from '../types';

export const TOPIC_CATEGORIES: { id: TopicCategory; name: string; icon: string; description: string; color: string }[] = [
  {
    id: 'Technology',
    name: 'Technology & AI',
    icon: 'Cpu',
    description: 'Artificial intelligence, robotics, data privacy, and technological disruption',
    color: 'indigo'
  },
  {
    id: 'Ethics',
    name: 'Ethics & Morality',
    icon: 'Scale',
    description: 'Moral dilemmas, bioethics, algorithmic bias, and human responsibilities',
    color: 'emerald'
  },
  {
    id: 'Politics',
    name: 'Politics & Law',
    icon: 'Landmark',
    description: 'Democratic governance, international relations, censorship, and civil liberties',
    color: 'rose'
  },
  {
    id: 'Science',
    name: 'Science & Medicine',
    icon: 'Atom',
    description: 'Genetic editing, space exploration, vaccine mandates, and medical technology',
    color: 'cyan'
  },
  {
    id: 'Philosophy',
    name: 'Philosophy & Society',
    icon: 'BookOpen',
    description: 'Free will, existential risk, consciousness, and the nature of human purpose',
    color: 'amber'
  },
  {
    id: 'Economics',
    name: 'Economics & Labor',
    icon: 'TrendingUp',
    description: 'Universal basic income, globalization, market deregulation, and wealth caps',
    color: 'violet'
  },
  {
    id: 'Education',
    name: 'Education & Academics',
    icon: 'GraduationCap',
    description: 'Standardized testing, AI in homework, tuition-free college, and modern curricula',
    color: 'blue'
  },
  {
    id: 'Environment',
    name: 'Environment & Climate',
    icon: 'Leaf',
    description: 'Nuclear energy, carbon taxation, geoengineering, and conservation mandates',
    color: 'teal'
  }
];

export const CURATED_TOPICS: DebateTopicItem[] = [
  // Technology
  {
    id: 'tech-1',
    category: 'Technology',
    title: 'Should Artificial Intelligence replace human workers in automated industries?',
    description: 'Examines labor displacement, economic productivity, workforce retraining, and societal prosperity in the age of generative AI.',
    proSummary: 'Boosts productivity, eliminates dangerous tasks, and creates unprecedented technological abundance.',
    conSummary: 'Causes structural unemployment, deepens wealth inequality, and strips workers of agency and dignity.',
    popularCount: 142
  },
  {
    id: 'tech-2',
    category: 'Technology',
    title: 'Should social media algorithms be legally mandated to open-source their ranking logic?',
    description: 'Considers user radicalization, filter bubbles, corporate trade secrets, and systemic algorithmic transparency.',
    proSummary: 'Prevents psychological manipulation, protects democratic deliberation, and holds tech oligopolies accountable.',
    conSummary: 'Compromises proprietary IP, enables bad actors to game search results, and hampers rapid product innovation.',
    popularCount: 98
  },
  {
    id: 'tech-3',
    category: 'Technology',
    title: 'Is autonomous AI warfare morally justifiable if it reduces civilian casualties?',
    description: 'Debating algorithmically guided drones, machine precision, operational accountability, and lethal decisions without direct human empathy.',
    proSummary: 'Removes human error, fear, and fatigue from battlefield calculations, lowering collateral damage.',
    conSummary: 'Devalues human life by delegating kill commands to code and obscures legal war crime accountability.',
    popularCount: 76
  },
  {
    id: 'tech-4',
    category: 'Technology',
    title: 'Should developers of frontier AI models be held strictly liable for harmful outputs?',
    description: 'Evaluating corporate liability frameworks, downstream risks, open-source AI freedoms, and compliance burdens.',
    proSummary: 'Enforces necessary safety rigor, prevents reckless deployment of dangerous frontier systems, and internalizes externalities.',
    conSummary: 'Stifles open-source research, concentrates power exclusively in trillion-dollar incumbents, and misallocates fault.',
    popularCount: 115
  },

  // Ethics
  {
    id: 'eth-1',
    category: 'Ethics',
    title: 'Is universal digital surveillance ethical if it demonstrably eliminates violent crime?',
    description: 'Pits the classic utilitarian calculus of absolute physical safety against deontological rights to personal privacy and autonomy.',
    proSummary: 'Maximizes public safety, eradicates violent offenses, and creates an environment free from criminal terror.',
    conSummary: 'Destroys civil liberties, invites authoritarian totalitarian abuse, and treats all free citizens as preemptive suspects.',
    popularCount: 120
  },
  {
    id: 'eth-2',
    category: 'Ethics',
    title: 'Should human cloning and severe genetic modification of embryos be permanently banned?',
    description: 'Analyzes designer babies, eugenic stratification, medical cures, and biological equality.',
    proSummary: 'Prevents a dystopian genetic caste system, unforeseen hereditary mutations, and commodification of children.',
    conSummary: 'Could cure hundreds of incurable hereditary genetic diseases and enhance human longevity and disease immunity.',
    popularCount: 88
  },
  {
    id: 'eth-3',
    category: 'Ethics',
    title: 'Do sentient non-human animals have fundamental legal rights comparable to humans?',
    description: 'Exploring factory farming, moral status, animal personhood, and speciesism.',
    proSummary: 'Sentience and the capacity for suffering, not intellectual ability, should determine moral standing.',
    conSummary: 'Legal personhood entails reciprocal duties which animals cannot comprehend; human welfare must take priority.',
    popularCount: 64
  },

  // Politics
  {
    id: 'pol-1',
    category: 'Politics',
    title: 'Should democratic nations impose mandatory voting for all eligible citizens?',
    description: 'Balancing civic obligation, political extremism moderation, individual liberty to abstain, and civic engagement.',
    proSummary: 'Prevents fringe partisan capture, ensures true popular representation, and strengthens civic legitimacy.',
    conSummary: 'Compels speech against one\'s will, degrades debate quality with uninformed participation, and infringes free choice.',
    popularCount: 85
  },
  {
    id: 'pol-2',
    category: 'Politics',
    title: 'Should supreme court justices have strict term limits rather than lifetime tenure?',
    description: 'Assessing judicial independence, politicized confirmation hearings, generational turnover, and institutional stability.',
    proSummary: 'Depoliticizes vacancy battles, regularizes judicial appointments, and reflects changing democratic consensus.',
    conSummary: 'Risks turning the judiciary into a short-term partisan branch and undermines constitutional stability and precedent.',
    popularCount: 94
  },
  {
    id: 'pol-3',
    category: 'Politics',
    title: 'Is aggressive online political disinformation protected under unconditional freedom of speech?',
    description: 'The tension between state speech regulation, state censorship risks, and weaponized foreign election interference.',
    proSummary: 'Government should never be the arbiter of acceptable truth, as censorship tools are inevitably weaponized against dissidents.',
    conSummary: 'Coordinated falsehoods erode the democratic fabric, incite physical violence, and nullify genuine informed consent.',
    popularCount: 110
  },

  // Science
  {
    id: 'sci-1',
    category: 'Science',
    title: 'Should nations prioritize space colonization over addressing Earth\'s crises?',
    description: 'Contrasting planetary existential hedge vs immediate poverty and climate mitigation needs.',
    proSummary: 'Guarantees species survival against catastrophic extinction events and drives leapfrog technological spinoffs.',
    conSummary: 'Earth is our only viable cradle; redirecting hundreds of billions away from imminent ecological collapse is reckless.',
    popularCount: 104
  },
  {
    id: 'sci-2',
    category: 'Science',
    title: 'Should solar radiation geoengineering be deployed to combat runaway global warming?',
    description: 'Evaluating sulfur aerosol injection, geopolitical termination shock, monsoon disruption, and emergency cooling.',
    proSummary: 'Provides an immediate emergency lever to prevent catastrophic feedback loops while renewables scale up.',
    conSummary: 'Presents moral hazard reducing emission urgency, unpredictable weather disruption, and perilous geopolitical strife.',
    popularCount: 79
  },

  // Philosophy
  {
    id: 'phil-1',
    category: 'Philosophy',
    title: 'Does human free will exist, or are all decisions strictly deterministic?',
    description: 'Diving into neurobiology, determinism, moral accountability, criminal justice, and subjective agency.',
    proSummary: 'Conscious deliberative veto, moral agency, and genuine intentional choices demonstrate meaningful free will.',
    conSummary: 'Every brain state is a direct consequence of antecedent physical causes, genetics, and environment.',
    popularCount: 130
  },
  {
    id: 'phil-2',
    category: 'Philosophy',
    title: 'Is utilitarianism the most coherent moral framework for governing society?',
    description: 'Greatest good for the greatest number vs inviolable rights of minority individuals.',
    proSummary: 'Provides an objective, measurable, and empathetic standard to reduce aggregate suffering and elevate wellbeing.',
    conSummary: 'Legitimizes sacrificing innocent individuals or minorities whenever it mathematically benefits the majority.',
    popularCount: 71
  },

  // Economics
  {
    id: 'econ-1',
    category: 'Economics',
    title: 'Should governments implement a universal basic income (UBI) funded by automation taxes?',
    description: 'Addressing structural unemployment, poverty floor, entrepreneurial risk-taking, inflation, and work incentives.',
    proSummary: 'Eliminates extreme poverty, gives workers bargaining power, and circulates consumer demand in automated economies.',
    conSummary: 'Massive fiscal expense, risks disincentivizing productive labor, and could provoke crippling inflationary spirals.',
    popularCount: 156
  },
  {
    id: 'econ-2',
    category: 'Economics',
    title: 'Should maximum wealth caps (100% tax above a threshold) be established to curb billionaire dominance?',
    description: 'Examining oligarchy, investment capital allocation, economic fairness, and capital flight.',
    proSummary: 'Curtails toxic concentration of political power, redistributes civic resources, and combats systemic inequality.',
    conSummary: 'Penalizes visionary wealth creation, drives capital overseas, and damages innovation incentives and risk-taking.',
    popularCount: 89
  },

  // Education
  {
    id: 'edu-1',
    category: 'Education',
    title: 'Should student use of AI tools like ChatGPT be embraced rather than banned in academic curricula?',
    description: 'Cognitive offloading, AI literacy, academic integrity, critical synthesis, and the future of pedagogy.',
    proSummary: 'Prepares students for an AI-augmented workforce, acts as a 24/7 personalized tutor, and elevates higher-order thinking.',
    conSummary: 'Atrophies foundational writing and logic capabilities, encourages widespread cheating, and dilutes genuine scholarship.',
    popularCount: 167
  },
  {
    id: 'edu-2',
    category: 'Education',
    title: 'Should higher education be tuition-free and funded through universal taxation?',
    description: 'Social mobility, student debt burden, credential inflation, and equitable public financing.',
    proSummary: 'Removes barriers to meritocracy, prevents crippling debt, and drives a highly educated, resilient economy.',
    conSummary: 'Disproportionately subsidizes higher-earning degree holders with working-class taxes and lowers institutional competition.',
    popularCount: 92
  },

  // Environment
  {
    id: 'env-1',
    category: 'Environment',
    title: 'Is nuclear power essential to achieving carbon-neutral energy grids?',
    description: 'Baseload reliability, nuclear waste safety, construction cost speed, versus 100% wind/solar/battery paths.',
    proSummary: 'Delivers reliable, high-density, 24/7 zero-emission baseload power with the smallest land footprint of any energy source.',
    conSummary: 'Extremely slow and expensive to build, presents catastrophic risk vulnerabilities, and leaves unsolved toxic waste.',
    popularCount: 125
  },
  {
    id: 'env-2',
    category: 'Environment',
    title: 'Should individual carbon quotas be instituted to hold high-consuming citizens accountable?',
    description: 'Personal lifestyle responsibility vs systemic fossil fuel supply accountability and intrusive monitoring.',
    proSummary: 'Forces high-emission lifestyles to pay for their environmental toll and drives immediate personal conservation.',
    conSummary: 'Shifts blame from corporate fossil polluters onto citizens and creates a coercive bureaucratic surveillance state.',
    popularCount: 68
  }
];

export const DEBATE_PHASES = [
  { round: 1, name: 'Opening Statement', description: 'Establish foundational definitions, key framework, and primary resolution arguments.' },
  { round: 2, name: 'Main Argument', description: 'Deepen core arguments with causal mechanisms, historical precedents, and empirical warrants.' },
  { round: 3, name: 'Rebuttal', description: 'Directly address and dismantle the opponent\'s key contentions and exposed contradictions.' },
  { round: 4, name: 'Counterargument', description: 'Introduce alternative frameworks, comparative trade-offs, and address defensive burdens.' },
  { round: 5, name: 'Closing Statement', description: 'Summarize the overarching narrative, emphasize unaddressed burdens of proof, and crystallize final appeals.' }
];

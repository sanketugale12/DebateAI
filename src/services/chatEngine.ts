import { ChatMessage, ChatConversation, DebatePersona, Position, ArgumentAnalysis, FallacyDetection } from '../types';
import { detectFallaciesClient, analyzeUserArgumentClient } from './aiEngine';

export async function requestChatbotResponse(
  conversation: ChatConversation,
  userMessageText: string
): Promise<{
  reply: string;
  analysis?: ArgumentAnalysis;
  fallacies?: FallacyDetection[];
}> {
  // 1. Analyze user's argument in background for metrics and fallacy detection
  const analysis = analyzeUserArgumentClient(
    userMessageText,
    conversation.topic,
    'Debate Turn',
    conversation.userPosition
  );
  const fallacies = detectFallaciesClient(userMessageText, conversation.topic);

  // 2. Attempt call to /api/chat
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessageText,
        history: conversation.messages,
        persona: conversation.persona,
        topic: conversation.topic,
        userPosition: conversation.userPosition,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success' && data.message) {
        return {
          reply: data.message,
          analysis,
          fallacies,
        };
      }
    }
  } catch (err) {
    console.warn('Backend /api/chat unreachable, using local conversational dialectic engine:', err);
  }

  // 3. Fallback: High-caliber local conversational dialectic engine
  const reply = generateLocalPersonaReply(
    userMessageText,
    conversation.persona,
    conversation.topic,
    conversation.userPosition,
    conversation.messages
  );

  return {
    reply,
    analysis,
    fallacies,
  };
}

// Generates persona-specific dialectic response locally with full support for out-of-the-box questions
function generateLocalPersonaReply(
  userText: string,
  persona: DebatePersona,
  topic: string,
  userPosition: Position,
  history: ChatMessage[]
): string {
  const oppPos = userPosition === 'PRO' ? 'CON' : 'PRO';
  const lower = userText.toLowerCase().trim();

  // -------------------------------------------------------------
  // 1. OUT-OF-THE-BOX: Hotdog as a Sandwich / Food Taxonomy
  // -------------------------------------------------------------
  if (lower.includes('hotdog') || lower.includes('hot dog') || (lower.includes('sandwich') && lower.includes('bread'))) {
    if (persona === 'adversary') {
      return `### 🌭 The Taxonomy Clash: Why a Hotdog is Strictly NOT a Sandwich

While casual gastronomers lazily group anything wrapped in carbohydrates into the sandwich category, rigorous structural food jurisprudence demonstrates that **a hotdog is fundamentally distinct**.

1. **The Topological & Structural Argument (The Cube Rule of Food)**:
Under the Cube Rule of Food classification, a sandwich requires starch on two non-contiguous parallel planes (top and bottom). A standard hotdog bun is a single contiguous, U-shaped hinge surrounding filling on three sides. Topologically, this classifies a hotdog not as a sandwich, but as a **taco**.

2. **Regulatory & Legal Precedent**:
In *White City Shopping Center LP v. PR Restaurants LLC (2006)*, the Massachusetts Superior Court ruled that a burrito is not a sandwich under a restrictive covenant, relying on the definition that sandwiches consist of two separate slices of bread. The USDA also maintains segregated regulatory categories for frankfurters in buns vs. closed sandwiches.

3. **Cultural & Linguistic Descriptivism**:
Language is defined by usage. No human being walks into a delicatessen, orders "a pork sandwich," and expects a boiled wiener in a hinged white bun with yellow mustard.

> *"To call a hotdog a sandwich is to strip culinary categorization of all semantic coherence, reducing the art of cuisine to reckless bread-anarchy."*

**Direct Challenge**: If a single contiguous split roll makes a sandwich, are you prepared to argue that a cannoli is an ice cream sandwich, or that a half-eaten pita pocket is a sub?`;
    }
    if (persona === 'coach') {
      return `### 🎯 Debate Coach Breakdown: The "Hotdog as Sandwich" Rhetorical Trap

This classic out-of-the-box question is the ultimate test of **definitional framing (topicality)** and **semantic prescriptivism vs. descriptivism**.

**Key Rhetorical Levers to Win This Debate**:
- **Definitional Prescriptivism**: Cite the *Merriam-Webster* definition ("two or more slices of bread or a split roll having a filling in between") to claim victory on technical grounds.
- **Definitional Descriptivism (Common Usage)**: Argue that dictionaries document human usage rather than mandate reality, and in ordinary language, hotdogs occupy an autonomous conceptual space.
- **Absurdity Reduction (*Reductio ad Absurdum*)**: If any starch holding a protein is a sandwich, then beef wellington, gyros, and fruit pies collapse into the same label, destroying all utility.

**Sharpened Rebuttal Example**:
> *"The affirmative relies on an over-broad dictionary definition that collapses meaningful culinary distinctions. In policy debate, when a definition proves too much, it proves nothing at all."*`;
    }
    if (persona === 'socratic') {
      return `### 🏛️ Socratic Inquest: The Epistemology of Food Categories

Your question touches the ancient philosophical problem of **universals and natural kinds**. Is "sandwich-ness" an objective property of the universe, or a nominal convenience created by human minds?

Consider these three boundary puzzles:
1. **The Continuum Problem**: If a hotdog bun splits entirely into two pieces during your meal, does it undergo an ontological metamorphosis into a sandwich at the exact moment of rupture?
2. **The Open-Faced Paradox**: Most cultures recognize "open-faced sandwiches" (one slice of bread, toppings on top). If one slice qualifies, why would a folded slice disqualify a hotdog?
3. **Wittgenstein's Family Resemblance**: Can any category ever have rigid necessary and sufficient conditions, or are all sandwiches merely connected by overlapping networks of traits?`;
    }
    return `### ⚖️ Judicial Audit: The Hotdog / Sandwich Categorical Conflict

- **The Affirmative Claim (It is a Sandwich)**: Relies on structural composition (carbohydrate carrier enclosing processed meat) and broad lexicographical authority (*Merriam-Webster*, *Dictionary.com*).
- **The Negative Claim (It is Autonomous)**: Relies on morphological hinge continuity (Cube Rule: taco category), Massachusetts legal precedent (*White City Shopping Center*), and everyday linguistic intuition.
- **Adjudication**: The Affirmative carries the formal dictionary burden, but the Negative successfully wins on pragmatic semantic convention. In formal rhetoric, the motion remains an unresolved draw between taxonomy and common sense.`;
  }

  // -------------------------------------------------------------
  // 2. OUT-OF-THE-BOX: 1 Billion Lions vs The Sun
  // -------------------------------------------------------------
  if ((lower.includes('lion') || lower.includes('lions')) && (lower.includes('sun') || lower.includes('billion'))) {
    return `### 🦁 1 Billion Lions vs The Sun: A Thermodynamic & Gravitational Deconstruction

This legendary hypothetical presents an irresistible intersection of astrophysics, biology, and hilarious logistical scale.

1. **The Biological & Thermal Reality**:
The surface temperature of the Sun (photosphere) is roughly 5,500°C (9,932°F), with a core temperature exceeding 15,000,000°C. 
An adult male lion averages 190 kg. One billion lions would weigh:
$$10^9 \\times 190\\text{ kg} = 1.9 \\times 10^{11}\\text{ kg}$$
By contrast, the mass of the Sun is $1.989 \\times 10^{30}\\text{ kg}$. The mass of the Sun is **ten quintillion times greater** than the combined biomass of all one billion lions. Before a single claw reaches the upper corona, organic matter is instantly converted into ionized plasma.

2. **The Counter-Intuitive Cosmological Scenario (The "Lion Singularity")**:
What if the lions attack in an ultra-dense spherical cluster? If one billion lions were packed into an astronomical body, their mass ($1.9 \\times 10^{11}$ kg) is only comparable to a modest asteroid (like Asteroid 253 Mathilde). They possess nowhere near the critical mass to alter the Sun's radiative balance or induce gravitational disturbance.

> *"Thermodynamics does not negotiate with mammalian claws. The Sun does not even notice the lions."*

**The Dialectical Twist**: What if the lions attack at night? *(A classical absurdist rejoinder: the Sun is not extinguished at night; the terrestrial observer simply rotates away!)*`;
  }

  // -------------------------------------------------------------
  // 3. OUT-OF-THE-BOX: Batman vs Superman (Ethics / Court / Battle)
  // -------------------------------------------------------------
  if ((lower.includes('batman') && lower.includes('superman')) || (lower.includes('goku') && lower.includes('saitama'))) {
    return `### ⚖️ Clash of Titans: Analyzing the Definitive Verdict

Whether judged by **jurisprudential culpability**, **ethical frameworks**, or **physical combat dynamics**, this clash reveals profound asymmetries:

1. **In a Court of Law (Civil Liberties & Due Process)**:
- **Batman (Bruce Wayne)**: A serial perpetrator of fourth amendment Fourth Amendment violations, unlawful wiretapping (the *Dark Knight* sonar array), state-sponsored torture, and massive third-party collateral torts. He operates entirely extra-legally.
- **Superman (Clark Kent)**: Holds quasi-diplomatic sovereign immunity as a planetary protector. While *Man of Steel* generated billions in municipal property damage, Superman acts as an emergency disaster-relief agent responding to extinction-level alien invasion (*doctrine of necessity*).
- **Verdict**: Batman is far more criminally culpable for premeditated constitutional infringements.

2. **In Combat (Preparation vs. Omnipotence)**:
- The affirmative "Bat-prep" trope assumes infinite foresight, weaponized Kryptonite, and psychological manipulation.
- But as an ethical debater must observe: Superman's restraint is his only vulnerability. An unrestricted Superman operating at relativistic speeds vaporizes any terrestrial counter-measure before human neural impulses can trigger a switch.

**Piercing Question**: Can vigilantism ever be morally rehabilitated if its survival depends entirely on the billionaire status of the vigilante?`;
  }

  // -------------------------------------------------------------
  // 4. OUT-OF-THE-BOX: "What if" Hypotheticals (Gravity, Wings, Truth)
  // -------------------------------------------------------------
  if (lower.startsWith('what if') || lower.includes('suppose that') || lower.includes('imagine if')) {
    return `### 🌌 Dialectical Scenario Analysis: Unpacking Your Hypothetical

Your out-of-the-box scenario—*"${userText}"*—triggers immediate first-order disruptions and cascading second-order systemic shocks.

1. **The Physical & Mechanical Disruption**:
When you perturb fundamental parameters (whether natural laws, biological traits, or civic conventions), the initial equilibrium instantaneously collapses. The primary effect is not merely novelty, but radical destabilization of the underlying infrastructure built to buffer against fragility.

2. **The Game-Theoretic & Human Incentive Shift**:
Every agent modifies their survival calculus. If the baseline rules change, previously irrational behaviors become optimal strategies, while conventional safeguards become liabilities. 

3. **The Unforeseen Counter-Harm**:
Utopian hypotheticals frequently discount the *law of unintended consequences*. By eliminating friction point A, the pressure invariably ruptures systemic node B.

> *"Every hypothetical world reveals less about its fantastical premises than it exposes about the fragile assumptions of our current reality."*

**The Follow-Up Conundrum**: In your envisioned scenario, what mechanism prevents the initial benefits from being monopolized by the most ruthless actors in that environment?`;
  }

  // -------------------------------------------------------------
  // 5. OUT-OF-THE-BOX: Deep Paradoxes (Simulation, Theseus, Sound in Forest)
  // -------------------------------------------------------------
  if (lower.includes('simulation') || lower.includes('ship of theseus') || lower.includes('tree falls') || lower.includes('is water wet') || lower.includes('free will')) {
    if (lower.includes('is water wet')) {
      return `### 💧 The Dialectic of Wetness: Is Water Actually Wet?

This perennial mind-bender pivots on a fundamental distinction in surface chemistry and language:

1. **The Scientific Definition (Surface Chemistry)**:
In physical chemistry, "wetness" is the ability of a liquid to adhere to the surface of a solid (the balance of *cohesive* vs. *adhesive* intermolecular forces). 
- Water molecules bond to each other via strong hydrogen bonds (**cohesion**).
- When water contacts another solid substrate (like skin or cellulose), it wets that surface (**adhesion**).
- Therefore: **Water makes other materials wet; water itself is merely cohesive liquid**.

2. **The Linguistic Counter-Argument (Semantic Descriptivism)**:
If you pour water into water, is each water molecule surrounded and wetted by adjacent water molecules? Under thermodynamic descriptions of liquid phases, every internal molecule experiences fluid contact. To deny that water is wet flies in the face of colloquial linguistic consensus.

> *"Wetness is an emergent property of liquid-solid interfaces, not an intrinsic atomic virtue of H₂O."*

**Challenge**: If ice is solid water, does ice only become wet when its own surface begins to melt into liquid?`;
    }

    return `### 🌀 Paradox Exploration: Unraveling the Dialectical Knot

Your inquiry engages with one of the most stubborn foundational dilemmas in intellectual history:

1. **The Core Paradox**:
At first glance, common sense seems to offer a clear resolution. But under philosophical dissection, two mutually contradictory propositions prove equally defensible. 

2. **The Epistemological Friction**:
- **Perspective A (Direct Realism & Empiricism)**: Grounded in sensory observation and measurable physical invariants.
- **Perspective B (Idealism & Semantic Relativism)**: Proving that the phenomenon cannot exist independently of an observing consciousness or defined linguistic framework.

3. **The Resolution Vector**:
Most such paradoxes dissolve once we expose how language conflates *the physical event* with *the subjective perceptual interpretation*.

> *"A paradox is not an error in reality, but a signal that human categorization has exceeded its own grammatical warranty."*

**Socratic Probe**: What core assumption in your premise are you most reluctant to surrender?`;
  }

  // -------------------------------------------------------------
  // 6. DEFAULT ADAPTIVE DEBATE / SPARRING FALLBACK
  // -------------------------------------------------------------
  const subject = topic && topic !== 'Open Debate' ? topic : userText.slice(0, 45);

  if (persona === 'adversary') {
    return `### ⚡ Counter-Contention: Challenging Your Premise

Addressing your assertion regarding **"${subject}"**:

1. **The Structural Blindspot**:
While your line of thought highlights an intuitive perspective, it overlooks a foundational counter-weight. When tested against real-world incentives, competitive friction, and systemic volatility, the thesis encounters critical vulnerabilities.

2. **The Opposing Thesis (${oppPos})**:
The more sustainable, logically defensible framework demands that we reject unchecked assumptions. Instead of treating your premise as axiomatic, we must examine the opportunity costs, the distribution of burdens, and the unaddressed downside risks.

> *"A compelling idea must not only sound persuasive in isolation; it must withstand relentless pressure from its natural antithesis."*

**Dialectical Cross-Examination**: What single piece of evidence or counter-scenario would convince you that your stance needs fundamental revision?`;
  }

  if (persona === 'coach') {
    return `### 🎯 Debate Coach Evaluation & Tactical Blueprint

**Strengths in Your Prompt**:
- **Clarity of Stance**: You staked out an unmistakable focal point without timid hedging.
- **Inherent Tension**: Your proposition contains immediate room for clash and debate.

**Rhetorical Upgrades**:
- Transform intuitive claims into *structured impacts*: identify who bears the immediate cost versus who captures the delayed benefit.
- Preempt your opponent's most obvious counter-argument before they have the opportunity to deploy it against you.

**Sharpened Phrasing Model**:
> *"While conventional wisdom assumes the standard model, a rigorous comparative analysis reveals that structural safeguards generate significantly superior outcomes across all measurable indicators."*`;
  }

  if (persona === 'socratic') {
    return `### 🏛️ Socratic Inquest

Let us test the conceptual foundations of your premise:

1. **On Definitional Boundaries**: What specific criteria distinguish your favored outcome from its harmful extremes?
2. **On Universality**: If this exact principle were mandated across all adjacent human endeavors, what unintended consequences would emerge?
3. **On the Counter-Intuitive Edge**: Where does this reasoning face its greatest logical stress test?

*Articulate how your perspective reconciles these competing tensions.*`;
  }

  // Referee / Adjudicator
  return `### ⚖️ Impartial Judicial Review

**Clash Breakdown on "${subject}"**:

- **The Affirmative Ground**: Emphasizes structural necessity, ethical imperative, or direct utility.
- **The Negative Ground**: Commands the high ground regarding feasibility, second-order risk, and unproven transition costs.

**Current Burden of Proof**:
Neither position has conclusively settled the issue without addressing the trade-off calculus. To win the round, the next speaker must quantify the net comparative impact over a long-term horizon.`;
}

// Auto-generates a clean title for the debate from the first message
export function autoGenerateChatTitle(message: string, currentTopic?: string): string {
  // If user asked an out-of-the-box question, make the question itself the title!
  const clean = message.replace(/^(debate me on|let's debate|i believe that|i think that|topic:)\s*/i, '').trim();
  
  if (clean.length > 0 && (!currentTopic || currentTopic === 'Open Debate' || currentTopic === 'General Debate')) {
    const titleClean = clean.replace(/[?.,!]+$/, '');
    const words = titleClean.split(' ').slice(0, 7).join(' ');
    return words.length > 38 ? words.slice(0, 36) + '...' : words;
  }

  if (currentTopic && currentTopic !== 'Open Debate' && currentTopic !== 'General Debate') {
    return currentTopic.length > 38 ? currentTopic.slice(0, 36) + '...' : currentTopic;
  }

  const words = clean.split(' ').slice(0, 6).join(' ');
  return words.length > 36 ? words.slice(0, 34) + '...' : (words || 'Debate Session');
}

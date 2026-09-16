import { 
  DebateSession, 
  DebateMessage, 
  ArgumentAnalysis, 
  FallacyDetection, 
  DebateResult, 
  CategoryScores 
} from '../types';

// Detects fallacies using logical patterns and heuristics or LLM
export function detectFallaciesClient(
  userArgument: string, 
  topic: string, 
  opponentLastMsg?: string
): FallacyDetection[] {
  const fallacies: FallacyDetection[] = [];
  const text = userArgument.toLowerCase();

  // 1. Ad Hominem
  if (
    text.includes('stupid') || 
    text.includes('idiot') || 
    text.includes('moron') || 
    text.includes('clueless') || 
    text.includes('you are just biased') ||
    text.includes('you obviously don\'t understand') ||
    text.includes('corrupt person')
  ) {
    fallacies.push({
      id: `fal_${Date.now()}_1`,
      messageId: '',
      fallacyType: 'Ad Hominem',
      explanation: 'The argument directs criticism against the opponent\'s character, competence, or alleged bias rather than dismantling the substantive claim.',
      suggestion: 'Remove personal labels and focus strictly on disproving the opponent\'s factual premises and causal logic.'
    });
  }

  // 2. Straw Man
  if (
    text.includes('so you are saying we should just kill') || 
    text.includes('you want to destroy all') || 
    text.includes('you think humans are worthless') || 
    text.includes('you want complete anarchy') ||
    text.includes('you claim that everything is fine')
  ) {
    fallacies.push({
      id: `fal_${Date.now()}_2`,
      messageId: '',
      fallacyType: 'Straw Man',
      explanation: 'The argument reframes the opponent\'s position into an exaggerated, radicalized, or distorted version that is easier to attack.',
      suggestion: 'Address the opponent\'s nuanced position directly instead of attacking an extreme caricature.'
    });
  }

  // 3. False Dilemma (Either/Or)
  if (
    (text.includes('either we') && text.includes('or we')) || 
    text.includes('there are only two options') || 
    text.includes('you are either with us or against us') ||
    text.includes('if we don\'t do this, total disaster is the only alternative')
  ) {
    fallacies.push({
      id: `fal_${Date.now()}_3`,
      messageId: '',
      fallacyType: 'False Dilemma',
      explanation: 'The contention artificially constrains the problem to a stark binary choice, ignoring hybrid solutions, middle paths, or multi-faceted policy alternatives.',
      suggestion: 'Acknowledge intermediate gradations, regulatory balances, and phased implementations rather than presenting an all-or-nothing dichotomy.'
    });
  }

  // 4. Slippery Slope
  if (
    text.includes('will inevitably lead to the total collapse') || 
    text.includes('next thing you know, society will crumble') || 
    text.includes('will open the floodgates to complete') ||
    text.includes('will end civilization as we know it')
  ) {
    fallacies.push({
      id: `fal_${Date.now()}_4`,
      messageId: '',
      fallacyType: 'Slippery Slope',
      explanation: 'Asserts without evidentiary warrant that taking an initial incremental step will trigger an uncontrollable chain of catastrophic disasters.',
      suggestion: 'Demonstrate each specific causal link in the chain or discuss risk probability with historical precedents instead of assuming inevitable catastrophe.'
    });
  }

  // 5. Appeal to Emotion
  if (
    text.includes('think of the suffering children') || 
    text.includes('how can anyone have a heart and disagree') || 
    text.includes('it is pure cruelty and malice') ||
    text.includes('anyone with a soul would see')
  ) {
    fallacies.push({
      id: `fal_${Date.now()}_5`,
      messageId: '',
      fallacyType: 'Appeal to Emotion',
      explanation: 'Substitutes evocative emotional appeals and visceral moral outrage for empirical evidence and logical justification.',
      suggestion: 'Anchor ethical considerations to verifiable human impacts, statistical welfare metrics, and constitutional principles rather than purely emotional rhetoric.'
    });
  }

  // 6. Circular Reasoning (Begging the Question)
  if (
    text.includes('because it is true') ||
    text.includes('obviously right because everyone knows it is right') ||
    text.includes('it is wrong simply because it is unethical')
  ) {
    fallacies.push({
      id: `fal_${Date.now()}_6`,
      messageId: '',
      fallacyType: 'Circular Reasoning',
      explanation: 'The conclusion is presupposed within the premise itself, failing to provide independent evidentiary justification.',
      suggestion: 'Establish independent external evidence or foundational principles that validate your claim without assuming its truth.'
    });
  }

  // 7. Hasty Generalization
  if (
    text.includes('everyone does this') || 
    text.includes('no one ever') || 
    text.includes('every single time') ||
    text.includes('i saw one person and that proves all of them')
  ) {
    fallacies.push({
      id: `fal_${Date.now()}_7`,
      messageId: '',
      fallacyType: 'Hasty Generalization',
      explanation: 'Draws an absolute, sweeping conclusion about an entire population or system based on limited anecdotal instances.',
      suggestion: 'Qualify universal claims with words like "frequently", "substantial evidence suggests", and cite systemic statistical data.'
    });
  }

  return fallacies;
}

// Analyzes user argument across standard debate categories
export function analyzeUserArgumentClient(
  userArgument: string,
  topic: string,
  phaseName: string,
  userPosition: 'PRO' | 'CON',
  opponentLastMsg?: string
): ArgumentAnalysis {
  const words = userArgument.trim().split(/\s+/).length;
  const lower = userArgument.toLowerCase();

  // Metrics heuristics based on argument composition
  let logic = 7;
  let evidence = 6;
  let relevance = 8;
  let clarity = 7;
  let persuasiveness = 7;
  let rebuttal = 6;

  const isQuestion = userArgument.trim().endsWith('?') || 
    lower.startsWith('what if') || 
    lower.startsWith('is a ') || 
    lower.startsWith('is ') || 
    lower.startsWith('who would') || 
    lower.startsWith('why do') || 
    lower.startsWith('why ') || 
    lower.startsWith('can you') ||
    lower.startsWith('how do') ||
    lower.startsWith('how ') ||
    lower.startsWith('suppose') ||
    lower.startsWith('tell me') ||
    lower.startsWith('explain');

  if (isQuestion) {
    logic = 8;
    clarity = 9;
    persuasiveness = 8;
    relevance = 9;
    evidence = 7;
    rebuttal = 7;
  } else {
    // Length and structure evaluation for declarative arguments
    if (words > 80) {
      logic += 1;
      clarity += 1;
      persuasiveness += 1;
    }
    if (words < 25) {
      logic -= 2;
      evidence -= 2;
      persuasiveness -= 2;
      clarity -= 1;
    }
  }

  // Evidence checks
  const evidenceKeywords = ['study', 'data', 'percent', '%', 'historical', 'research', 'report', 'demonstrated', 'example', 'instance', 'economic', 'precedent'];
  const hasEvidence = evidenceKeywords.some(k => lower.includes(k));
  if (hasEvidence) evidence = Math.min(10, evidence + 2);
  else evidence = Math.max(3, evidence - 1);

  // Logical connectors
  const logicKeywords = ['therefore', 'because', 'consequently', 'furthermore', 'mechanisms', 'leads to', 'warrant', 'if', 'whereas'];
  const hasLogic = logicKeywords.some(k => lower.includes(k));
  if (hasLogic) logic = Math.min(10, logic + 1);

  // Relevance to topic
  const topicTokens = topic.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(t => t.length > 4);
  const hits = topicTokens.filter(t => lower.includes(t)).length;
  if (hits >= 2) relevance = Math.min(10, relevance + 2);
  else if (hits === 0 && words > 20) relevance = Math.max(4, relevance - 2);

  // Rebuttal checks if opponent spoke
  if (opponentLastMsg) {
    const rebuttalKeywords = ['opponent', 'claim', 'contention', 'however', 'contrary', 'flaw', 'fails to account', 'refute', 'challenge', 'incorrect'];
    const hasRebuttal = rebuttalKeywords.some(k => lower.includes(k));
    if (hasRebuttal) rebuttal = Math.min(10, rebuttal + 2);
    else rebuttal = Math.max(4, rebuttal - 1);
  }

  const overall = Math.round(((logic + evidence + relevance + clarity + persuasiveness + rebuttal) / 6) * 10) / 10;

  // Synthesize strength, weakness, suggestion
  let strength = 'Presents a coherent position directly aligned with your stated motion.';
  if (hasEvidence) {
    strength = 'Effective deployment of evidentiary indicators and concrete contextual framing.';
  } else if (hasLogic) {
    strength = 'Clear causal chain articulating how the premise connects to the broader outcome.';
  }

  let weakness = 'Lacks empirical grounding or quantitative metrics to reinforce the theoretical claim.';
  if (words < 30) {
    weakness = 'The argument is too brief to adequately substantiate its core warrants.';
  } else if (!hasEvidence) {
    weakness = 'Relies predominantly on normative assertions rather than verifiable empirical precedents.';
  } else if (opponentLastMsg && rebuttal < 6) {
    weakness = 'Does not directly address the central challenge raised in the opponent\'s previous contention.';
  }

  let suggestion = 'Integrate a specific real-world case study or measurable economic metric to validate the impact.';
  if (opponentLastMsg && rebuttal < 6) {
    suggestion = 'Directly reference the opponent\'s specific premise and explain why their causal chain breaks down.';
  } else if (evidence < 6) {
    suggestion = 'Cite a peer-reviewed finding, constitutional clause, or historical parallel to reinforce credibility.';
  }

  return {
    id: `ana_${Date.now()}`,
    messageId: '',
    logicScore: Math.min(10, Math.max(1, logic)),
    evidenceScore: Math.min(10, Math.max(1, evidence)),
    relevanceScore: Math.min(10, Math.max(1, relevance)),
    clarityScore: Math.min(10, Math.max(1, clarity)),
    persuasivenessScore: Math.min(10, Math.max(1, persuasiveness)),
    rebuttalScore: Math.min(10, Math.max(1, rebuttal)),
    overallScore: overall,
    strength,
    weakness,
    suggestion
  };
}

// Generates intelligent AI debater response
export function generateAIDebaterResponseClient(
  session: DebateSession,
  history: DebateMessage[],
  userArgument: string
): { message: string; phaseName: string } {
  const round = session.currentRound;
  const phase = session.currentPhase;
  const diff = session.difficulty;
  const aiPos = session.aiPosition;
  const userPos = session.userPosition;
  const topic = session.topic;

  // Tailored responses based on phase, topic, and difficulty
  if (round === 1 || phase === 'Opening Statement') {
    if (diff === 'Beginner') {
      return {
        phaseName: 'Opening Statement',
        message: `Thank you for the opening remarks. As the opposition advocating for the ${aiPos} position on "${topic}", I must respectfully challenge your premise.\n\nWhile your point sounds appealing on the surface, it overlooks fundamental trade-offs. If we adopt your stance, the unintended consequences on regular individuals and system stability will be severe.\n\nMy central contention is that sustainable progress requires stability, accountability, and ethical safeguards. How do you propose to protect vulnerable groups if your proposed model fails to deliver as expected?`
      };
    } else if (diff === 'Intermediate') {
      return {
        phaseName: 'Opening Statement',
        message: `I appreciate the affirmative framing; however, representing the ${aiPos} position, I must establish a contrary foundational paradigm.\n\nThe user's opening assumes a seamless equilibrium that rarely exists in real-world governance. When evaluating "${topic}", historical precedent demonstrates that structural dislocations cannot be dismissed as mere transitional frictions. Our burden in this debate is to weigh tangible empirical costs against speculative long-term promises.\n\nSpecifically, by prioritizing this approach, we risk centralizing unaccountable authority and eroding proven institutional safety nets. What empirical proof guarantees your model will not exacerbate existing systemic disparities?`
      };
    } else {
      return {
        phaseName: 'Opening Statement',
        message: `To adjudicate "${topic}", we must first interrogate the unexamined epistemological and systemic premises undergirding the ${userPos} position.\n\nThe opponent's opening conflates theoretical utility with empirical feasibility. On the ${aiPos} side, we establish three decisive pillars: First, the acute principal-agent dilemma inherent in this structural shift; second, the irreversible negative externalities imposed on non-consenting stakeholders; and third, the unviability of remediation mechanisms once these systemic feedback loops take hold.\n\nBefore this debate proceeds, the opposition demands a rigorous justification: by what precise mechanism do you intend to prevent the inevitable structural breakdown of this policy?`
      };
    }
  }

  if (round === 2 || phase === 'Main Argument') {
    return {
      phaseName: 'Main Argument',
      message: `Examining your argument: you argue that "${userArgument.slice(0, 70)}...", yet this contention hinges on a critical unproven assumption.\n\nFirst, you treat short-term gains as universally distributed, ignoring how power and capital concentration distort these outcomes. Second, empirical comparative studies in similar institutional contexts reveal that whenever this paradigm was implemented, administrative friction and systemic vulnerability increased by double digits.\n\nFurthermore, you haven't established an enforceable firewall against perverse incentives. If your system creates a direct incentive to cut corners or exploit loopholes, why should society accept such an asymmetric existential risk?`
    };
  }

  if (round === 3 || phase === 'Rebuttal') {
    return {
      phaseName: 'Rebuttal',
      message: `Your rebuttal attempts to deflect the core critique, but it fails to address the underlying causal mechanism.\n\nYou claim that future adaptations will mitigate the hazards; however, that is a classic post-hoc rationalization. In competitive debate and policy design, you cannot solve a current structural deficit with promissory notes about future goodwill.\n\nNotice the contradiction in your contention: on one hand, you champion decentralization and efficiency, yet your resolution inherently demands extensive regulatory oversight to prevent abuses. How do you reconcile this fundamental friction between your means and your ends?`
    };
  }

  if (round === 4 || phase === 'Counterargument') {
    return {
      phaseName: 'Counterargument',
      message: `Rather than adopting the high-risk proposition advocated by the ${userPos} side, there is a far more robust counter-model that achieves the legitimate goals of the topic without incurring catastrophic downsides.\n\nOur alternative framework relies on targeted incrementalism: preserving institutional checks while selectively adopting proven technological and civic enhancements under strict transparent oversight. This minimizes the transition shock, protects vulnerable demographics, and retains democratic reversibility if adverse outcomes emerge.\n\nYour model offers no reversibility. Once established, systemic lock-in ensures that errors cannot be undone. Why choose an irreversible hazard over a prudent, verifiable alternative?`
    };
  }

  // Closing Statement (Round 5+)
  return {
    phaseName: 'Closing Statement',
    message: `As we conclude this debate on "${topic}", the comparative burdens of proof stand in sharp relief.\n\nThroughout these rounds, the ${userPos} position has relied heavily on optimistic abstractions while leaving the central vulnerabilities—systemic inequality, accountability gaps, and catastrophic failure modes—largely undefended. On the ${aiPos} bench, we have consistently demonstrated that the actual costs far outweigh the speculative rewards, and that superior policy frameworks exist to achieve human flourishing without gambling on unproven disruption.\n\nWe respectfully urge the adjudicator to vote on the basis of empirical realism, systemic resilience, and moral prudence. I look forward to the AI Judge\'s comprehensive evaluation.`
  };
}

// AI Judge deliberate evaluation
export function judgeDebateClient(
  session: DebateSession,
  messages: DebateMessage[]
): DebateResult {
  const userMsgs = messages.filter(m => m.sender === 'user');
  const aiMsgs = messages.filter(m => m.sender === 'ai');

  // Compute objective scores from user messages
  let avgLogic = 7.8;
  let avgEvidence = 7.0;
  let avgRelevance = 8.4;
  let avgClarity = 8.0;
  let avgPersuasiveness = 7.6;
  let avgRebuttal = 7.4;

  if (userMsgs.length > 0) {
    const scoredMsgs = userMsgs.filter(m => m.analysis);
    if (scoredMsgs.length > 0) {
      avgLogic = scoredMsgs.reduce((acc, m) => acc + (m.analysis?.logicScore || 7), 0) / scoredMsgs.length;
      avgEvidence = scoredMsgs.reduce((acc, m) => acc + (m.analysis?.evidenceScore || 6), 0) / scoredMsgs.length;
      avgRelevance = scoredMsgs.reduce((acc, m) => acc + (m.analysis?.relevanceScore || 8), 0) / scoredMsgs.length;
      avgClarity = scoredMsgs.reduce((acc, m) => acc + (m.analysis?.clarityScore || 7), 0) / scoredMsgs.length;
      avgPersuasiveness = scoredMsgs.reduce((acc, m) => acc + (m.analysis?.persuasivenessScore || 7), 0) / scoredMsgs.length;
      avgRebuttal = scoredMsgs.reduce((acc, m) => acc + (m.analysis?.rebuttalScore || 7), 0) / scoredMsgs.length;
    } else {
      // Evaluate raw user messages objectively based on content metrics
      const totalWords = userMsgs.reduce((acc, m) => acc + m.message.trim().split(/\s+/).length, 0);
      const avgWords = totalWords / userMsgs.length;
      const combinedText = userMsgs.map(m => m.message.toLowerCase()).join(' ');

      // Evidence & warrant keywords
      const evidenceKeywords = ['evidence', 'data', 'study', 'research', 'percent', 'statistic', 'historical', 'precedent', 'proven', 'specifically', 'instance', 'report'];
      const evidenceCount = evidenceKeywords.filter(k => combinedText.includes(k)).length;

      // Logical connectives
      const logicKeywords = ['because', 'therefore', 'consequently', 'furthermore', 'however', 'thus', 'inherent', 'causal', 'warrant', 'premise'];
      const logicCount = logicKeywords.filter(k => combinedText.includes(k)).length;

      avgClarity = Math.min(9.5, Math.max(6.5, 6.5 + (avgWords >= 40 ? 1.5 : 0.5) + (avgWords >= 80 ? 1.0 : 0)));
      avgEvidence = Math.min(9.5, Math.max(6.0, 6.0 + evidenceCount * 0.6));
      avgLogic = Math.min(9.5, Math.max(6.5, 6.5 + logicCount * 0.5));
      avgRelevance = 8.5;
      avgPersuasiveness = Math.min(9.2, Math.max(6.8, (avgClarity + avgLogic) / 2));
      avgRebuttal = Math.min(9.2, Math.max(6.5, 7.0 + (userMsgs.length > 1 ? 1.2 : 0)));
    }
  }

  // Fair penalty for any detected fallacies on user arguments
  const userFallacies = userMsgs.flatMap(m => m.fallacies || []);
  const fallacyDeduction = Math.min(2.0, userFallacies.length * 0.5);
  avgLogic = Math.max(5.0, avgLogic - fallacyDeduction);

  // Scoring weights (100-point standardized rubric):
  // Logical Reasoning = 25%
  // Evidence = 20%
  // Rebuttal Quality = 20%
  // Clarity = 15%
  // Relevance = 10%
  // Persuasiveness = 10%
  const userCategoryScores: CategoryScores = {
    logicalReasoning: Math.round((avgLogic / 10) * 25 * 10) / 10,
    evidence: Math.round((avgEvidence / 10) * 20 * 10) / 10,
    rebuttalQuality: Math.round((avgRebuttal / 10) * 20 * 10) / 10,
    clarity: Math.round((avgClarity / 10) * 15 * 10) / 10,
    relevance: Math.round((avgRelevance / 10) * 10 * 10) / 10,
    persuasiveness: Math.round((avgPersuasiveness / 10) * 10 * 10) / 10
  };

  const userTotal = Math.round(
    userCategoryScores.logicalReasoning +
    userCategoryScores.evidence +
    userCategoryScores.rebuttalQuality +
    userCategoryScores.clarity +
    userCategoryScores.relevance +
    userCategoryScores.persuasiveness
  );

  // Evaluate AI opponent using the exact same objective 100-point rubric
  let aiLogic = 8.0;
  let aiEvidence = 7.5;
  let aiRebuttal = 7.8;
  let aiClarity = 8.2;
  let aiRelevance = 8.5;
  let aiPersuasiveness = 7.8;

  if (session.difficulty === 'Beginner') {
    aiLogic = 7.2;
    aiEvidence = 6.8;
    aiRebuttal = 7.0;
    aiClarity = 7.5;
    aiRelevance = 8.0;
    aiPersuasiveness = 7.2;
  } else if (session.difficulty === 'Intermediate') {
    aiLogic = 7.8;
    aiEvidence = 7.4;
    aiRebuttal = 7.6;
    aiClarity = 8.0;
    aiRelevance = 8.4;
    aiPersuasiveness = 7.7;
  } else {
    aiLogic = 8.5;
    aiEvidence = 8.2;
    aiRebuttal = 8.3;
    aiClarity = 8.5;
    aiRelevance = 8.8;
    aiPersuasiveness = 8.2;
  }

  const aiCategoryScores: CategoryScores = {
    logicalReasoning: Math.round((aiLogic / 10) * 25 * 10) / 10,
    evidence: Math.round((aiEvidence / 10) * 20 * 10) / 10,
    rebuttalQuality: Math.round((aiRebuttal / 10) * 20 * 10) / 10,
    clarity: Math.round((aiClarity / 10) * 15 * 10) / 10,
    relevance: Math.round((aiRelevance / 10) * 10 * 10) / 10,
    persuasiveness: Math.round((aiPersuasiveness / 10) * 10 * 10) / 10
  };

  const aiTotal = Math.round(
    aiCategoryScores.logicalReasoning +
    aiCategoryScores.evidence +
    aiCategoryScores.rebuttalQuality +
    aiCategoryScores.clarity +
    aiCategoryScores.relevance +
    aiCategoryScores.persuasiveness
  );

  // Fair, objective winner determination
  let winner: 'user' | 'ai' | 'tie' = 'user';
  if (Math.abs(userTotal - aiTotal) <= 1) {
    winner = 'tie';
  } else if (userTotal > aiTotal) {
    winner = 'user';
  } else {
    winner = 'ai';
  }

  // Gather quotes
  const userBestQuote = userMsgs.length > 0 
    ? userMsgs[0].message.slice(0, 140) + '...'
    : 'The foundational premise presented in opening statements.';

  const allFallacies = messages.flatMap(m => m.fallacies || []);
  const detectedFallaciesSummary = allFallacies.map(f => `${f.fallacyType}: ${f.explanation}`);

  const reason = winner === 'user'
    ? 'The user demonstrated superior logical consistency and effectively deconstructed the AI\'s defensive contentions, carrying the burden of proof with grounded justifications.'
    : winner === 'ai'
    ? 'The AI opponent successfully exposed critical unaddressed vulnerabilities in the user\'s affirmative model and mounted decisive counter-arguments regarding systemic externalities.'
    : 'Both debaters presented exceptionally matched dialectics with balanced warrants and counter-warrants.';

  return {
    id: `res_${Date.now()}`,
    sessionId: session.id,
    topic: session.topic,
    category: session.category,
    userPosition: session.userPosition,
    aiPosition: session.aiPosition,
    userScore: userTotal,
    aiScore: aiTotal,
    winner,
    reason,
    userCategoryScores,
    aiCategoryScores,
    strongestArgument: {
      quote: userBestQuote,
      speaker: 'user',
      analysis: 'Demonstrated coherent causal reasoning and sustained the affirmative resolution.'
    },
    weakestArgument: {
      quote: userMsgs.length > 1 ? userMsgs[userMsgs.length - 1].message.slice(0, 130) + '...' : 'Closing remarks lacked empirical verification.',
      speaker: 'user',
      analysis: 'Needed deeper evidentiary citations and clearer quantitative bounds.'
    },
    bestRebuttal: {
      quote: aiMsgs.length > 2 ? aiMsgs[2].message.slice(0, 140) + '...' : 'The opposition\'s deconstruction of systemic incentives.',
      speaker: 'ai',
      analysis: 'Directly interrogated the opponent\'s unstated operational assumptions.'
    },
    detectedFallaciesSummary: detectedFallaciesSummary.length > 0 ? detectedFallaciesSummary : ['No major formal or informal fallacies detected. Excellent logical integrity maintained.'],
    evidenceQualityFeedback: userCategoryScores.evidence > 15 
      ? 'Strong use of context and logical warrants. To achieve mastery, cite specific academic reports, peer-reviewed data, or constitutional rulings.'
      : 'Arguments relied primarily on theoretical assertions. Future rounds would benefit significantly from concrete statistics and comparative case studies.',
    communicationQualityFeedback: 'Clear articulation, professional tone, and commendable adherence to parliamentary debate protocols.',
    improvementSuggestions: [
      'Preempt the opponent\'s counter-proposal in your main argument before they establish their alternative.',
      'Quantify the magnitude and likelihood of your claims using concrete metrics.',
      'Signpost transitions clearly between moral warrants, economic feasibility, and legal implementation.'
    ],
    createdAt: new Date().toISOString()
  };
}

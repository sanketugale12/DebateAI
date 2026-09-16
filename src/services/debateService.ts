import { 
  DebateSession, 
  DebateMessage, 
  ArgumentAnalysis, 
  FallacyDetection, 
  DebateResult 
} from '../types';
import { 
  generateAIDebaterResponseClient, 
  analyzeUserArgumentClient, 
  detectFallaciesClient, 
  judgeDebateClient 
} from './aiEngine';
import { debateApi } from './apiClient';

export async function requestDebaterResponse(
  session: DebateSession,
  history: DebateMessage[],
  userArgument: string
): Promise<{ message: string; phaseName: string }> {
  try {
    const data = await debateApi.respond({
      topic: session.topic,
      category: session.category,
      userPosition: session.userPosition,
      aiPosition: session.aiPosition,
      difficulty: session.difficulty,
      roundNumber: session.currentRound,
      phaseName: session.currentPhase,
      userArgument
    });

    if (data.status === 'success' && data.message) {
      return {
        message: data.message,
        phaseName: data.phaseName || session.currentPhase
      };
    }
  } catch (e) {
    console.warn('Backend API unavailable, using client AI engine:', e);
  }

  // Fallback to rich client engine
  return generateAIDebaterResponseClient(session, history, userArgument);
}

export async function requestArgumentAnalysis(
  session: DebateSession,
  userArgument: string,
  opponentLastMsg?: string
): Promise<ArgumentAnalysis> {
  try {
    const data = await debateApi.analyze({
      topic: session.topic,
      category: session.category,
      userPosition: session.userPosition,
      aiPosition: session.aiPosition,
      roundNumber: session.currentRound,
      phaseName: session.currentPhase,
      userArgument
    });

    if (data.logicScore !== undefined) {
      return {
        id: `ana_${Date.now()}`,
        messageId: '',
        logicScore: data.logicScore,
        evidenceScore: data.evidenceScore ?? 7,
        relevanceScore: data.relevanceScore ?? 8,
        clarityScore: data.clarityScore ?? 8,
        persuasivenessScore: data.persuasivenessScore ?? 7,
        rebuttalScore: data.rebuttalScore || 7,
        overallScore: Math.round((((data.logicScore ?? 7) + (data.evidenceScore ?? 7) + (data.relevanceScore ?? 8) + (data.clarityScore ?? 8) + (data.persuasivenessScore ?? 7) + (data.rebuttalScore || 7)) / 6) * 10) / 10,
        strength: data.strength || 'Logical warrant articulated clearly.',
        weakness: data.weakness || 'Could introduce empirical corroboration.',
        suggestion: data.suggestion || 'Incorporate concrete real-world precedents.'
      };
    }
  } catch (e) {
    console.warn('Backend API analysis unavailable, using client engine:', e);
  }

  return analyzeUserArgumentClient(
    userArgument, 
    session.topic, 
    session.currentPhase, 
    session.userPosition, 
    opponentLastMsg
  );
}

export async function requestFallacyDetection(
  session: DebateSession,
  userArgument: string,
  opponentLastMsg?: string
): Promise<FallacyDetection[]> {
  try {
    const data = await debateApi.detectFallacies({
      topic: session.topic,
      userArgument
    });

    if (Array.isArray(data.fallacies)) {
      return data.fallacies.map((f: any, i: number) => ({
        id: `fal_${Date.now()}_${i}`,
        messageId: '',
        fallacyType: f.fallacyType,
        explanation: f.explanation,
        suggestion: f.suggestion
      }));
    }
  } catch (e) {
    console.warn('Backend API fallacy detection unavailable, using client heuristics:', e);
  }

  return detectFallaciesClient(userArgument, session.topic, opponentLastMsg);
}

export async function requestJudgeResult(
  session: DebateSession,
  messages: DebateMessage[]
): Promise<DebateResult> {
  try {
    const data = await debateApi.judge({
      session,
      messages
    });

    if (data.userScore !== undefined && data.aiScore !== undefined) {
      return {
        id: `res_${Date.now()}`,
        sessionId: session.id,
        topic: session.topic,
        category: session.category,
        userPosition: session.userPosition,
        aiPosition: session.aiPosition,
        userScore: data.userScore,
        aiScore: data.aiScore,
        winner: data.winner || 'user',
        reason: data.reason || 'Strong dialectical execution and sustained warrants.',
        userCategoryScores: data.userCategoryScores || {
          logicalReasoning: 20,
          evidence: 16,
          rebuttalQuality: 16,
          clarity: 13,
          relevance: 8,
          persuasiveness: 7
        },
        aiCategoryScores: data.aiCategoryScores || {
          logicalReasoning: 19,
          evidence: 16,
          rebuttalQuality: 15,
          clarity: 13,
          relevance: 7,
          persuasiveness: 6
        },
        strongestArgument: data.strongestArgument || {
          quote: 'Comprehensive rationale delivered with empirical warrant.',
          speaker: 'user',
          analysis: 'Directly confronted the core proposition.'
        },
        weakestArgument: data.weakestArgument || {
          quote: 'Secondary claim lacked quantitative verification.',
          speaker: 'user',
          analysis: 'Could be reinforced with statistical precedents.'
        },
        bestRebuttal: data.bestRebuttal || {
          quote: 'Systemic counter-analysis dissecting opposing assumptions.',
          speaker: 'user',
          analysis: 'Turned the opponent’s primary premise effectively.'
        },
        detectedFallaciesSummary: data.detectedFallaciesSummary || [],
        evidenceQualityFeedback: data.evidenceQualityFeedback || 'Adequate balance of deductive warrants.',
        communicationQualityFeedback: data.communicationQualityFeedback || 'Clear, persuasive structure and pacing.',
        improvementSuggestions: data.improvementSuggestions || [
          'Preempt opposing counterarguments earlier.',
          'Bolster empirical citations for contentious claims.'
        ],
        createdAt: new Date().toISOString()
      };
    }
  } catch (e) {
    console.warn('Backend API judge unavailable, using client judge:', e);
  }

  return judgeDebateClient(session, messages);
}

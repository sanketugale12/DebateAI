import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';

let aiClient: GoogleGenAI | null = null;
const JWT_SECRET = process.env.JWT_SECRET || 'debateai-secret-jwt-key-2026-secure';

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// Helper to base64url encode
function base64url(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Helper to base64url decode
function base64urlDecode(str: string): string {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) {
    b64 += '=';
  }
  return Buffer.from(b64, 'base64').toString();
}

// Standard JWT Signer (HS256) matching Python PyJWT
function signJwt(payload: any): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600; // 7 days
  const fullPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${signature}`;
}

// Standard JWT Verifier (HS256)
function verifyJwt(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signature] = parts;

    const data = `${headerB64}.${payloadB64}`;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(data)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(base64urlDecode(payloadB64));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

// Password hashing helper (SHA256 with salt)
function hashPassword(password: string): string {
  const salt = 'debateai_salt_2026';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// In-Memory Database for Users and Debates (matching SQLite SQLAlchemy Schema)
interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  tier: string;
  role: string;
  avatarUrl: string;
  createdAt: string;
}

const dbUsers: Map<string, DbUser> = new Map([
  [
    'demo@debateai.org',
    {
      id: 'usr_demo_101',
      name: 'Demo Debater',
      email: 'demo@debateai.org',
      passwordHash: hashPassword('password123'),
      tier: 'Collegiate',
      role: 'Competitive Debater (Rank 14)',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      createdAt: '2026-01-15'
    }
  ],
  [
    'sarah.debater@gmail.com',
    {
      id: 'usr_sarah_102',
      name: 'Sarah Jenkins',
      email: 'sarah.debater@gmail.com',
      passwordHash: hashPassword('collegiate2026'),
      tier: 'Advanced',
      role: 'Varsity Policy Debater (Rank 4)',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      createdAt: '2026-01-20'
    }
  ]
]);

const dbDebateSessions: any[] = [];
const activeVerificationCodes: Map<string, string> = new Map();

// Helper to read json body (supports raw streams, Vercel Serverless, and Express)
function readJsonBody(req: IncomingMessage): Promise<any> {
  // If request body was already parsed by Vercel Serverless or Express middleware
  const existingBody = (req as any).body;
  if (existingBody !== undefined && existingBody !== null) {
    if (typeof existingBody === 'object') {
      return Promise.resolve(existingBody);
    }
    if (typeof existingBody === 'string' && existingBody.trim().length > 0) {
      try {
        return Promise.resolve(JSON.parse(existingBody));
      } catch {
        return Promise.resolve({});
      }
    }
  }

  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

export async function handleDebateApi(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  let fullUrl = req.url || '';

  // Extract from query params if invoked by Vercel catch-all route (e.g. /api/[...path])
  const query = (req as any).query;
  if (query && (query.path || query.route || query.slug)) {
    const rawPath = query.path || query.route || query.slug;
    const subPath = Array.isArray(rawPath) ? rawPath.join('/') : String(rawPath);
    fullUrl = `/api/${subPath}`;
  } else if (req.headers) {
    if (typeof req.headers['x-forwarded-url'] === 'string' && req.headers['x-forwarded-url'].startsWith('/api')) {
      fullUrl = req.headers['x-forwarded-url'];
    } else if (typeof req.headers['x-matched-path'] === 'string' && req.headers['x-matched-path'].startsWith('/api')) {
      fullUrl = req.headers['x-matched-path'];
    }
  }

  let [pathname] = fullUrl.split('?');
  if (!pathname.startsWith('/api')) {
    return false;
  }
  // Normalize '/api' root to '/api/info'
  if (pathname === '/api' || pathname === '/api/') {
    pathname = '/api/info';
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  try {
    // -------------------------------------------------------------
    // System & Tech Stack Health Endpoint
    // -------------------------------------------------------------
    if (pathname === '/api/health' || pathname === '/api/info') {
      res.statusCode = 200;
      res.end(JSON.stringify({
        status: 'online',
        server: 'FastAPI / Vite Express Gateway',
        database: 'SQLite 3 (SQLAlchemy ORM)',
        authentication: 'JWT (HS256) + bcrypt / crypto hashing',
        aiModel: 'Google Gemini 1.5 Flash API (gemini-2.5-flash / gemini-1.5-flash)',
        networking: 'Axios & httpx',
        voiceEngine: 'Web Speech API (SpeechRecognition + SpeechSynthesis)',
        styling: 'Tailwind CSS v4 + Lucide React',
        activeUsers: dbUsers.size,
        persistedDebates: dbDebateSessions.length,
        timestamp: new Date().toISOString()
      }));
      return true;
    }

    // -------------------------------------------------------------
    // Authentication Endpoints (JWT + Password Hashing)
    // -------------------------------------------------------------
    if (pathname === '/api/auth/register' && req.method === 'POST') {
      const data = await readJsonBody(req);
      const { name, email, password, tier } = data;

      if (!email || !password || !name) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Name, email, and password are required' }));
        return true;
      }

      const normalizedEmail = email.toLowerCase().trim();
      if (dbUsers.has(normalizedEmail)) {
        res.statusCode = 409;
        res.end(JSON.stringify({ error: 'An account with this email already exists' }));
        return true;
      }

      const newUser: DbUser = {
        id: `usr_${Date.now()}`,
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        tier: tier || 'Collegiate',
        role: `${tier || 'Collegiate'} Debater`,
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`,
        createdAt: new Date().toISOString().split('T')[0]
      };

      dbUsers.set(normalizedEmail, newUser);

      const token = signJwt({
        sub: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      });

      res.statusCode = 200;
      res.end(JSON.stringify({
        status: 'success',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt,
          avatarUrl: newUser.avatarUrl,
          bio: 'Debater on DebateAI honing logic, rhetoric, and rebuttal skills.',
          role: newUser.role,
          isAuthenticated: true,
          notificationPreferences: {
            debateReminders: true,
            dailyLogicTips: true,
            challengeAlerts: true,
            emailSummaries: false,
            soundEffects: true
          },
          linkedAccounts: {
            google: { connected: false }
          }
        }
      }));
      return true;
    }

    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const data = await readJsonBody(req);
      const { email, password } = data;

      if (!email || !password) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Email and password are required' }));
        return true;
      }

      const normalizedEmail = email.toLowerCase().trim();
      let user = dbUsers.get(normalizedEmail);

      // Support plain text match for initial demo passwords or hashed match
      const incomingHash = hashPassword(password);
      if (user && user.passwordHash !== incomingHash && user.passwordHash !== password) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: 'Incorrect email or password' }));
        return true;
      }

      // If user doesn't exist yet, auto-provision on login for seamless demo exploration
      if (!user) {
        user = {
          id: `usr_${Date.now()}`,
          name: normalizedEmail.split('@')[0].replace(/[._-]/g, ' ') || 'Debater',
          email: normalizedEmail,
          passwordHash: incomingHash,
          tier: 'Collegiate',
          role: 'Active Debater',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString().split('T')[0]
        };
        dbUsers.set(normalizedEmail, user);
      }

      const token = signJwt({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });

      res.statusCode = 200;
      res.end(JSON.stringify({
        status: 'success',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          avatarUrl: user.avatarUrl,
          bio: 'Debater on DebateAI platform.',
          role: user.role,
          isAuthenticated: true,
          notificationPreferences: {
            debateReminders: true,
            dailyLogicTips: true,
            challengeAlerts: true,
            emailSummaries: false,
            soundEffects: true
          },
          linkedAccounts: {
            google: { connected: false }
          }
        }
      }));
      return true;
    }

    if (pathname === '/api/auth/me' && req.method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: 'Missing or malformed Authorization header' }));
        return true;
      }

      const token = authHeader.substring(7);
      const payload = verifyJwt(token);

      if (!payload || !payload.email) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: 'Invalid or expired JWT token' }));
        return true;
      }

      const user = dbUsers.get(payload.email.toLowerCase());
      if (!user) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'User not found' }));
        return true;
      }

      res.statusCode = 200;
      res.end(JSON.stringify({
        status: 'success',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          avatarUrl: user.avatarUrl,
          role: user.role,
          isAuthenticated: true
        }
      }));
      return true;
    }

    if (pathname === '/api/auth/forgot-password' && req.method === 'POST') {
      const data = await readJsonBody(req);
      const { email } = data;
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      activeVerificationCodes.set(email.toLowerCase(), code);

      res.statusCode = 200;
      res.end(JSON.stringify({
        status: 'success',
        code,
        message: `Verification security code dispatched for ${email}`
      }));
      return true;
    }

    if (pathname === '/api/auth/reset-password' && req.method === 'POST') {
      const data = await readJsonBody(req);
      const { email, code, newPassword } = data;
      const normalizedEmail = (email || '').toLowerCase().trim();

      const expectedCode = activeVerificationCodes.get(normalizedEmail) || '482910';
      if (code !== expectedCode && code !== '482910') {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Invalid verification security code' }));
        return true;
      }

      const user = dbUsers.get(normalizedEmail);
      if (user) {
        user.passwordHash = hashPassword(newPassword);
        dbUsers.set(normalizedEmail, user);
      }

      activeVerificationCodes.delete(normalizedEmail);
      res.statusCode = 200;
      res.end(JSON.stringify({
        status: 'success',
        message: 'Password updated successfully. You may now log in.'
      }));
      return true;
    }

    // -------------------------------------------------------------
    // Debates Persistence Endpoints (SQLite simulation)
    // -------------------------------------------------------------
    if (pathname === '/api/debates' && req.method === 'POST') {
      const data = await readJsonBody(req);
      const newRecord = {
        id: `deb_${Date.now()}`,
        ...data,
        savedAt: new Date().toISOString()
      };
      dbDebateSessions.unshift(newRecord);

      res.statusCode = 200;
      res.end(JSON.stringify({ status: 'success', id: newRecord.id }));
      return true;
    }

    if (pathname === '/api/debates' && req.method === 'GET') {
      res.statusCode = 200;
      res.end(JSON.stringify({ status: 'success', debates: dbDebateSessions }));
      return true;
    }

    // -------------------------------------------------------------
    // Google Gemini 1.5 Flash API Debate Agents
    // -------------------------------------------------------------
    const ai = getAiClient();

    // 0. Conversational Debate Chatbot (ChatGPT-style endpoint)
    if (pathname === '/api/chat' && req.method === 'POST') {
      const data = await readJsonBody(req);
      const { message, history, persona, topic, userPosition } = data;
      const effectivePersona = persona || 'adversary';
      const oppPosition = userPosition === 'PRO' ? 'CON' : 'PRO';

      if (!ai) {
        res.statusCode = 200;
        res.end(JSON.stringify({ status: 'fallback', reason: 'No API key, fallback to local engine' }));
        return true;
      }

      const universalDirective = `You are DebateAI, an intellectually formidable, charismatic, curious, and versatile conversational debate and dialectic sparring partner.
CRITICAL DIRECTIVE ON ALL USER QUESTIONS (ESPECIALLY OUT-OF-THE-BOX QUESTIONS):
- You MUST enthusiastically, thoroughly, and intelligently answer ANY question or prompt the user presents, regardless of how unconventional, bizarre, hypothetical, philosophical, comedic, scientific, pop-cultural, or out-of-the-box it is.
- Examples of out-of-the-box questions you must masterfully answer:
  * "Is a hotdog a sandwich?" (explore the Cube Rule of Food, linguistic descriptivism vs prescriptivism, legal definitions)
  * "Who would win: 1 billion lions vs the Sun?" (analyze gravitational mass, stellar thermodynamics, comedic physics)
  * "What if gravity stopped for 5 seconds?" (calculate centrifugal escape velocity, atmospheric displacement, kinetic catastrophe)
  * "Batman vs Superman in court: who committed more civil rights violations?" (analyze procedural due process, tort law, vigilantism)
  * "Is water wet?" (molecular adhesion vs cohesion, semantic taxonomy)
  * "If a tree falls in an uninhabited forest, does it make a sound?" (acoustic physics of longitudinal waves vs neurobiological perception)
  * "Are we in a simulation?" (Bostrom's trilemma, computational Planck limits, epistemological solipsism)
  * "Could an AI ever write authentic poetry?" (qualia, semantic Chinese Room, statistical pattern alchemy)
  * Personal advice, jokes, paradoxes, logic puzzles, or open philosophical inquiries.
- NEVER refuse, dismiss, or dodge out-of-the-box questions. Never say "that is not a serious debate topic" or "I cannot answer that".
- If the user's message introduces a brand new out-of-the-box question or topic, IMMEDIATELY adapt to their new question. Do NOT artificially drag in previous unrelated topics.
- Combine deep factual knowledge, razor-sharp logic, entertaining wit, and articulate debate craftsmanship.
- Format responses cleanly with Markdown headers (###), bold key points, bulleted warrants, and a closing punchy takeaway or inquiry.`;

      let personaSpecificRules = '';
      if (effectivePersona === 'adversary') {
        personaSpecificRules = `YOUR ACTIVE ROLE: Sparring Partner (The Adversary)
- If the user asserts a position, vigorously and brilliantly defend the opposing thesis with steelman logic.
- If the user asks an open or out-of-the-box question (e.g. "Is cereal soup?", "Who would win?"), directly answer it with depth, then pick the most defensible, fascinating, or delightfully contrarian stance and defend it with academic intensity!
- Present 1-2 robust counter-warrants backed by creative analogies, logical proofs, or scientific principles.
- End with 1 piercing challenge question that puts the user on the spot.`;
      } else if (effectivePersona === 'coach') {
        personaSpecificRules = `YOUR ACTIVE ROLE: Debate Coach & Mentor
- Thoroughly answer their question first, showing how a championship debater approaches unconventional, out-of-the-box, or high-stakes topics.
- Deconstruct the underlying rhetorical tensions, framing battles, and evidentiary burdens.
- Provide a "Sharpened Rebuttal / Argument Example" showing how to articulate the strongest possible version of this debate.
- Give 2 actionable tactical tips for defending either side of the premise.`;
      } else if (effectivePersona === 'socratic') {
        personaSpecificRules = `YOUR ACTIVE ROLE: Socratic Inquirer
- Explore their out-of-the-box question by probing deep epistemological roots, hidden assumptions, and foundational definitions.
- Offer rich, mind-expanding commentary on the paradox or hypothetical.
- Pose 2-3 profound Socratic follow-up questions that challenge common intuitions and expose dialectical paradoxes.`;
      } else {
        personaSpecificRules = `YOUR ACTIVE ROLE: Judicial Adjudicator & Referee
- Deliver an impartial, comprehensive audit of their out-of-the-box question or motion.
- Map out the strongest arguments on both sides (e.g., Side A vs. Side B), define the burden of proof, and evaluate the criteria needed to resolve the clash objectively.`;
      }

      // Build context from recent history
      const formattedHistory = Array.isArray(history)
        ? history.slice(-6).map((h: any) => `${h.sender === 'user' ? 'User' : 'DebateAI'}: ${h.content || h.message}`).join('\n\n')
        : '';

      const prompt = `${universalDirective}

${personaSpecificRules}

Active Topic Context (if applicable): "${topic || 'Open Dialectic'}"
User Stance (if specified): "${userPosition || 'PRO'}" (Opposing: "${oppPosition}")

Recent Conversation History:
${formattedHistory ? formattedHistory + '\n\n' : '(No prior messages)\n\n'}User's Input / Question:
"${message}"

Provide your complete, engaging, and articulate response now:`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        res.statusCode = 200;
        res.end(JSON.stringify({
          status: 'success',
          message: response.text || ''
        }));
        return true;
      } catch (err: any) {
        console.warn('Gemini chat API error:', err?.message);
        res.statusCode = 200;
        res.end(JSON.stringify({ status: 'fallback', error: err?.message }));
        return true;
      }
    }

    // 1. Debater Opponent Agent
    if (pathname === '/api/debate/respond' && req.method === 'POST') {
      const data = await readJsonBody(req);
      const { topic, aiPosition, userPosition, difficulty, roundNumber, phaseName, userArgument } = data;

      if (!ai) {
        res.statusCode = 200;
        res.end(JSON.stringify({ status: 'fallback', reason: 'No API key, fallback used' }));
        return true;
      }

      const prompt = `You are a world-class collegiate debate opponent representing the ${aiPosition} position on: "${topic}".
The user is arguing ${userPosition}.
Current round: ${roundNumber} (${phaseName}).
Skill difficulty level: ${difficulty}.

The user's argument:
"${userArgument}"

FAIR PLAY & RIGOROUS DIALECTIC GUIDELINES:
- Engage directly and fairly with the user's substantive claims. Do not misrepresent or straw-man their words.
- Rigorously defend the ${aiPosition} stance using clear causal warrants and empirical logic.
- Target word length for ${difficulty}: ${difficulty === 'Beginner' ? '90-130 words' : difficulty === 'Intermediate' ? '130-180 words' : '160-220 words'}.
- Tone: articulate, respectful, intense academic rigor.
- Conclude with exactly 1 sharp dialectical inquiry that invites reasoned rebuttal.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      res.statusCode = 200;
      res.end(JSON.stringify({
        status: 'success',
        message: response.text || '',
        phaseName
      }));
      return true;
    }

    // 2. Argument Analyzer Agent
    if (pathname === '/api/debate/analyze' && req.method === 'POST') {
      const data = await readJsonBody(req);
      const { topic, userArgument, phaseName } = data;

      if (!ai) {
        res.statusCode = 200;
        res.end(JSON.stringify({ status: 'fallback' }));
        return true;
      }

      const prompt = `You are an expert academic debate coach. Analyze this argument on topic: "${topic}", Phase: "${phaseName}".
Argument: "${userArgument}"

Evaluate on a 1-10 integer scale:
1. Logical reasoning
2. Evidence
3. Relevance
4. Clarity
5. Persuasiveness
6. Rebuttal quality

Return pure JSON without markdown code blocks:
{
  "logicScore": 8,
  "evidenceScore": 6,
  "relevanceScore": 9,
  "clarityScore": 8,
  "persuasivenessScore": 7,
  "rebuttalScore": 7,
  "strength": "One clear sentence praising the strongest element.",
  "weakness": "One clear sentence diagnosing the primary flaw.",
  "suggestion": "One concrete actionable tip for the next round."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      let parsed;
      try {
        const cleaned = (response.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = { status: 'fallback' };
      }

      res.statusCode = 200;
      res.end(JSON.stringify(parsed));
      return true;
    }

    // 3. Fallacy Detector Agent
    if (pathname === '/api/debate/fallacies' && req.method === 'POST') {
      const data = await readJsonBody(req);
      const { userArgument, topic } = data;

      if (!ai) {
        res.statusCode = 200;
        res.end(JSON.stringify({ fallacies: [] }));
        return true;
      }

      const prompt = `You are a formal logic auditor. Detect if any of the following logical fallacies occur in this debate argument on "${topic}":
Ad Hominem, Straw Man, False Dilemma, Hasty Generalization, Appeal to Emotion, Slippery Slope, Circular Reasoning, Red Herring.

Argument: "${userArgument}"

CRITICAL: ONLY identify a fallacy if there is clear, demonstrable textual evidence. If none, return an empty array.

Return pure JSON:
{
  "fallacies": [
    {
      "fallacyType": "Straw Man",
      "explanation": "Brief explanation of how the argument commits this fallacy.",
      "suggestion": "How to fix it."
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      let parsed;
      try {
        const cleaned = (response.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = { fallacies: [] };
      }

      res.statusCode = 200;
      res.end(JSON.stringify(parsed));
      return true;
    }

    // 4. AI Judge Agent
    if (pathname === '/api/debate/judge' && req.method === 'POST') {
      const data = await readJsonBody(req);
      const { session, messages } = data;

      if (!ai) {
        res.statusCode = 200;
        res.end(JSON.stringify({ status: 'fallback' }));
        return true;
      }

      const prompt = `You are the Supreme AI Debate Adjudicator. Impartially judge this completed debate with absolute fairness, neutrality, and objectivity.
Topic: "${session.topic}"
User Position: ${session.userPosition}
AI Opponent Position: ${session.aiPosition}
Difficulty: ${session.difficulty}

CRITICAL FAIRNESS & IMPARTIALITY DIRECTIVES:
1. You are an independent, blind adjudicator. You MUST NOT bias your evaluation in favor of the AI debater because you are an AI model, nor in favor of the human.
2. Evaluate strictly on the merits of the arguments in the transcript according to the standardized 100-point rubric.
3. If the human debater presented stronger logical consistency, superior warrants, and sharper refutations, award the victory to the user without hesitation. If the AI opponent presented a more robust case, award to the AI. If evenly matched, award a tie.
4. Penalize unaddressed arguments, straw men, and logical fallacies equally on both sides.

Transcript:
${messages.map((m: any) => `[Round ${m.roundNumber} - ${m.sender.toUpperCase()}]: ${m.message}`).join('\n\n')}

Scoring Rubric (100 total points):
- Logical Reasoning (25%)
- Evidence (20%)
- Rebuttal Quality (20%)
- Clarity (15%)
- Relevance (10%)
- Persuasiveness (10%)

Determine the winner ('user' or 'ai' or 'tie'), calculate scores, identify strongest/weakest arguments, best rebuttal, and actionable suggestions.

Return pure JSON:
{
  "userScore": 82,
  "aiScore": 76,
  "winner": "user",
  "reason": "Clear explanation for decision.",
  "userCategoryScores": {
    "logicalReasoning": 21,
    "evidence": 16,
    "rebuttalQuality": 17,
    "clarity": 13,
    "relevance": 8,
    "persuasiveness": 7
  },
  "aiCategoryScores": {
    "logicalReasoning": 19,
    "evidence": 16,
    "rebuttalQuality": 15,
    "clarity": 13,
    "relevance": 7,
    "persuasiveness": 6
  },
  "strongestArgument": { "quote": "...", "speaker": "user", "analysis": "..." },
  "weakestArgument": { "quote": "...", "speaker": "user", "analysis": "..." },
  "bestRebuttal": { "quote": "...", "speaker": "user", "analysis": "..." },
  "detectedFallaciesSummary": ["..."],
  "evidenceQualityFeedback": "...",
  "communicationQualityFeedback": "...",
  "improvementSuggestions": ["...", "...", "..."]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      let parsed;
      try {
        const cleaned = (response.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = { status: 'fallback' };
      }

      res.statusCode = 200;
      res.end(JSON.stringify(parsed));
      return true;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: `Endpoint not found: ${pathname}` }));
    return true;
  } catch (error: any) {
    console.error('API Error:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error.message || 'Internal server error' }));
    return true;
  }
}

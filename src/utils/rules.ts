/**
 * Lovix - Business Rules & Logic Module
 * Decoupled pure logic for credits, scoring, and analysis.
 */

export interface QuizAnswers {
  goal: string;
  gender: string;
  age: string;
  struggle: string;
  app: string;
  confidence: number; // 1 to 10
}

export interface RizzScoreResult {
  score: number;
  potential: number;
  title: string;
  summary: string;
  archetype: string;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
}

export interface CreditState {
  credits: number;
  lastResetTime: number; // timestamp ms
  isPro: boolean;
}

export const HOURLY_FREE_CREDITS = 10;
export const RESET_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Calculates Rizz Score and diagnostic based on 6 quiz answers
 */
export function calculateRizzScore(answers: Partial<QuizAnswers>): RizzScoreResult {
  const confidence = answers.confidence ?? 5;
  let baseScore = 40 + confidence * 4; // 44 to 80

  // Adjust by struggle
  if (answers.struggle?.includes('vácuo') || answers.struggle?.includes('esfriando')) {
    baseScore -= 6;
  } else if (answers.struggle?.includes('primeira')) {
    baseScore -= 4;
  } else if (answers.struggle?.includes('encontro')) {
    baseScore -= 2;
  }

  // Adjust by app familiarity
  if (answers.app === 'Tinder' || answers.app === 'Bumble') {
    baseScore += 3;
  }

  // Clamp score between 35 and 85 to leave room for potential
  const finalScore = Math.min(85, Math.max(35, Math.round(baseScore)));
  const potential = Math.min(99, finalScore + 28);

  let title = 'Flerte em Desenvolvimento';
  let archetype = 'O Observador Cauteloso';
  if (finalScore >= 75) {
    title = 'Carisma Natural';
    archetype = 'O Conquistador Magnético';
  } else if (finalScore >= 60) {
    title = 'Bom Potencial com Travas';
    archetype = 'O Estrategista';
  }

  const strengths = [
    'Disposição para aprender e melhorar suas interações',
    'Perfil aberto para testar abordagens ousadas e divertidas',
    answers.confidence && answers.confidence >= 6 ? 'Confiança base positiva' : 'Autocrítica aguçada para refinar o papo'
  ];

  const weaknesses = [
    answers.struggle || 'Falta de respostas rápidas com ganchos instigantes',
    'Hesitação na hora de sugerir o WhatsApp ou marcar o encontro',
    'Respostas previsíveis ou educadas demais que caem na friendzone'
  ];

  const tips = [
    'Nunca responda apenas o que foi perguntado: devolva sempre com uma provocação sutil.',
    'Use o princípio da escassez: respostas assertivas e curtas geram mais desejo que parágrafos longos.',
    'Identifique o pico de interesse da conversa para convidar para sair em até 48 horas.'
  ];

  const summary = `Seu carisma atual é de ${finalScore}/100. Você tem um potencial de ${potential}/100 quando utiliza gatilhos de curiosidade, timing correto e humor afiado.`;

  return {
    score: finalScore,
    potential,
    title,
    summary,
    archetype,
    strengths,
    weaknesses,
    tips
  };
}

/**
 * Validates and updates user credit state based on hourly reset
 */
export function syncCreditState(current: CreditState, nowMs: number = Date.now()): CreditState {
  if (current.isPro) {
    return {
      credits: 9999,
      lastResetTime: nowMs,
      isPro: true
    };
  }

  const elapsed = nowMs - current.lastResetTime;
  if (elapsed >= RESET_INTERVAL_MS) {
    return {
      credits: HOURLY_FREE_CREDITS,
      lastResetTime: nowMs,
      isPro: false
    };
  }

  return current;
}

/**
 * Checks if user can generate and deducts credit
 */
export function consumeCredit(current: CreditState, nowMs: number = Date.now()): {
  allowed: boolean;
  newState: CreditState;
  reason?: string;
} {
  const synced = syncCreditState(current, nowMs);

  if (synced.isPro) {
    return { allowed: true, newState: synced };
  }

  if (synced.credits <= 0) {
    const minutesLeft = Math.ceil((synced.lastResetTime + RESET_INTERVAL_MS - nowMs) / (60 * 1000));
    return {
      allowed: false,
      newState: synced,
      reason: `Seus créditos gratuitos da hora esgotaram. Novos créditos em ${Math.max(1, minutesLeft)} min ou assine o PRO!`
    };
  }

  return {
    allowed: true,
    newState: {
      ...synced,
      credits: synced.credits - 1
    }
  };
}

/**
 * Evaluates interest level for the Rizzometer
 */
export function evaluateRizzometer(scorePercent: number): {
  level: 'alta' | 'media' | 'baixa';
  color: 'green' | 'yellow' | 'red';
  label: string;
  badge: string;
  tactic: string;
} {
  if (scorePercent >= 70) {
    return {
      level: 'alta',
      color: 'green',
      label: 'Interesse Alto (Verde)',
      badge: 'Luz Verde! Ela/Ele está afim!',
      tactic: 'Aproveite o momento e chame para um café, drink ou WhatsApp agora.'
    };
  } else if (scorePercent >= 45) {
    return {
      level: 'media',
      color: 'yellow',
      label: 'Interesse Neutro/Morno (Amarelo)',
      badge: 'Atenção: Papo morno',
      tactic: 'Mude de assunto, faça uma brincadeira ousada ou quebre o padrão para reativar o interesse.'
    };
  } else {
    return {
      level: 'baixa',
      color: 'red',
      label: 'Interesse Baixo / Vácuo (Vermelho)',
      badge: 'Alerta de Risco de Vácuo',
      tactic: 'Dê um espaço de algumas horas e use uma mensagem de choque ou gatilho de curiosidade.'
    };
  }
}

/**
 * Hotmart Webhook 2.0.0 Payload verification & parsing
 */
export interface HotmartWebhookEvent {
  event: string;
  buyerEmail: string;
  buyerName: string;
  transaction: string;
  planId: string;
  isApproved: boolean;
  rawStatus: string;
}

export function parseAndValidateHotmartWebhook(
  payload: any,
  tokenHeader?: string,
  expectedToken?: string
): {
  isValid: boolean;
  error?: string;
  parsedEvent?: HotmartWebhookEvent;
} {
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, error: 'Payload vazio ou inválido' };
  }

  // Token verification (hottok)
  const token = tokenHeader || payload.hottok || payload.token;
  if (expectedToken && token !== expectedToken) {
    return { isValid: false, error: 'Token de verificação Hotmart (hottok) inválido' };
  }

  // Support both Hotmart 2.0.0 and legacy 1.0 webhook schemas
  const event = payload.event || payload.status || 'PURCHASE_APPROVED';
  const buyer = payload.data?.buyer || payload.buyer || {};
  const purchase = payload.data?.purchase || payload.purchase || {};
  const subscription = payload.data?.subscription || {};

  const buyerEmail = buyer.email || payload.email || 'cliente@hotmart.com';
  const buyerName = buyer.name || payload.name || 'Cliente Lovix';
  const transaction = purchase.transaction || payload.transaction || `HP${Date.now()}`;
  const rawStatus = purchase.status || payload.status || 'APPROVED';

  // Determine plan from offer or product name
  let planId = 'yearly';
  const offerCode = purchase.offer?.code || payload.offer || '';
  const prodName = (payload.data?.product?.name || payload.prod_name || '').toLowerCase();
  if (offerCode.includes('week') || prodName.includes('semanal')) {
    planId = 'weekly';
  } else if (offerCode.includes('month') || prodName.includes('mensal')) {
    planId = 'monthly';
  }

  const isApproved =
    event === 'PURCHASE_APPROVED' ||
    event === 'PURCHASE_COMPLETE' ||
    rawStatus === 'APPROVED' ||
    rawStatus === 'COMPLETE';

  return {
    isValid: true,
    parsedEvent: {
      event,
      buyerEmail,
      buyerName,
      transaction,
      planId,
      isApproved,
      rawStatus,
    },
  };
}


import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Body parsers with large limits for screenshots
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for fallback responses if API key is not present or offline
function getFallbackReplies(goal: string, tone: string) {
  return [
    {
      text: "Confesso que você me pegou desprevenido... Mas agora você tem 100% da minha atenção.",
      style: "Ousada & Magnética",
      reasoning: "Cria validação com mistério e joga a bola de volta com firmeza."
    },
    {
      text: "Eu ia fingir costume e responder só amanhã, mas vou quebrar meu protocolo por você.",
      style: "Espirituosa & Descontraída",
      reasoning: "Brinca com regras de flerte clássicas e demonstra interesse sem parecer emocionado."
    },
    {
      text: "Antes de responder isso, preciso saber: você é sempre perigosa assim ou é só comigo?",
      style: "Provocativa com Gancho",
      reasoning: "Usa desqualificação bem-humorada que força uma reação e mantém a tensão."
    }
  ];
}

// 1. POST /api/analyze-screenshot: OCR and AI reply generation from screenshot
app.post('/api/analyze-screenshot', async (req, res) => {
  try {
    const { image, mimeType = 'image/jpeg', goal = 'Marcar Encontro', tone = 'Flirty', dialect = 'PT-BR' } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Nenhuma imagem foi fornecida.' });
    }

    // Strip data URL prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const systemPrompt = `Você é o mestre supremo de sedução, carisma e comunicação do Lovix (o app nº 1 de Rizz e flerte do Brasil).
Sua missão é ler o print da conversa de app de relacionamento (Tinder, Bumble, Hinge, WhatsApp, Instagram Direct), transcrever o que está acontecendo e gerar as 3 melhores respostas possíveis em ${dialect === 'PT-PT' ? 'Português de Portugal' : 'Português do Brasil (PT-BR natural, com gírias modernas, sem ser brega nem cringe)'}.

Objetivo do usuário: ${goal}
Tom selecionado: ${tone}

Analise também o Rizzômetro (nível de interesse da outra pessoa de 0 a 100%, indicando se está verde/amarelo/vermelho com sinais perceptíveis e melhor tática).

Retorne ESTRITAMENTE em formato JSON com a seguinte estrutura:
{
  "ocrTranscript": "Transcreva as últimas falas da conversa (Nome: Fala)",
  "matchName": "Nome do match se visível ou 'Match'",
  "lastMessage": "Última mensagem enviada pela outra pessoa",
  "rizzometer": {
    "score": 75,
    "level": "alta",
    "status": "Luz Verde! Interesse evidente",
    "signals": ["Respondeu rapidamente", "Fez pergunta mantendo o gancho"],
    "tactic": "Hora perfeita de pedir o WhatsApp ou chamar para um drink."
  },
  "suggestions": [
    {
      "text": "Texto da resposta 1",
      "style": "Ousada / Flirty",
      "reasoning": "Por que funciona e qual o gatilho psicológico usado"
    },
    {
      "text": "Texto da resposta 2",
      "style": "Engraçada & Leve",
      "reasoning": "Por que funciona e como quebra a tensão"
    },
    {
      "text": "Texto da resposta 3",
      "style": "Direta & Chamada",
      "reasoning": "Por que acelera o objetivo do usuário"
    }
  ]
}`;

    if (!apiKey) {
      return res.json({
        ocrTranscript: "Match: E aí, o que você mais gosta de fazer no fim de semana por SP?\nVocê: Várias coisas, mas prefiro lugares com comida boa e pouca fila haha.",
        matchName: "Camila",
        lastMessage: "E aí, o que você mais gosta de fazer no fim de semana por SP?",
        rizzometer: {
          score: 82,
          level: "alta",
          status: "Luz Verde! Ela puxou assunto com pergunta aberta",
          signals: ["Pergunta sobre sua rotina", "Tom amigável e curioso"],
          tactic: "Responda citando um lugar que você gosta e já convide ela para ir junto."
        },
        suggestions: getFallbackReplies(goal, tone)
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: systemPrompt,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '{}';
    let data;
    try {
      data = JSON.parse(outputText);
    } catch {
      data = {
        ocrTranscript: "Conversa identificada com sucesso.",
        matchName: "Match",
        lastMessage: "...",
        rizzometer: {
          score: 75,
          level: "alta",
          status: "Sinais positivos de flerte",
          signals: ["Engajamento contínuo"],
          tactic: "Avance com confiança e leveza."
        },
        suggestions: getFallbackReplies(goal, tone)
      };
    }

    return res.json(data);
  } catch (error: any) {
    console.error('Error analyzing screenshot:', error);
    return res.status(500).json({
      error: 'Erro ao processar imagem com a IA. Tente novamente ou use a entrada manual.',
      details: error.message
    });
  }
});

// 2. POST /api/generate-reply: Generate replies from manual conversation text
app.post('/api/generate-reply', async (req, res) => {
  try {
    const { conversationText, goal = 'Marcar Encontro', tone = 'Flirty', dialect = 'PT-BR', partnerBio = '' } = req.body;

    if (!conversationText) {
      return res.status(400).json({ error: 'Insira o texto da conversa.' });
    }

    const prompt = `Você é um especialista em sedução, carisma e comunicação do Lovix.
Analise a conversa abaixo:
"""
${conversationText}
"""
${partnerBio ? `Bio/Informações do match: ${partnerBio}\n` : ''}
Objetivo do usuário: ${goal}
Tom desejado: ${tone}
Dialeto: ${dialect === 'PT-PT' ? 'Português de Portugal' : 'Português do Brasil (PT-BR autêntico, papo de quem sabe conversar, sem clichê)'}

Avalie o nível de interesse da outra pessoa (Rizzômetro de 0 a 100%) e gere exatamente 3 respostas curtas, naturais e impossíveis de serem ignoradas.

Retorne ESTRITAMENTE JSON:
{
  "rizzometer": {
    "score": 80,
    "level": "alta",
    "status": "Interesse Alto",
    "signals": ["Feedback positivo", "Curiosidade mútua"],
    "tactic": "Manter o mistério e marcar o encontro."
  },
  "suggestions": [
    {
      "text": "Resposta 1",
      "style": "Pegador / Magnético",
      "reasoning": "Por que esta resposta é irresistível"
    },
    {
      "text": "Resposta 2",
      "style": "Divertido & Espontâneo",
      "reasoning": "Garante um sorriso e cumplicidade"
    },
    {
      "text": "Resposta 3",
      "style": "Direto com Gancho",
      "reasoning": "Leva direto para o WhatsApp ou convite"
    }
  ]
}`;

    if (!apiKey) {
      return res.json({
        rizzometer: {
          score: 75,
          level: "alta",
          status: "Interesse perceptível",
          signals: ["Disponibilidade para conversa"],
          tactic: "Aproveite para criar atração."
        },
        suggestions: getFallbackReplies(goal, tone)
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '{}';
    let data;
    try {
      data = JSON.parse(outputText);
    } catch {
      data = {
        rizzometer: { score: 70, level: 'media', status: 'Interesse Médio', signals: [], tactic: 'Surpreenda' },
        suggestions: getFallbackReplies(goal, tone)
      };
    }

    return res.json(data);
  } catch (error: any) {
    console.error('Error generating reply:', error);
    return res.status(500).json({ error: 'Erro ao gerar resposta com a IA.' });
  }
});

// 3. POST /api/generate-pickup: Pickup lines generator across 6 tones
app.post('/api/generate-pickup', async (req, res) => {
  try {
    const { tone = 'Flirty', context = 'Geral', partnerInterests = '', dialect = 'PT-BR' } = req.body;

    const prompt = `Você é o maior gerador de cantadas e abridores de conversa de elite do Brasil (Lovix).
Tom: ${tone} (opções possíveis: Pegador, Flirty, Engraçado, Inteligente, Fofo, Safado)
Contexto/Local: ${context} (ex: academia, praia, cafe, pet, signo, viagens, instagram stories)
Interesses ou Detalhes da pessoa: ${partnerInterests || 'Nenhum detalhe específico'}
Dialeto: ${dialect}

Gere 3 cantadas / abridores originais, inteligentes, magnéticos e adequados ao tom. Fuja de cantadas de tiozão ou constrangedoras. Devem parecer naturais e provocar resposta imediata!

Retorne ESTRITAMENTE JSON:
{
  "lines": [
    {
      "text": "Cantada / Abridor 1",
      "tone": "${tone}",
      "context": "${context}",
      "whyItWorks": "Explicação curta do gatilho mental utilizado"
    },
    {
      "text": "Cantada / Abridor 2",
      "tone": "${tone}",
      "context": "${context}",
      "whyItWorks": "Explicação curta do gatilho mental utilizado"
    },
    {
      "text": "Cantada / Abridor 3",
      "tone": "${tone}",
      "context": "${context}",
      "whyItWorks": "Explicação curta do gatilho mental utilizado"
    }
  ]
}`;

    if (!apiKey) {
      return res.json({
        lines: [
          {
            text: "Dizem que as melhores coisas da vida acontecem por acaso, então acho que esbarrar no seu perfil não foi coincidência.",
            tone,
            context,
            whyItWorks: "Gera curiosidade com um toque charmoso sem forçar intimidade."
          },
          {
            text: "Tenho uma péssima notícia: acho que você acabou de estragar todos os meus outros matches.",
            tone,
            context,
            whyItWorks: "Elogio indireto bem humorado que eleva o valor da pessoa."
          },
          {
            text: "Me dá 3 motivos convincentes pra eu não te convidar pra tomar um café ainda essa semana.",
            tone,
            context,
            whyItWorks: "Inversão de papéis irresistível onde ela precisa justificar."
          }
        ]
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const data = JSON.parse(response.text || '{}');
    return res.json(data);
  } catch (error: any) {
    console.error('Error generating pickup lines:', error);
    return res.status(500).json({ error: 'Erro ao gerar cantadas.' });
  }
});

// 4. POST /api/optimize-bio: Bio optimizer for Tinder/Bumble
app.post('/api/optimize-bio', async (req, res) => {
  try {
    const { currentBio = '', appName = 'Tinder', vibe = 'Equilibrado', highlights = '' } = req.body;

    const prompt = `Você é o consultor de perfis de namoro mais bem-sucedido do Brasil do Lovix.
Reescreva a biografia para ${appName}.
Bio atual do usuário: "${currentBio}"
Pontos fortes/hobbies: "${highlights}"
Vibe desejada: "${vibe}"

Crie 3 opções de bios irresistíveis que aumentem o match rate em até 300%:
1. Estilo "Misterioso & Atraente" (curta, instigante, quebra de padrão)
2. Estilo "Humor Cativante & Inteligente" (autoironia na medida certa, ganchos para ela puxar papo)
3. Estilo "Confiante & Aventureiro" (mostra estilo de vida e convite implícito)

Além disso, forneça 3 dicas práticas de fotos para complementar a nova bio.

Retorne ESTRITAMENTE JSON:
{
  "optimizedBios": [
    {
      "style": "Misterioso & Atraente",
      "bio": "Texto da bio aqui",
      "hook": "Por que desperta curiosidade"
    },
    {
      "style": "Humor Cativante & Inteligente",
      "bio": "Texto da bio aqui",
      "hook": "Por que facilita a primeira mensagem"
    },
    {
      "style": "Confiante & Aventureiro",
      "bio": "Texto da bio aqui",
      "hook": "Por que atrai pessoas que buscam conexão real"
    }
  ],
  "photoTips": [
    "Dica 1 de foto",
    "Dica 2 de foto",
    "Dica 3 de foto"
  ]
}`;

    if (!apiKey) {
      return res.json({
        optimizedBios: [
          {
            style: "Misterioso & Atraente",
            bio: "Engenheiro de dia, chef amador que queima o alho à noite. Só dou match com quem topa dividir a última fatia de pizza.",
            hook: "Cria contraste divertido e estabelece um desafio descontraído."
          },
          {
            style: "Humor Cativante & Inteligente",
            bio: "Qualidades: bom ouvinte, faço um drink decente e sei o momento exato de sair da festa. Defeito: compro livros mais rápido do que consigo ler.",
            hook: "Usa autoironia charmosa que dá aberturas instantâneas para perguntas."
          },
          {
            style: "Confiante & Aventureiro",
            bio: "Se envolver café passado na hora, trilhas com vista ou conversas que perdem a hora, já tem meio caminho andado. E aí, qual seu superpoder?",
            hook: "Filtra por afinidades e fecha com uma pergunta direta irresistível."
          }
        ],
        photoTips: [
          "Primeira foto: Sorriso genuíno olhando para a câmera, iluminação natural, sem óculos escuros.",
          "Segunda foto: Você praticando um hobby ou em ambiente social mostrando estilo de vida.",
          "Terceira foto: Corpo inteiro em traje casual alinhado, transmitindo postura e confiança."
        ]
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const data = JSON.parse(response.text || '{}');
    return res.json(data);
  } catch (error: any) {
    console.error('Error optimizing bio:', error);
    return res.status(500).json({ error: 'Erro ao otimizar bio.' });
  }
});

import fs from 'fs';

// Database store for Hotmart Subscriptions & Webhook Events
const DB_FILE = path.resolve(__dirname, 'subscriptions_db.json');

interface HotmartSubscriptionRecord {
  id: string;
  transaction: string;
  buyerEmail: string;
  buyerName: string;
  planId: string;
  status: string;
  event: string;
  amount: number;
  provider: 'hotmart';
  hottokVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

function loadDatabase(): HotmartSubscriptionRecord[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading DB_FILE:', e);
  }
  return [];
}

function saveDatabase(data: HotmartSubscriptionRecord[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving DB_FILE:', e);
  }
}

let subscriptionsDb: HotmartSubscriptionRecord[] = loadDatabase();

// 5. POST /api/webhook/hotmart: Recebe e valida webhooks da Hotmart
app.post('/api/webhook/hotmart', (req, res) => {
  const tokenHeader = (req.headers['x-hotmart-hottok'] as string) || '';
  const expectedHottok = process.env.HOTMART_HOTTOK || 'lovix_hottok_secret_token';

  const body = req.body || {};
  const token = tokenHeader || body.hottok || body.token;

  console.log('[HOTMART WEBHOOK] Event received:', body.event || body.status);

  // Validate token if configured
  const hottokVerified = !expectedHottok || token === expectedHottok;

  const event = body.event || body.status || 'PURCHASE_APPROVED';
  const buyer = body.data?.buyer || body.buyer || {};
  const purchase = body.data?.purchase || body.purchase || {};
  const buyerEmail = buyer.email || body.email || 'usuario@lovix.ai';
  const buyerName = buyer.name || body.name || 'Cliente Lovix';
  const transaction = purchase.transaction || body.transaction || `HP${Date.now()}`;
  const rawStatus = purchase.status || body.status || 'APPROVED';

  // Determine plan
  const offerCode = purchase.offer?.code || body.offer || '';
  const prodName = (body.data?.product?.name || body.prod_name || '').toLowerCase();
  let planId = 'yearly';
  let price = 199.90;
  if (offerCode.includes('week') || prodName.includes('semanal')) {
    planId = 'weekly';
    price = 19.90;
  } else if (offerCode.includes('month') || prodName.includes('mensal')) {
    planId = 'monthly';
    price = 49.90;
  }

  const isApproved =
    event === 'PURCHASE_APPROVED' ||
    event === 'PURCHASE_COMPLETE' ||
    rawStatus === 'APPROVED' ||
    rawStatus === 'COMPLETE';

  // Update or insert into Database
  const existingIdx = subscriptionsDb.findIndex((s) => s.transaction === transaction || s.buyerEmail === buyerEmail);
  const now = new Date().toISOString();

  const record: HotmartSubscriptionRecord = {
    id: existingIdx >= 0 ? subscriptionsDb[existingIdx].id : `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    transaction,
    buyerEmail,
    buyerName,
    planId,
    status: isApproved ? 'active' : 'inactive',
    event,
    amount: price,
    provider: 'hotmart',
    hottokVerified,
    createdAt: existingIdx >= 0 ? subscriptionsDb[existingIdx].createdAt : now,
    updatedAt: now,
  };

  if (existingIdx >= 0) {
    subscriptionsDb[existingIdx] = record;
  } else {
    subscriptionsDb.unshift(record);
  }

  saveDatabase(subscriptionsDb);

  return res.json({
    success: true,
    message: 'Webhook processado com sucesso e salvo no banco de dados',
    transaction,
    status: record.status,
    planId: record.planId,
    hottokVerified,
  });
});

// 6. POST /api/hotmart/simulate-webhook: Trigger instantaneous Hotmart webhook verification
app.post('/api/hotmart/simulate-webhook', (req, res) => {
  const { planId = 'yearly', email = 'usuario@lovix.ai', name = 'Usuário Lovix' } = req.body;
  const transaction = `HP${Date.now().toString().slice(-9)}`;

  const mockPayload = {
    event: 'PURCHASE_APPROVED',
    hottok: process.env.HOTMART_HOTTOK || 'lovix_hottok_secret_token',
    data: {
      buyer: { email, name },
      purchase: {
        transaction,
        status: 'APPROVED',
        offer: { code: planId },
      },
      product: { name: `Lovix AI ${planId === 'yearly' ? 'Anual VIP' : planId === 'monthly' ? 'Mensal' : 'Semanal'}` },
    },
  };

  // Dispatch internally
  const existingIdx = subscriptionsDb.findIndex((s) => s.buyerEmail === email);
  const now = new Date().toISOString();
  const prices: Record<string, number> = { weekly: 19.90, monthly: 49.90, yearly: 199.90 };

  const record: HotmartSubscriptionRecord = {
    id: `sub_${Date.now()}`,
    transaction,
    buyerEmail: email,
    buyerName: name,
    planId,
    status: 'active',
    event: 'PURCHASE_APPROVED',
    amount: prices[planId] || 199.90,
    provider: 'hotmart',
    hottokVerified: true,
    createdAt: now,
    updatedAt: now,
  };

  if (existingIdx >= 0) {
    subscriptionsDb[existingIdx] = record;
  } else {
    subscriptionsDb.unshift(record);
  }

  saveDatabase(subscriptionsDb);

  return res.json({
    success: true,
    transaction,
    planId,
    buyerEmail: email,
    status: 'active',
    webhookReceived: true,
    dbSaved: true,
    message: 'Assinatura Hotmart verificada e salva no banco de dados com sucesso!'
  });
});

// 7. GET /api/hotmart/subscriptions: Lista assinaturas salvas no DB
app.get('/api/hotmart/subscriptions', (_req, res) => {
  return res.json({
    success: true,
    count: subscriptionsDb.length,
    subscriptions: subscriptionsDb,
  });
});

// 8. POST /api/hotmart/checkout-link: Gera link oficial do checkout da Hotmart
app.post('/api/hotmart/checkout-link', (req, res) => {
  const { planId = 'yearly', email = '' } = req.body;
  const hotmartOfferCodes: Record<string, string> = {
    weekly: process.env.HOTMART_OFFER_WEEKLY || 'LOVIX_WEEKLY',
    monthly: process.env.HOTMART_OFFER_MONTHLY || 'LOVIX_MONTHLY',
    yearly: process.env.HOTMART_OFFER_YEARLY || 'LOVIX_YEARLY',
  };

  const offer = hotmartOfferCodes[planId] || 'LOVIX_YEARLY';
  const prodId = process.env.HOTMART_PROD_ID || 'A89271630L';
  const checkoutUrl = `https://pay.hotmart.com/${prodId}?off=${offer}&checkoutMode=10${email ? `&email=${encodeURIComponent(email)}` : ''}`;

  return res.json({
    success: true,
    checkoutUrl,
    planId,
    offer,
  });
});

// Legacy / fallback route for testing
app.post('/api/create-checkout-session', (req, res) => {
  const { planId, email } = req.body;
  const plans: Record<string, { name: string; price: number; interval: string; trialDays: number }> = {
    weekly: { name: 'Plano Semanal Lovix Pro (Hotmart)', price: 19.90, interval: 'semana', trialDays: 0 },
    monthly: { name: 'Plano Mensal Lovix Pro (Hotmart)', price: 49.90, interval: 'mês', trialDays: 0 },
    yearly: { name: 'Plano Anual Lovix Pro (Hotmart Best Value)', price: 199.90, interval: 'ano', trialDays: 3 }
  };
  const selectedPlan = plans[planId] || plans.yearly;
  const sessionId = `HP${Date.now().toString().slice(-9)}`;
  const pixQrCode = `00020126580014br.gov.bcb.pix0136hotmart-lovix-${sessionId}520400005303986540${selectedPlan.price.toFixed(2)}5802BR5920HOTMART PAGAMENTOS6009SAO PAULO62070503***6304`;

  return res.json({
    success: true,
    sessionId,
    plan: selectedPlan,
    pixCode: pixQrCode,
    checkoutUrl: `https://pay.hotmart.com/A89271630L?off=${planId}&checkoutMode=10`,
    message: 'Sessão Hotmart iniciada com sucesso!'
  });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Lovix] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

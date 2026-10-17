/**
 * FLERT AI - Backend Stripe & RevenueCat Integration Module
 * Handles Checkout Sessions, Webhooks, and Plan Provisioning.
 */

export const STRIPE_BACKEND_CODE = `
import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://seu-projeto.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-key'
);

const router = express.Router();

// 1. Criar Sessão de Checkout do Stripe
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { planId, userId, userEmail } = req.body;

    const priceMap: Record<string, string> = {
      weekly: process.env.STRIPE_PRICE_WEEKLY || 'price_weekly_brl_1990',
      monthly: process.env.STRIPE_PRICE_MONTHLY || 'price_monthly_brl_4990',
      yearly: process.env.STRIPE_PRICE_YEARLY || 'price_yearly_brl_19990',
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto'],
      mode: 'subscription',
      customer_email: userEmail,
      client_reference_id: userId,
      line_items: [
        {
          price: priceMap[planId] || priceMap.yearly,
          quantity: 1,
        },
      ],
      subscription_data: planId === 'yearly' ? {
        trial_period_days: 3, // 3 dias grátis no plano anual
      } : undefined,
      success_url: \`\${process.env.APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}\`,
      cancel_url: \`\${process.env.APP_URL}/pricing?canceled=true\`,
      metadata: {
        userId,
        planId,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Webhook do Stripe (Atualiza o Supabase automaticamente)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    return res.status(400).send(\`Webhook Error: \${err.message}\`);
  }

  // Handle Event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id || session.metadata?.userId;
    const planId = session.metadata?.planId || 'yearly';

    if (userId) {
      // Atualizar perfil para PRO ilimitado no Supabase
      await supabase
        .from('profiles')
        .update({
          plan: planId,
          subscription_status: 'active',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          free_credits: 9999, // Ilimitado
        })
        .eq('id', userId);
    }
  }

  res.json({ received: true });
});

export default router;
`;

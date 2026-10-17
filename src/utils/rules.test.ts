import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRizzScore,
  syncCreditState,
  consumeCredit,
  evaluateRizzometer,
  parseAndValidateHotmartWebhook,
  HOURLY_FREE_CREDITS,
  RESET_INTERVAL_MS
} from './rules.ts';

test('calculateRizzScore returns valid score and potential for quiz answers', () => {
  const result = calculateRizzScore({
    goal: 'Marcar encontros rápidos',
    gender: 'Homem buscando mulher',
    age: '22-25',
    struggle: 'Tomar vácuo no meio da conversa',
    app: 'Tinder',
    confidence: 7
  });

  assert.ok(result.score >= 35 && result.score <= 85, `Score ${result.score} should be within range 35-85`);
  assert.ok(result.potential > result.score, 'Potential should be higher than current score');
  assert.ok(result.strengths.length > 0, 'Should have strengths');
  assert.ok(result.weaknesses.length > 0, 'Should have weaknesses');
  assert.ok(result.tips.length > 0, 'Should have tactical tips');
});

test('credit system handles free credits consumption and hourly resets', () => {
  const initialTime = 1700000000000;
  const initial = {
    credits: HOURLY_FREE_CREDITS,
    lastResetTime: initialTime,
    isPro: false
  };

  // Consume 1 credit
  const step1 = consumeCredit(initial, initialTime + 1000);
  assert.equal(step1.allowed, true);
  assert.equal(step1.newState.credits, HOURLY_FREE_CREDITS - 1);

  // Consume down to 0
  let state = step1.newState;
  for (let i = 0; i < 9; i++) {
    const res = consumeCredit(state, initialTime + 2000 + i * 100);
    assert.equal(res.allowed, true);
    state = res.newState;
  }
  assert.equal(state.credits, 0);

  // Next consumption should be blocked
  const blocked = consumeCredit(state, initialTime + 10000);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.reason?.includes('créditos'));

  // After 1 hour, it resets back to HOURLY_FREE_CREDITS
  const resetState = syncCreditState(state, initialTime + RESET_INTERVAL_MS + 1000);
  assert.equal(resetState.credits, HOURLY_FREE_CREDITS);

  // Allowed again after reset
  const afterReset = consumeCredit(resetState, initialTime + RESET_INTERVAL_MS + 2000);
  assert.equal(afterReset.allowed, true);
  assert.equal(afterReset.newState.credits, HOURLY_FREE_CREDITS - 1);
});

test('credit system gives unlimited access to Pro users', () => {
  const proState = {
    credits: 0,
    lastResetTime: Date.now(),
    isPro: true
  };

  const res = consumeCredit(proState);
  assert.equal(res.allowed, true);
  assert.equal(res.newState.isPro, true);
});

test('evaluateRizzometer returns correct green/yellow/red levels', () => {
  const green = evaluateRizzometer(82);
  assert.equal(green.level, 'alta');
  assert.equal(green.color, 'green');

  const yellow = evaluateRizzometer(55);
  assert.equal(yellow.level, 'media');
  assert.equal(yellow.color, 'yellow');

  const red = evaluateRizzometer(25);
  assert.equal(red.level, 'baixa');
  assert.equal(red.color, 'red');
});

test('parseAndValidateHotmartWebhook correctly parses purchase event and validates hottok', () => {
  const validPayload = {
    event: 'PURCHASE_APPROVED',
    data: {
      buyer: { email: 'ricardo@gmail.com', name: 'Ricardo Silva' },
      purchase: {
        transaction: 'HP192837465',
        status: 'APPROVED',
        offer: { code: 'anual_vip' }
      },
      product: { name: 'Lovix Pro Anual' }
    }
  };

  const res = parseAndValidateHotmartWebhook(validPayload, 'secret_token_123', 'secret_token_123');
  assert.equal(res.isValid, true);
  assert.equal(res.parsedEvent?.isApproved, true);
  assert.equal(res.parsedEvent?.buyerEmail, 'ricardo@gmail.com');
  assert.equal(res.parsedEvent?.transaction, 'HP192837465');
  assert.equal(res.parsedEvent?.planId, 'yearly');

  // Failed token check
  const invalidToken = parseAndValidateHotmartWebhook(validPayload, 'wrong_token', 'secret_token_123');
  assert.equal(invalidToken.isValid, false);
  assert.ok(invalidToken.error?.includes('Token'));
});


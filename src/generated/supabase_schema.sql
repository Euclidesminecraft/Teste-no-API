-- ==============================================================================
-- LOVIX AI - SUPABASE POSTGRESQL SCHEMA (Produção & Hotmart Webhook Ready)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Perfis de Usuário
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'weekly', 'monthly', 'yearly')),
    subscription_status TEXT DEFAULT 'inactive',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    free_credits INTEGER NOT NULL DEFAULT 10,
    credits_last_reset TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    rizz_score INTEGER DEFAULT 0,
    preferred_app TEXT DEFAULT 'Tinder',
    dating_goal TEXT DEFAULT 'Marcar Encontro',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabela de Conversas e Prints Analisados (com respeito à LGPD)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    app_source TEXT NOT NULL DEFAULT 'Tinder', -- Tinder, Bumble, WhatsApp, Insta
    ocr_text TEXT,
    match_name TEXT DEFAULT 'Match',
    rizzometer_score INTEGER,
    rizzometer_level TEXT CHECK (rizzometer_level IN ('alta', 'media', 'baixa')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tabela de Histórico de Gerações (Respostas & Cantadas)
CREATE TABLE IF NOT EXISTS public.generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('screenshot_reply', 'manual_reply', 'pickup_line', 'bio_optimization')),
    tone TEXT NOT NULL,
    goal TEXT,
    chosen_reply TEXT NOT NULL,
    all_suggestions JSONB,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tabela de Histórico de Assinaturas e Pagamentos (Stripe & RevenueCat)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('stripe', 'revenuecat', 'pix')),
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL,
    amount_in_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'BRL',
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Habilitar RLS (Row Level Security) em Todas as Tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de Acesso Seguro (Usuário só acessa seus próprios dados)
CREATE POLICY "Usuários podem ver seu próprio perfil" 
    ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuários podem ver suas conversas" 
    ON public.conversations FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem gerenciar suas gerações" 
    ON public.generations FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem ver suas assinaturas" 
    ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- 8. Função para Reset Automático de 10 Créditos por Hora
CREATE OR REPLACE FUNCTION public.check_and_reset_hourly_credits(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    current_credits INTEGER;
    last_reset TIMESTAMPTZ;
    user_plan TEXT;
BEGIN
    SELECT free_credits, credits_last_reset, plan 
    INTO current_credits, last_reset, user_plan
    FROM public.profiles
    WHERE id = target_user_id;

    -- Se for usuário PRO, créditos são ilimitados (9999)
    IF user_plan <> 'free' THEN
        RETURN 9999;
    END IF;

    -- Se passou 1 hora desde o último reset, reabastece 10 créditos
    IF NOW() - last_reset >= INTERVAL '1 hour' THEN
        UPDATE public.profiles
        SET free_credits = 10,
            credits_last_reset = NOW()
        WHERE id = target_user_id;
        RETURN 10;
    END IF;

    RETURN current_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

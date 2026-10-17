import React, { useState } from 'react';
import { X, Copy, Check, Smartphone, Database, CreditCard, Code, FileText } from 'lucide-react';
import { copyToClipboardSafe } from '../utils/clipboard';
import { EXPO_MOBILE_CODE } from '../generated/expo_mobile_app';
import { STRIPE_BACKEND_CODE } from '../generated/stripe_integration';

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'expo' | 'supabase' | 'stripe' | 'env'>('expo');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const supabaseSchema = `-- ==============================================================================
-- LOVIX - SUPABASE POSTGRESQL SCHEMA (Produção)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Perfis de Usuário
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

-- Conversas Analisadas
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    app_source TEXT NOT NULL DEFAULT 'Tinder',
    ocr_text TEXT,
    match_name TEXT DEFAULT 'Match',
    rizzometer_score INTEGER,
    rizzometer_level TEXT CHECK (rizzometer_level IN ('alta', 'media', 'baixa')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gerações de Respostas e Cantadas
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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso seguro perfil" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Acesso seguro conversas" ON public.conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Acesso seguro gerações" ON public.generations FOR ALL USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.check_and_reset_hourly_credits(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    current_credits INTEGER;
    last_reset TIMESTAMPTZ;
    user_plan TEXT;
BEGIN
    SELECT free_credits, credits_last_reset, plan 
    INTO current_credits, last_reset, user_plan
    FROM public.profiles WHERE id = target_user_id;

    IF user_plan <> 'free' THEN
        RETURN 9999;
    END IF;

    IF NOW() - last_reset >= INTERVAL '1 hour' THEN
        UPDATE public.profiles
        SET free_credits = 10, credits_last_reset = NOW()
        WHERE id = target_user_id;
        RETURN 10;
    END IF;

    RETURN current_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`;

  const envConfig = `# Lovix - Environment Variables (.env)
PORT=3000
GEMINI_API_KEY="seu_gemini_api_key_aqui"
APP_URL="https://web.lovix.ai"

# Supabase
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="service-role-key"
NEXT_PUBLIC_SUPABASE_ANON_KEY="anon-key"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_WEEKLY="price_semanal_1990"
STRIPE_PRICE_MONTHLY="price_mensal_4990"
STRIPE_PRICE_YEARLY="price_anual_19990"`;

  const getCodeContent = () => {
    switch (activeTab) {
      case 'expo':
        return EXPO_MOBILE_CODE.trim();
      case 'supabase':
        return supabaseSchema.trim();
      case 'stripe':
        return STRIPE_BACKEND_CODE.trim();
      case 'env':
        return envConfig.trim();
      default:
        return '';
    }
  };

  const handleCopy = async () => {
    await copyToClipboardSafe(getCodeContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0e101c] border-t sm:border border-[#232942] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl text-white max-h-[92vh] overflow-y-auto no-scrollbar">
        
        <div className="w-12 h-1 bg-gray-600/40 rounded-full mx-auto mb-3 sm:hidden"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full active:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block mb-0.5">
            Código Turnkey Lovix
          </span>
          <h2 className="text-xl font-black text-white">App Mobile Expo + Supabase</h2>
          <p className="text-xs text-gray-400">
            Arquitetura pronta para deploy no Expo e Supabase.
          </p>
        </div>

        {/* Tab Selector Horizontal */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3">
          <button
            onClick={() => setActiveTab('expo')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
              activeTab === 'expo' ? 'bg-[#ff2a6d] text-white' : 'bg-[#141728] text-gray-400'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Expo (App.tsx)</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
              activeTab === 'supabase' ? 'bg-[#ff2a6d] text-white' : 'bg-[#141728] text-gray-400'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase SQL</span>
          </button>

          <button
            onClick={() => setActiveTab('stripe')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
              activeTab === 'stripe' ? 'bg-[#ff2a6d] text-white' : 'bg-[#141728] text-gray-400'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Stripe Backend</span>
          </button>

          <button
            onClick={() => setActiveTab('env')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
              activeTab === 'env' ? 'bg-[#ff2a6d] text-white' : 'bg-[#141728] text-gray-400'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>.env</span>
          </button>
        </div>

        {/* Code Box */}
        <div className="relative bg-[#070912] border border-[#1b2036] rounded-xl p-3 max-h-[260px] overflow-auto no-scrollbar mb-3">
          <pre className="text-[11px] text-emerald-400 font-mono whitespace-pre selection:bg-[#ff2a6d]">
            {getCodeContent()}
          </pre>
        </div>

        <button
          onClick={handleCopy}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-[#ff2a6d] to-[#05d9e8] text-white font-black text-xs shadow-md shadow-[#ff2a6d]/20 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Código Copiado com Sucesso!' : 'Copiar Código da Aba'}</span>
        </button>

      </div>
    </div>
  );
};

'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Settings,
  CreditCard,
  LogOut,
  ArrowUpRight,
  Loader2,
  Users,
  Crown,
  Smartphone,
  Brain,
  Save,
  Edit3,
  Activity,
  Zap,
  Shield,
  MessageSquare,
  ChevronRight,
  Power,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

// --- TEMPLATES DE IA ESTRATÉGICOS ---
const PROMPT_TEMPLATES = {
  engenharia: `# Personalidade\nConsultor técnico especializado em projetos de engenharia e energia solar. Tom profissional e preciso.\n\n# Objetivo\nQualificar o lead e coletar dados para orçamento.\n\n# Instruções\n1. Pergunte o tipo de projeto (Civil, Elétrico ou Solar).\n2. Para Solar, peça a média da conta de luz.\n3. Para Civil/Elétrico, pergunte se já possui terreno.\n4. Solicite e-mail para enviar o portfólio de obras realizadas.`,

  imobiliaria: `# Personalidade\nAssistente de vendas entusiasta e focado em oportunidades de investimento.\n\n# Objetivo\nAgendar visitas aos imóveis ou lotes.\n\n# Instruções\n1. Identifique se é para moradia ou investimento.\n2. Destaque a valorização da região.\n3. Use escassez: "Últimas unidades com preço de lançamento".\n4. Ofereça dois horários para visita.`,

  saude: `# Personalidade\nAtendente de clínica acolhedor, organizado e direto.\n\n# Objetivo\nRealizar triagem inicial e agendamento.\n\n# Instruções\n1. Identifique a especialidade desejada.\n2. Pergunte o convênio médico.\n3. Verifique a urgência do atendimento.\n4. Informe que a recepção confirmará o horário em breve.`,

  vendas: `# Personalidade\nVendedor ágil, focado em fechar negócio e resolver objeções.\n\n# Objetivo\nLevar o cliente ao checkout ou link de pagamento.\n\n# Instruções\n1. Se o cliente tiver dúvidas, mencione a garantia de satisfação.\n2. Tente identificar o principal problema do cliente.\n3. Sempre termine com uma pergunta para manter a venda ativa.`
};

// --- INTERFACES ---
interface Subscription {
  id: string;
  status: string;
  currentPeriodEnd: string | null;
  messagesUsed: number;
  messageLimit: number | null;
  plan: {
    id: string;
    name: string;
    price: number;
    features: string[];
  };
}

interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface WhatsAppStatus {
  status: 'not_configured' | 'disconnected' | 'connecting' | 'connected' | 'error';
  instanceName?: string;
  isHealthy?: boolean;
  qrcode?: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [leadsCount, setLeadsCount] = useState<number>(0);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelingSubscription, setCancelingSubscription] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus>({ status: 'not_configured' });
  const [loadingWhatsApp, setLoadingWhatsApp] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [savingAgent, setSavingAgent] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchSubscription();
      fetchWhatsAppStatus();
      fetchAgentConfig();
      fetchLeadsCount();
    }
  }, [session]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showQrModal) {
      interval = setInterval(() => {
        fetchWhatsAppStatus();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showQrModal]);

  const fetchLeadsCount = async () => {
    try {
      const res = await fetch('/api/crm/leads');
      if (res.ok) {
        const data = await res.json();
        setLeadsCount(data.leads?.length || 0);
      }
    } catch (error) { console.error(error); }
  };

  const fetchWhatsAppStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/status');
      const data = await response.json();
      if (response.ok && data.success) {
        if (!data.hasInstance) setWhatsappStatus({ status: 'not_configured' });
        else if (data.connected) {
          setWhatsappStatus({ status: 'connected', instanceName: data.instanceName, isHealthy: true });
          setShowQrModal(false);
        } else {
          setWhatsappStatus({ status: data.qrcode ? 'connecting' : 'disconnected', qrcode: data.qrcode });
        }
      }
    } catch (error) { setWhatsappStatus({ status: 'error' }); }
  };

  const fetchAgentConfig = async () => {
    try {
      const response = await fetch('/api/n8n/save-prompt');
      const data = await response.json();
      if (response.ok && data.success) {
        setAiPrompt(data.data.aiPrompt || '');
        setAiEnabled(data.data.aiEnabled ?? true);
      }
    } catch (error) { console.error(error); }
  };

  const handleSaveAgentConfig = async () => {
    setSavingAgent(true);
    try {
      await fetch('/api/n8n/save-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiPrompt, aiEnabled, agentName: 'ZapFlow' })
      });
      toast.success('Configurações salvas com sucesso');
    } catch (error) { toast.error('Erro ao salvar configurações'); }
    finally { setSavingAgent(false); }
  };

  const handleToggleAI = async () => {
    const newValue = !aiEnabled;
    setAiEnabled(newValue);
    try {
      await fetch('/api/n8n/save-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiEnabled: newValue })
      });
      toast.success(newValue ? 'IA ativada' : 'IA pausada');
    } catch (error) { setAiEnabled(!newValue); }
  };

  const handleConnectWhatsApp = async () => {
    setLoadingWhatsApp(true);
    const loadingToast = toast.loading('Gerando QR Code...');
    try {
      const response = await fetch('/api/whatsapp/qrcode');
      const data = await response.json();
      if (data.qrcode) {
        setQrCodeData(data.qrcode);
        setShowQrModal(true);
        toast.success('QR Code pronto!', { id: loadingToast });
      } else if (data.connected) {
        toast.success('Dispositivo já conectado!', { id: loadingToast });
        fetchWhatsAppStatus();
      } else {
        toast.error('Tente novamente em instantes.', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Falha na conexão.', { id: loadingToast });
    } finally {
      setLoadingWhatsApp(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    if (!confirm('Deseja desconectar o WhatsApp?')) return;
    setLoadingWhatsApp(true);
    const loadingToast = toast.loading('Desconectando...');
    try {
      await fetch('/api/whatsapp/disconnect', { method: 'POST' });
      setWhatsappStatus({ status: 'disconnected' });
      toast.success('Desconectado!', { id: loadingToast });
    } catch (error) {
      toast.error('Erro ao desconectar', { id: loadingToast });
    } finally {
      setLoadingWhatsApp(false);
    }
  };

  const handleLogout = async () => {
    signOut({ callbackUrl: '/' });
  };

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription');
      const data = await response.json();
      if (response.ok) {
        setSubscription(data.subscription);
        setUserData(data.user);
      }
    } catch (error) {
      console.error('[DASHBOARD] Erro ao buscar assinatura:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) return;
    setCancelingSubscription(true);
    try {
      const response = await fetch('/api/cancel-subscription', { method: 'POST' });
      if (response.ok) {
        toast.success('Assinatura cancelada.');
        setTimeout(() => { handleLogout(); }, 1500);
      } else {
        toast.error('Erro ao cancelar.');
      }
    } catch (error) {
      toast.error('Erro de conexão.');
    } finally {
      setCancelingSubscription(false);
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price / 100);

  // --- Loading State ---
  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      <p className="mt-3 text-zinc-500 text-sm">Carregando dashboard...</p>
    </div>
  );

  if (!session) return null;

  const usagePercent = subscription?.messageLimit
    ? Math.min((subscription.messagesUsed / subscription.messageLimit) * 100, 100)
    : 0;

  // --- NAV ITEMS ---
  const navItems = [
    { id: 'overview', icon: Activity, label: 'Visão Geral' },
    { id: 'agent', icon: Brain, label: 'Agente IA' },
    { id: 'subscription', icon: CreditCard, label: 'Assinatura' },
    { id: 'settings', icon: Settings, label: 'Configurações' }
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-zinc-200 font-sans antialiased">
      {/* ============================================================ */}
      {/* SIDEBAR — Limpa, sem glow excessivo                          */}
      {/* ============================================================ */}
      <aside className="fixed left-0 top-0 h-screen w-16 lg:w-64 bg-[#0a0a0f] border-r border-zinc-800/50 z-50 hidden md:flex flex-col">
        {/* Logo */}
        <div className="p-4 lg:px-6 lg:py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight hidden lg:block">
            Zap<span className="text-emerald-400">Flow</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 lg:px-3 mt-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm
                ${activeTab === item.id
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
            >
              <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${activeTab === item.id ? 'text-emerald-400' : ''}`} />
              <span className="hidden lg:block font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 lg:p-3 border-t border-zinc-800/50">
          <Link href="/crm" className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-500 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all text-sm mb-1">
            <MessageSquare className="w-[18px] h-[18px] flex-shrink-0" />
            <span className="hidden lg:block font-medium">CRM</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto hidden lg:block" />
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all text-sm">
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            <span className="hidden lg:block font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MAIN CONTENT                                                  */}
      {/* ============================================================ */}
      <div className="md:ml-16 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-zinc-800/50 px-6 lg:px-8 py-4 flex justify-between items-center z-40">
          <div>
            <h1 className="text-lg font-semibold text-white">
              Olá, {session?.user?.name?.split(' ')[0]}
            </h1>
            <p className="text-xs text-zinc-600">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Status Indicator */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${whatsappStatus.status === 'connected'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-zinc-800/50 text-zinc-500 border-zinc-700/50'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${whatsappStatus.status === 'connected' ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
              {whatsappStatus.status === 'connected' ? 'WhatsApp Online' : 'WhatsApp Offline'}
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 text-sm font-semibold">
              {session?.user?.name?.[0]}
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">

            {/* ============================================================ */}
            {/* TAB: VISÃO GERAL                                             */}
            {/* ============================================================ */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Bento Grid — Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Bot Status */}
                  <div className={`rounded-xl border p-5 transition-all ${aiEnabled ? 'bg-emerald-500/[0.04] border-emerald-500/15' : 'bg-red-500/[0.04] border-red-500/15'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${aiEnabled ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                        <Bot className={`w-5 h-5 ${aiEnabled ? 'text-emerald-400' : 'text-red-400'}`} />
                      </div>
                      <span className={`w-2 h-2 rounded-full ${aiEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-0.5">{aiEnabled ? 'Online' : 'Pausado'}</h3>
                    <p className="text-zinc-500 text-xs">Status do Agente IA</p>
                  </div>

                  {/* Leads */}
                  <Link href="/crm" className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-5 hover:border-zinc-700 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-400" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-zinc-700 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-0.5">{leadsCount}</h3>
                    <p className="text-zinc-500 text-xs">Leads capturados</p>
                  </Link>

                  {/* WhatsApp */}
                  <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${whatsappStatus.status === 'connected' ? 'bg-emerald-500/10' : 'bg-zinc-800'}`}>
                        <Smartphone className={`w-5 h-5 ${whatsappStatus.status === 'connected' ? 'text-emerald-400' : 'text-zinc-500'}`} />
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${whatsappStatus.status === 'connected' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                        }`}>
                        {whatsappStatus.status === 'connected' ? 'CONECTADO' : 'OFFLINE'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-0.5">
                      {whatsappStatus.status === 'connected' ? 'Dispositivo ativo' : 'Sem conexão'}
                    </h3>
                    <p className="text-zinc-500 text-xs">WhatsApp Business</p>
                  </div>
                </div>

                {/* Usage Bar */}
                {subscription && (
                  <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-400" />
                          Consumo de Mensagens
                        </h2>
                        <p className="text-zinc-600 text-xs mt-0.5">Ciclo atual</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {subscription.plan?.name || 'Free'}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5 mb-3">
                      <span className="text-3xl font-bold text-white">{subscription.messagesUsed}</span>
                      <span className="text-zinc-600 text-sm">/ {subscription.messageLimit || '∞'}</span>
                    </div>

                    {subscription.messageLimit && (
                      <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${usagePercent >= 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* WhatsApp Connection Card */}
                <div className={`rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border transition-all ${whatsappStatus.status === 'connected'
                    ? 'bg-emerald-500/[0.03] border-emerald-500/15'
                    : 'border-dashed border-zinc-800 bg-zinc-900/30'
                  }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${whatsappStatus.status === 'connected' ? 'bg-emerald-500/10' : 'bg-zinc-800'
                      }`}>
                      <Smartphone className={`w-6 h-6 ${whatsappStatus.status === 'connected' ? 'text-emerald-400' : 'text-zinc-500'}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {whatsappStatus.status === 'connected' ? 'WhatsApp conectado' : 'Conecte seu WhatsApp'}
                      </h3>
                      <p className="text-zinc-500 text-xs">
                        {whatsappStatus.status === 'connected' ? 'Seu agente está atendendo clientes agora' : 'Escaneie o QR Code para ativar o atendimento'}
                      </p>
                    </div>
                  </div>
                  {whatsappStatus.status === 'connected' ? (
                    <button onClick={handleDisconnectWhatsApp} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 text-xs font-semibold transition-all flex items-center gap-2">
                      <Power className="w-3.5 h-3.5" />
                      Desconectar
                    </button>
                  ) : (
                    <button onClick={handleConnectWhatsApp} disabled={loadingWhatsApp} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition-all flex items-center gap-2 hover:shadow-lg hover:shadow-emerald-500/20">
                      {loadingWhatsApp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5" />}
                      Conectar WhatsApp
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ============================================================ */}
            {/* TAB: AGENTE IA                                               */}
            {/* ============================================================ */}
            {activeTab === 'agent' && (
              <motion.div
                key="agent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 overflow-hidden">
                  {/* Header */}
                  <div className="p-6 border-b border-zinc-800/50">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                          <Brain className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-white">Agente de Inteligência Artificial</h2>
                          <p className="text-zinc-500 text-xs">Configure como sua IA atende os clientes</p>
                        </div>
                      </div>

                      <button
                        onClick={handleToggleAI}
                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${aiEnabled
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${aiEnabled ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {aiEnabled ? 'IA Ativa' : 'IA Pausada'}
                      </button>
                    </div>
                  </div>

                  {/* Templates */}
                  <div className="p-6 border-b border-zinc-800/50">
                    <p className="text-zinc-500 text-xs font-medium mb-3">Templates prontos para seu nicho:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(PROMPT_TEMPLATES).map((nicho) => (
                        <button
                          key={nicho}
                          onClick={() => { setAiPrompt(PROMPT_TEMPLATES[nicho as keyof typeof PROMPT_TEMPLATES]); toast.success(`Template "${nicho}" carregado`); }}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-zinc-300 rounded-md text-xs font-medium transition-all capitalize"
                        >
                          {nicho}
                        </button>
                      ))}
                      <button
                        onClick={() => { setAiPrompt(''); toast('Campo limpo'); }}
                        className="px-3 py-1.5 border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 rounded-md text-xs font-medium transition-all flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        Personalizado
                      </button>
                    </div>
                  </div>

                  {/* Editor */}
                  <div className="p-6">
                    <div className="bg-[#0a0a0f] border border-zinc-800 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                        <div className="flex gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                        </div>
                        <span className="text-[10px] text-zinc-600">prompt.md</span>
                      </div>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        rows={14}
                        className="w-full bg-transparent p-5 text-emerald-400/90 font-mono text-sm leading-relaxed outline-none resize-y placeholder-zinc-700 selection:bg-emerald-500/20"
                        placeholder="# Digite as diretrizes da IA aqui...&#10;&#10;Descreva a personalidade, o objetivo e as instruções do seu agente."
                      />
                    </div>

                    <button
                      onClick={handleSaveAgentConfig}
                      disabled={savingAgent}
                      className="mt-4 w-full bg-emerald-500 hover:bg-emerald-400 text-black py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {savingAgent ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Salvar Configurações
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ============================================================ */}
            {/* TAB: ASSINATURA                                              */}
            {/* ============================================================ */}
            {activeTab === 'subscription' && (
              <motion.div
                key="subscription"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="max-w-xl mx-auto space-y-6"
              >
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-6">
                  <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-zinc-400" />
                    Sua Assinatura
                  </h2>

                  <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 rounded-xl p-6 border border-zinc-700/50 mb-6">
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Plano Ativo</p>
                    <div className="flex items-baseline gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-white">{subscription?.plan.name || 'Trial'}</h3>
                      <span className="text-emerald-400 text-sm font-medium">{formatPrice(subscription?.plan.price || 0)}/mês</span>
                    </div>
                    {subscription?.currentPeriodEnd && (
                      <p className="text-zinc-600 text-xs">
                        Renova em {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <a
                      href="https://wa.me/556297027948?text=Olá!%20Gostaria%20de%20mudar%20meu%20plano"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black text-center py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Crown className="w-4 h-4" />
                      Fazer Upgrade
                    </a>
                    <button
                      onClick={handleCancelSubscription}
                      disabled={cancelingSubscription}
                      className="flex-1 border border-zinc-700 text-zinc-400 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800/50 hover:text-red-400 hover:border-red-500/30 transition-all"
                    >
                      {cancelingSubscription ? 'Cancelando...' : 'Cancelar Plano'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ============================================================ */}
            {/* TAB: CONFIGURAÇÕES                                           */}
            {/* ============================================================ */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="max-w-xl mx-auto"
              >
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-6">
                  <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-zinc-400" />
                    Dados da Conta
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-800/50">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-medium">Nome</label>
                      <div className="text-white text-sm">{userData?.name || session?.user?.name}</div>
                    </div>
                    <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-800/50">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-medium">Email</label>
                      <div className="text-zinc-300 text-sm">{userData?.email || session?.user?.email}</div>
                    </div>
                    <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-800/50">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-medium">Membro desde</label>
                      <div className="text-zinc-500 text-sm">{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('pt-BR') : '—'}</div>
                    </div>
                  </div>
                  <button onClick={() => signOut()} className="mt-6 text-red-400 text-sm hover:text-red-300 transition-colors flex items-center gap-2">
                    <LogOut className="w-3.5 h-3.5" />
                    Encerrar sessão neste dispositivo
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL QR CODE                                                */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showQrModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 text-center max-w-sm w-full"
            >
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Conectar WhatsApp</h3>
              <p className="text-zinc-500 text-xs mb-6">Abra o WhatsApp no celular e escaneie o QR Code</p>

              <div className="bg-white p-3 rounded-xl inline-block mb-6">
                {qrCodeData ? (
                  <img src={qrCodeData.startsWith('data:') ? qrCodeData : `data:image/png;base64,${qrCodeData}`} alt="QR Code" className="w-56 h-56" />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowQrModal(false)}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 rounded-lg font-medium text-sm transition-all border border-zinc-700"
              >
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

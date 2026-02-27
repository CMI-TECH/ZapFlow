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
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Loader2,
  Users,
  Crown,
  Smartphone,
  Brain,
  Save,
  Edit3,
  Cpu,
  Activity,
  Terminal,
  Shield,
  Zap
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

  // Polling para fechar o QR Code automaticamente quando conectar
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showQrModal) {
      interval = setInterval(() => {
        fetchWhatsAppStatus();
      }, 3000); // Verifica a cada 3 segundos
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
      toast.success('PROTOCOLO SALVO');
    } catch (error) { toast.error('FALHA NO SISTEMA'); }
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
      toast.success(newValue ? 'NÚCLEO IA ATIVADO' : 'NÚCLEO IA PAUSADO');
    } catch (error) { setAiEnabled(!newValue); }
  };

  const handleConnectWhatsApp = async () => {
    setLoadingWhatsApp(true);
    const loadingToast = toast.loading('Iniciando protocolos de sincronização...');
    try {
      const response = await fetch('/api/whatsapp/qrcode');
      const data = await response.json();
      if (data.qrcode) {
        setQrCodeData(data.qrcode);
        setShowQrModal(true);
        toast.success('QR Code gerado!', { id: loadingToast });
      } else if (data.connected) {
        toast.success('Dispositivo já conectado!', { id: loadingToast });
        fetchWhatsAppStatus();
      } else {
        toast.error('Gargalo na rede, tente novamente em instantes.', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Falha crítica na conexão.', { id: loadingToast });
    } finally {
      setLoadingWhatsApp(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    if (!confirm('Deseja encerrar a conexão neural com o WhatsApp?')) return;
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
    const loadingToast = toast.loading('Encerrando conexão...');
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
    if (!confirm('AVISO: O cancelamento resultará em perda de acesso ao sistema. Confirmar?')) return;
    setCancelingSubscription(true);
    try {
      const response = await fetch('/api/cancel-subscription', { method: 'POST' });
      if (response.ok) {
        toast.success('Assinatura encerrada.');
        setTimeout(() => {
          handleLogout();
        }, 1500);
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

  // --- RENDERIZAÇÃO FUTURISTA ---

  if (loading) return (
    <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#030014] to-[#030014]"></div>
      <Loader2 className="w-12 h-12 text-cyan-400 animate-spin relative z-10" />
      <p className="mt-4 text-cyan-500/50 font-mono text-sm tracking-[0.2em] animate-pulse relative z-10">INICIALIZANDO SISTEMA...</p>
    </div>
  );

  if (!session) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-slate-200 selection:bg-cyan-500/30 font-sans overflow-x-hidden">
      {/* Background Gradients & Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
      </div>

      {/* Sidebar Glassmorphic */}
      <aside className="fixed left-0 top-0 h-screen w-20 lg:w-72 bg-black/40 backdrop-blur-xl border-r border-white/5 z-50 transition-all duration-300 hidden md:block">
        <div className="p-6 flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-wider text-white hidden lg:block">
            ZAP<span className="text-cyan-400">FLOW</span>
          </span>
        </div>

        <nav className="px-4 space-y-2">
          {[
            { id: 'overview', icon: Activity, label: 'CENTRAL DE COMANDO' },
            { id: 'agent', icon: Brain, label: 'INTELIGÊNCIA ARTIFICIAL' },
            { id: 'subscription', icon: CreditCard, label: 'PLANO & ACESSO' },
            { id: 'settings', icon: Settings, label: 'CONFIGURAÇÕES' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all border border-transparent group relative overflow-hidden
                ${activeTab === item.id
                  ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(8,145,178,0.1)]'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : ''}`} />
              <span className="font-medium text-xs tracking-widest hidden lg:block">{item.label}</span>
              {activeTab === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all group">
            <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            <span className="hidden lg:block text-sm font-bold">SAIR (LOGOUT)</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-20 lg:ml-72 relative z-10">
        {/* Header HUD */}
        <header className="sticky top-0 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 px-8 py-5 flex justify-between items-center z-40">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-6 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]"></span>
              OLÁ, {session?.user?.name?.split(' ')[0].toUpperCase()}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">SISTEMA ONLINE • {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-cyan-500/30 bg-cyan-950/30 flex items-center justify-center text-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            {session?.user?.name?.[0]}
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">

            {/* --- ABA VISÃO GERAL --- */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                {/* Stats Grid HUD Style */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Status IA */}
                  <div className={`relative group overflow-hidden rounded-2xl border p-6 transition-all duration-500 ${aiEnabled ? 'bg-emerald-950/10 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]' : 'bg-red-950/10 border-red-500/20'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <Cpu className={`w-8 h-8 ${aiEnabled ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'text-red-400'}`} />
                      <div className={`h-2 w-2 rounded-full ${aiEnabled ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`} />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1 font-mono">{aiEnabled ? 'ATIVO' : 'PAUSADO'}</h3>
                    <p className="text-slate-400 text-xs tracking-wider uppercase">Status do Bot</p>
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Leads CRM */}
                  <Link href="/crm" className="relative group overflow-hidden rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/50 p-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                    <div className="flex items-center justify-between mb-4">
                      <Users className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                      <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-1 font-mono tracking-tighter">{leadsCount}</h3>
                    <p className="text-slate-400 text-xs tracking-wider uppercase">Leads Capturados</p>
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Users className="w-24 h-24 text-purple-500 transform rotate-12" />
                    </div>
                  </Link>

                  {/* WhatsApp Connection */}
                  <div className={`relative rounded-2xl border p-6 bg-slate-900/40 backdrop-blur-sm ${whatsappStatus.status === 'connected' ? 'border-cyan-500/30' : 'border-slate-800'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <Smartphone className={`w-8 h-8 ${whatsappStatus.status === 'connected' ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${whatsappStatus.status === 'connected' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-800 text-slate-400'}`}>
                        {whatsappStatus.status === 'connected' ? 'ONLINE' : 'OFFLINE'}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {whatsappStatus.status === 'connected' ? 'Dispositivo Conectado' : 'Sem Sinal'}
                    </h3>
                    <p className="text-slate-400 text-xs tracking-wider uppercase">Conexão Neural</p>
                  </div>
                </div>

                {/* Subscription Usage Bar */}
                {subscription && (
                  <div className="relative rounded-2xl bg-black/40 border border-white/10 p-8 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-20"></div>

                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          <Zap className="w-5 h-5 text-yellow-400" />
                          CONSUMO DE MENSAGENS
                        </h2>
                        <p className="text-slate-500 text-xs mt-1">Ciclo atual</p>
                      </div>
                      {subscription.plan?.name === 'Free' && (
                        <span className="px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center gap-2 shadow-lg shadow-purple-900/20">
                          <Crown className="w-3 h-3" /> PLANO GRATUITO
                        </span>
                      )}
                    </div>

                    <div className="flex items-end gap-2 mb-4 font-mono">
                      <span className="text-4xl font-bold text-white">{subscription.messagesUsed}</span>
                      <span className="text-xl text-slate-600 mb-1">/ {subscription.messageLimit || '∞'}</span>
                    </div>

                    {subscription.messageLimit && (
                      <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${(subscription.messagesUsed / subscription.messageLimit) >= 0.8 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]'}`}
                          style={{ width: `${Math.min((subscription.messagesUsed / subscription.messageLimit) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Botão de Conexão */}
                <div className={`rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-500 border ${whatsappStatus.status === 'connected'
                    ? 'bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.05)]'
                    : 'border-dashed border-slate-700 bg-slate-900/20'
                  }`}>
                  <h2 className={`text-lg font-bold mb-4 transition-colors ${whatsappStatus.status === 'connected' ? 'text-emerald-400' : 'text-slate-300'
                    }`}>
                    {whatsappStatus.status === 'connected' ? 'WHATSAPP CONECTADO' : 'Dispositivo de Comunicação'}
                  </h2>
                  {whatsappStatus.status === 'connected' ? (
                    <button onClick={handleDisconnectWhatsApp} className="group relative px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 font-bold tracking-wider text-sm transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                      <span className="relative z-10 flex items-center gap-2">
                        <Smartphone className="w-4 h-4" /> DESCONECTAR DISPOSITIVO
                      </span>
                    </button>
                  ) : (
                    <button onClick={handleConnectWhatsApp} className="group relative px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded-lg transition-all overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                      <span className="relative z-10 flex items-center gap-2 tracking-widest text-sm">
                        <Smartphone className="w-4 h-4" /> SINCRONIZAR WHATSAPP
                      </span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* --- ABA AGENTE IA --- */}
            {activeTab === 'agent' && (
              <motion.div
                key="agent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-[#0a0a0a] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative">
                  {/* Decorative Header Line */}
                  <div className="h-1 w-full bg-gradient-to-r from-purple-600 via-cyan-500 to-blue-600"></div>

                  <div className="p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-cyan-950/30 rounded-xl border border-cyan-500/30">
                          <Brain className="w-8 h-8 text-cyan-400" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white tracking-tight">Núcleo de Inteligência</h2>
                          <p className="text-slate-500 text-sm">Configure o comportamento neural do seu bot</p>
                        </div>
                      </div>

                      <button
                        onClick={handleToggleAI}
                        className={`px-6 py-3 rounded-lg font-bold text-xs tracking-widest border transition-all shadow-lg ${aiEnabled
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 hover:shadow-emerald-500/20'
                          : 'bg-red-500/10 border-red-500/50 text-red-400 hover:shadow-red-500/20'}`}
                      >
                        {aiEnabled ? '● BOT ONLINE' : '○ BOT OFFLINE'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                      {Object.keys(PROMPT_TEMPLATES).map((nicho) => (
                        <button
                          key={nicho}
                          onClick={() => { setAiPrompt(PROMPT_TEMPLATES[nicho as keyof typeof PROMPT_TEMPLATES]); toast.success(`MÓDULO ${nicho.toUpperCase()} CARREGADO`); }}
                          className="py-3 bg-slate-900 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-all hover:bg-slate-800"
                        >
                          {nicho}
                        </button>
                      ))}
                      <button
                        onClick={() => { setAiPrompt(''); toast('MEMÓRIA LIMPA'); }}
                        className="py-3 bg-transparent border border-dashed border-slate-600 text-slate-500 hover:text-white rounded-lg text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                      >
                        <Edit3 className="w-3 h-3" /> Personalizado
                      </button>
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                      <div className="bg-black/80 border border-slate-700 rounded-xl overflow-hidden relative">
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                          <div className="flex gap-2">

                          </div>
                          <span className="text-[10px] font-mono text-slate-500"> </span>
                        </div>
                        <textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          rows={15}
                          className="w-full bg-transparent p-6 text-emerald-400 font-mono text-sm leading-relaxed outline-none resize-y placeholder-emerald-900/50 selection:bg-emerald-500/30"
                          placeholder="// Digite as diretrizes da IA aqui..."
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSaveAgentConfig}
                      disabled={savingAgent}
                      className="mt-6 w-full group relative bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10"></div>
                      {savingAgent ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span className="tracking-widest">GRAVAR DADOS</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- ABA ASSINATURA --- */}
            {activeTab === 'subscription' && (
              <motion.div
                key="subscription"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 p-8 max-w-2xl mx-auto"
              >
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-purple-400" />
                  Gerenciamento de Assinatura
                </h2>

                <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl p-8 border border-white/5 mb-8 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
                  <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Plano Ativo</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <h3 className="text-4xl font-bold text-white">{subscription?.plan.name || 'Trial'}</h3>
                    <span className="text-purple-400 font-mono">{formatPrice(subscription?.plan.price || 0)}/mês</span>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <a
                      href="https://wa.me/556297027948?text=Olá!%20Gostaria%20de%20mudar%20meu%20plano"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-white text-black text-center py-3 rounded-lg font-bold hover:bg-cyan-50 hover:scale-[1.02] transition-all"
                    >
                      UPGRADE
                    </a>
                    <button
                      onClick={handleCancelSubscription}
                      className="flex-1 border border-red-500/30 text-red-400 py-3 rounded-lg font-bold hover:bg-red-500/10 transition-all text-sm"
                    >
                      CANCELAR
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- ABA SETTINGS --- */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-900/50 rounded-2xl border border-slate-800 p-8"
              >
                <h2 className="text-xl font-bold text-white mb-8">Dados da Conta</h2>
                <div className="space-y-6">
                  <div className="p-4 bg-black/40 rounded-lg border border-slate-800">
                    <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Email Registrado</label>
                    <div className="text-slate-300 font-mono">{userData?.email}</div>
                  </div>
                  <div className="p-4 bg-black/40 rounded-lg border border-slate-800">
                    <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">ID do Usuário</label>
                    <div className="text-slate-500 font-mono text-xs">{session?.user?.email}</div>
                  </div>
                  <button onClick={() => signOut()} className="text-red-500 text-sm hover:text-red-400 underline decoration-red-500/30 underline-offset-4">
                    Encerrar Sessão neste dispositivo
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- MODAL QR CODE --- */}
      <AnimatePresence>
        {showQrModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-[#0f172a] rounded-3xl border border-cyan-500/30 p-10 text-center max-w-sm w-full shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Conecte seu WhatsApp</h3>

              <div className="bg-white p-4 rounded-xl inline-block mb-8 shadow-[0_0_20px_rgba(255,255,255,0.1)] relative group">
                {qrCodeData ? (
                  <>
                    <img src={qrCodeData.startsWith('data:') ? qrCodeData : `data:image/png;base64,${qrCodeData}`} alt="QR" className="w-64 h-64 mix-blend-multiply" />
                    <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-xl pointer-events-none"></div>
                    {/* Corners */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyan-600"></div>
                    <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-cyan-600"></div>
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-cyan-600"></div>
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyan-600"></div>
                  </>
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center bg-slate-100 rounded-lg">
                    <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowQrModal(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold tracking-wide transition-all border border-slate-700 hover:border-slate-500"
              >
                CANCELAR OPERAÇÃO
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

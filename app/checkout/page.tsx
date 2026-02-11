'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  QrCode, 
  FileText, 
  Loader2, 
  Check, 
  ArrowLeft,
  Copy,
  CheckCircle2,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  isPopular: boolean;
}

function CheckoutContent() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('planId');

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [billingType, setBillingType] = useState<'PIX' | 'CREDIT_CARD' | 'BOLETO'>('PIX');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [phone, setPhone] = useState('');
  
  // Estado para PIX
  const [pixData, setPixData] = useState<{
    qrCode: string;
    copyPaste: string;
    paymentId: string;
    expirationDate: string;
  } | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/planos');
      return;
    }

    if (planId) {
      fetchPlan();
    }
  }, [planId, status]);

  // Polling para verificar pagamento PIX
  useEffect(() => {
    if (!pixData?.paymentId || paymentConfirmed) return;

    const interval = setInterval(async () => {
      setCheckingPayment(true);
      try {
        const response = await fetch(`/api/asaas/check-payment?paymentId=${pixData.paymentId}`);
        const data = await response.json();
        
        if (data.isPaid) {
          setPaymentConfirmed(true);
          clearInterval(interval);
          toast.success('Pagamento confirmado! Redirecionando...');
          setTimeout(() => router.push('/dashboard'), 2000);
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
      } finally {
        setCheckingPayment(false);
      }
    }, 5000); // Verifica a cada 5 segundos

    return () => clearInterval(interval);
  }, [pixData, paymentConfirmed]);

  const fetchPlan = async () => {
    try {
      const response = await fetch('/api/plans');
      const plans = await response.json();
      const selectedPlan = plans.find((p: Plan) => p.id === planId);
      setPlan(selectedPlan);
    } catch (error) {
      console.error('Erro ao buscar plano:', error);
      toast.error('Erro ao carregar plano');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!plan) return;

    // Validar CPF/CNPJ
    if (!cpfCnpj || cpfCnpj.length < 11) {
      toast.error('CPF/CNPJ é obrigatório');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/asaas/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          billingType,
          cpfCnpj: cpfCnpj.replace(/\D/g, ''),
          phone: phone.replace(/\D/g, ''),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar pagamento');
      }

      // Se for plano gratuito
      if (data.subscription?.status === 'active') {
        toast.success(data.message || 'Assinatura ativada!');
        router.push('/dashboard');
        return;
      }

      // Se for PIX, mostrar QR Code
      if (billingType === 'PIX' && data.pixQrCode) {
        setPixData({
          qrCode: data.pixQrCode,
          copyPaste: data.pixCopyPaste,
          paymentId: data.paymentId,
          expirationDate: data.expirationDate,
        });
        toast.success('QR Code gerado! Escaneie para pagar.');
      } 
      // Se for Cartão ou Boleto, redirecionar para checkout do Asaas
      else if (data.checkoutUrl) {
        toast.success('Redirecionando para pagamento seguro...');
        window.location.href = data.checkoutUrl;
      } else {
        toast.success(data.message || 'Assinatura criada!');
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar pagamento');
    } finally {
      setProcessing(false);
    }
  };

  const copyPixCode = () => {
    if (pixData?.copyPaste) {
      navigator.clipboard.writeText(pixData.copyPaste);
      toast.success('Código PIX copiado!');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  if (loading || status === 'loading') {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </main>
    );
  }

  if (!plan) {
    return (
      <main className="min-h-screen bg-slate-900">
        <Header />
        <div className="pt-32 pb-24 text-center">
          <h1 className="text-2xl text-white mb-4">Plano não encontrado</h1>
          <Link href="/planos" className="text-blue-400 hover:text-blue-300">
            Voltar para planos
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900">
      <Header />
      
      <section className="pt-32 pb-24">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          <Link 
            href="/planos" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para planos
          </Link>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Resumo do Plano */}
            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 sticky top-24"
              >
                <h2 className="text-xl font-bold text-white mb-4">Resumo</h2>
                
                <div className="border-b border-slate-700 pb-4 mb-4">
                  <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                  <p className="text-slate-400 text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.slice(0, 4).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="border-t border-slate-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total</span>
                    <span className="text-2xl font-bold text-white">
                      {formatPrice(plan.price)}
                      <span className="text-sm text-slate-400">/mês</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Formulário de Pagamento */}
            <div className="md:col-span-3">
              {pixData ? (
                // Tela de PIX
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6"
                >
                  {paymentConfirmed ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-white mb-2">Pagamento Confirmado!</h2>
                      <p className="text-slate-400">Redirecionando para o dashboard...</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-white mb-2">Pague com PIX</h2>
                        <p className="text-slate-400 text-sm">Escaneie o QR Code ou copie o código</p>
                      </div>

                      <div className="bg-white rounded-xl p-4 mb-6 mx-auto w-fit">
                        <img 
                          src={`data:image/png;base64,${pixData.qrCode}`} 
                          alt="QR Code PIX"
                          className="w-48 h-48"
                        />
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm text-slate-400 mb-2">PIX Copia e Cola</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={pixData.copyPaste}
                            readOnly
                            className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm truncate"
                          />
                          <button
                            onClick={copyPixCode}
                            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                        {checkingPayment ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                        <span>Aguardando pagamento...</span>
                      </div>
                    </>
                  )}
                </motion.div>
              ) : (
                // Formulário de checkout
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6"
                >
                  <h2 className="text-xl font-bold text-white mb-6">Método de Pagamento</h2>

                  {/* Seletor de método */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setBillingType('PIX')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        billingType === 'PIX'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <QrCode className={`w-6 h-6 mx-auto mb-2 ${
                        billingType === 'PIX' ? 'text-blue-400' : 'text-slate-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        billingType === 'PIX' ? 'text-white' : 'text-slate-400'
                      }`}>PIX</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBillingType('CREDIT_CARD')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        billingType === 'CREDIT_CARD'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <CreditCard className={`w-6 h-6 mx-auto mb-2 ${
                        billingType === 'CREDIT_CARD' ? 'text-blue-400' : 'text-slate-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        billingType === 'CREDIT_CARD' ? 'text-white' : 'text-slate-400'
                      }`}>Cartão</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBillingType('BOLETO')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        billingType === 'BOLETO'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <FileText className={`w-6 h-6 mx-auto mb-2 ${
                        billingType === 'BOLETO' ? 'text-blue-400' : 'text-slate-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        billingType === 'BOLETO' ? 'text-white' : 'text-slate-400'
                      }`}>Boleto</span>
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">CPF ou CNPJ *</label>
                      <input
                        type="text"
                        value={cpfCnpj}
                        onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
                        maxLength={18}
                        placeholder="000.000.000-00"
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Telefone (opcional)</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        maxLength={15}
                        placeholder="(11) 99999-9999"
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    {billingType === 'PIX' && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <p className="text-green-400 text-sm">
                          ⚡ Pagamento instantâneo! Após o pagamento, sua assinatura será ativada automaticamente.
                        </p>
                      </div>
                    )}

                    {billingType === 'BOLETO' && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                        <p className="text-yellow-400 text-sm">
                          📄 O boleto vence em 3 dias úteis. Sua assinatura será ativada após a compensação.
                        </p>
                      </div>
                    )}

                    {billingType === 'CREDIT_CARD' && (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <p className="text-blue-400 text-sm">
                          💳 Você será redirecionado para o checkout seguro do Asaas para inserir os dados do cartão. A assinatura só será ativada após a confirmação do pagamento.
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      ) : (
                        `Pagar ${formatPrice(plan.price)}`
                      )}
                    </button>

                    <p className="text-center text-xs text-slate-500">
                      Ao continuar, você concorda com nossos termos de uso.
                      Pagamento processado com segurança pelo Asaas.
                    </p>
                  </form>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

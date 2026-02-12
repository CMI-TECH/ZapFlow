'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  isPopular: boolean;
}

export default function PlanosPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribingPlan, setSubscribingPlan] = useState<string | null>(null);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (status === 'unauthenticated') {
      router.push('/cadastro');
      return;
    }

    // Redirecionar para página de checkout com Asaas
    router.push(`/checkout?planId=${planId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  return (
    <main className="min-h-screen bg-slate-900">
      <Header />

      <section className="pt-32 pb-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Escolha o plano <span className="text-blue-400">ideal</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Planos flexíveis que crescem junto com seu negócio. Cancele quando quiser.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(plans ?? []).map((plan, index) => (
                <motion.div
                  key={plan?.id ?? index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-8 rounded-2xl border transition-all hover:-translate-y-1 ${plan?.isPopular
                    ? 'bg-gradient-to-b from-blue-600/20 to-purple-600/20 border-blue-500/50 shadow-xl shadow-blue-500/10'
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                    }`}
                >
                  {plan?.isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-full">
                        <Sparkles className="w-4 h-4" />
                        Mais Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan?.name ?? 'Plano'}</h3>
                    <p className="text-slate-400 mb-4">{plan?.description ?? ''}</p>
                    <div className="flex items-end justify-center gap-1">
                      <span className="text-4xl font-bold text-white">{formatPrice(plan?.price ?? 0)}</span>
                      <span className="text-slate-400 mb-1">/mês</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {(plan?.features ?? []).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-slate-300">{feature ?? ''}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan?.id ?? '')}
                    disabled={subscribingPlan === plan?.id}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${plan?.isPopular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {subscribingPlan === plan?.id ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'Assinar Agora'
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <p className="text-slate-400">
              Precisa de um plano personalizado?{' '}
              <Link href="/contato" className="text-blue-400 hover:text-blue-300">
                Entre em contato
              </Link>
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { UserPlus, Settings, Rocket, BarChart3 } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Crie sua conta',
    description: 'Cadastre-se em minutos e escolha o plano ideal para seu negócio.'
  },
  {
    icon: Settings,
    step: '02',
    title: 'Configure seu robô',
    description: 'Personalize as respostas, conecte seu WhatsApp e defina as regras de atendimento.'
  },
  {
    icon: Rocket,
    step: '03',
    title: 'Ative o atendimento',
    description: 'Com poucos cliques, seu robô está pronto para atender clientes 24/7.'
  },
  {
    icon: BarChart3,
    step: '04',
    title: 'Acompanhe resultados',
    description: 'Monitore métricas, ajuste configurações e melhore continuamente.'
  }
];

export function HowItWorksSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="como-funciona" className="py-24 bg-slate-900">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Como <span className="text-purple-400">Funciona</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Em apenas 4 passos simples, seu atendimento estará automatizado e funcionando.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 opacity-30" />
              )}
              
              <div className="text-center">
                <div className="relative inline-flex mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                    <item.icon className="w-10 h-10 text-blue-400" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

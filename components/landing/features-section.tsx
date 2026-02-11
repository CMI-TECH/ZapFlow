'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  MessageSquare, 
  Mic, 
  Image, 
  FileText, 
  Brain, 
  Clock, 
  Shield, 
  Zap,
  Database,
  Users
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Atendimento via WhatsApp',
    description: 'Integração nativa com WhatsApp para atender seus clientes onde eles estão.',
    color: 'from-green-400 to-emerald-600'
  },
  {
    icon: Brain,
    title: 'IA Avançada com GPT-4',
    description: 'Respostas inteligentes e contextualizadas usando os modelos mais avançados de IA.',
    color: 'from-purple-400 to-violet-600'
  },
  {
    icon: Mic,
    title: 'Transcrição de Áudio',
    description: 'Converta áudios em texto automaticamente com alta precisão usando OpenAI Whisper.',
    color: 'from-blue-400 to-cyan-600'
  },
  {
    icon: Image,
    title: 'Análise de Imagens',
    description: 'Processamento inteligente de imagens com Gemini Vision para entender fotos e documentos.',
    color: 'from-pink-400 to-rose-600'
  },
  {
    icon: FileText,
    title: 'Leitura de PDFs',
    description: 'Extração automática de texto de documentos PDF para processamento inteligente.',
    color: 'from-orange-400 to-amber-600'
  },
  {
    icon: Database,
    title: 'Memória de Conversação',
    description: 'Contexto persistente que lembra do histórico para conversas mais naturais.',
    color: 'from-teal-400 to-cyan-600'
  },
  {
    icon: Users,
    title: 'CRM Integrado',
    description: 'Salve leads e gerencie contatos automaticamente durante as conversas.',
    color: 'from-indigo-400 to-blue-600'
  },
  {
    icon: Clock,
    title: 'Disponível 24/7',
    description: 'Atendimento ininterrupto, sem pausas, férias ou horário comercial.',
    color: 'from-yellow-400 to-orange-600'
  },
  {
    icon: Zap,
    title: 'Respostas Instantâneas',
    description: 'Tempo de resposta em segundos, melhorando a experiência do cliente.',
    color: 'from-lime-400 to-green-600'
  },
  {
    icon: Shield,
    title: 'Segurança de Dados',
    description: 'Seus dados protegidos com criptografia e conformidade com LGPD.',
    color: 'from-slate-400 to-gray-600'
  }
];

export function FeaturesSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="recursos" className="py-24 bg-slate-800/50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Recursos <span className="text-blue-400">Poderosos</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Tudo que seu negócio precisa para automatizar o atendimento ao cliente com excelência.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 bg-slate-900/50 hover:bg-slate-900 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-all hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

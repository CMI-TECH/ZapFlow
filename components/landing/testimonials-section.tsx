'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Maria Silva',
    role: 'CEO, TechStore Brasil',
    content: 'Incrível como o ZapFlow transformou nosso atendimento. Reduzimos o tempo de resposta de horas para segundos e nossos clientes adoraram!',
    rating: 5,
    avatar: 'MS'
  },
  {
    name: 'João Santos',
    role: 'Gerente, Clínica Vida',
    content: 'A transcrição de áudio é perfeita! Nossos pacientes enviam áudios e o robô entende tudo. Economia de 40% no time de atendimento.',
    rating: 5,
    avatar: 'JS'
  },
  {
    name: 'Ana Costa',
    role: 'Diretora, E-commerce Moda',
    content: 'O processamento de imagens é fantástico. Clientes enviam fotos de produtos e o robô identifica e responde corretamente.',
    rating: 5,
    avatar: 'AC'
  },
  {
    name: 'Carlos Oliveira',
    role: 'Fundador, Startup Logística',
    content: 'Melhor investimento que fizemos. O ROI veio em menos de 2 meses. Atendemos 3x mais clientes com o mesmo time.',
    rating: 5,
    avatar: 'CO'
  },
  {
    name: 'Fernanda Lima',
    role: 'Head de CX, Fintech Pay',
    content: 'A memória de conversação faz toda diferença. O robô lembra do contexto e oferece uma experiência personalizada.',
    rating: 5,
    avatar: 'FL'
  },
  {
    name: 'Roberto Mendes',
    role: 'Proprietário, Restaurante Sabor',
    content: 'Nossos pedidos via WhatsApp triplicaram depois do ZapFlow. O robô é rápido, educado e nunca erra!',
    rating: 5,
    avatar: 'RM'
  }
];

export function TestimonialsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-slate-800/50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            O que nossos clientes <span className="text-blue-400">dizem</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Centenas de empresas já transformaram seu atendimento com o ZapFlow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 bg-slate-900/70 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-all hover:shadow-xl hover:shadow-blue-500/5"
            >
              <Quote className="w-8 h-8 text-blue-500/30 mb-4" />
              <p className="text-slate-300 mb-6">&ldquo;{testimonial.content}&rdquo;</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="text-white font-semibold">{testimonial.name}</h4>
                  <p className="text-slate-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex gap-1 mt-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

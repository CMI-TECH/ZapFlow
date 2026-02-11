import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 font-sans">
      {/* Hero Section - Mantida conforme solicitado */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-500/20 animate-gradient"></div>

        <nav className="relative z-10 container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8V4H8" />
                  <rect width="16" height="12" x="4" y="8" rx="2" />
                  <path d="M2 14h2" />
                  <path d="M20 14h2" />
                  <path d="M15 13v2" />
                  <path d="M9 13v2" />
                </svg>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">ZapFlow</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition font-medium">Recursos</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition font-medium">Depoimentos</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition font-medium">Preços</a>
              <Link href="/login" className="text-white font-medium hover:text-cyan-400 transition">Login</Link>
              <Link href="/cadastro" className="bg-white text-gray-900 hover:bg-gray-100 font-bold py-2 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                Começar Grátis
              </Link>
            </div>
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-6 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                Atendimento Inteligente 24/7
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                Transforme seu WhatsApp em uma
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"> Máquina de Vendas</span>
              </h1>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-lg">
                Agente de IA que atende clientes, qualifica leads e agenda reuniões automaticamente. Aumente suas conversões sem aumentar a equipe.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/cadastro" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg px-8 py-4 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg shadow-green-500/20 transform hover:-translate-y-1">
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
                  </svg>
                  Testar Grátis Agora
                </Link>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Sem cartão de crédito
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Setup em 2 minutos
                </div>
              </div>
            </div>

            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-3xl blur-3xl opacity-30 animate-pulse-slow"></div>
              <div className="relative bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700 shadow-2xl">
                <div className="flex items-center space-x-3 mb-6 border-b border-gray-700 pb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-bold">Assistente Comercial</div>
                    <div className="text-green-400 text-xs flex items-center mt-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                      Online agora
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-700/50 rounded-2xl rounded-tl-none p-4 max-w-[90%]">
                    <p className="text-gray-300 text-sm">Olá! Gostaria de saber os preços para revenda.</p>
                    <span className="text-gray-500 text-xs mt-1 block">14:32</span>
                  </div>

                  <div className="bg-green-600/20 border border-green-500/30 rounded-2xl rounded-tr-none p-4 ml-auto max-w-[90%] shadow-sm">
                    <p className="text-gray-100 text-sm">Olá! 🚀 Temos uma tabela especial para revendedores com até 30% de desconto. Quer que eu te envie o PDF agora?</p>
                    <span className="text-green-200/60 text-xs flex items-center justify-end mt-1">
                      14:32
                      <svg className="w-3.5 h-3.5 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                    </span>
                  </div>

                  <div className="bg-gray-700/50 rounded-2xl rounded-tl-none p-4 max-w-[90%]">
                    <p className="text-gray-300 text-sm">Sim, por favor!</p>
                    <span className="text-gray-500 text-xs mt-1 block">14:33</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof (Stats) */}
      <section className="bg-gray-900/80 py-10 border-y border-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-800/0 md:divide-gray-800">
            <div className="p-4">
              <div className="text-4xl font-extrabold text-white mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">+5.000</div>
              <div className="text-gray-400 font-medium">Empresas Ativas</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-extrabold text-white mb-2">2M+</div>
              <div className="text-gray-400 font-medium">Conversas/Mês</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-extrabold text-white mb-2">98%</div>
              <div className="text-gray-400 font-medium">Satisfação</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-extrabold text-white mb-2">300%</div>
              <div className="text-gray-400 font-medium">Aumento em Vendas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Recursos que <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Impulsionam Vendas</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Tudo que você precisa para automatizar atendimento e qualificar leads no WhatsApp em uma única plataforma.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition duration-300 border border-gray-700 hover:border-purple-500/50 group">
              <div className="w-14 h-14 bg-purple-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Atendimento 24/7</h3>
              <p className="text-gray-400 leading-relaxed">
                Nunca mais deixe um cliente esperando. Nossa IA responde instantaneamente, tira dúvidas e mantém o cliente engajado.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition duration-300 border border-gray-700 hover:border-cyan-500/50 group">
              <div className="w-14 h-14 bg-cyan-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Qualificação Automática</h3>
              <p className="text-gray-400 leading-relaxed">
                A IA filtra os curiosos e entrega apenas os leads quentes para sua equipe comercial fechar o negócio.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition duration-300 border border-gray-700 hover:border-green-500/50 group">
              <div className="w-14 h-14 bg-green-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Agendamento Direto</h3>
              <p className="text-gray-400 leading-relaxed">
                Conecte sua agenda e deixe a IA marcar reuniões e demonstrações sozinha, enviando lembretes automáticos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Testimonials Section (Social Proof) */}
      <section id="testimonials" className="py-20 bg-gray-800/30 border-y border-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              O que nossos clientes dizem
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 relative">
              <div className="text-4xl text-purple-500 absolute top-4 left-6">"</div>
              <p className="text-gray-300 mb-6 mt-4 relative z-10 italic">
                "Desde que implementamos o ZapFlow, recuperamos 40% dos clientes que chamavam fora do horário comercial. A IA paga a si mesma na primeira semana."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-600 rounded-full mr-3 flex items-center justify-center text-white font-bold">R</div>
                <div>
                  <div className="text-white font-bold">Ricardo Alves</div>
                  <div className="text-gray-400 text-xs">Diretor Comercial, Imobiliária Viva</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 relative">
              <div className="text-4xl text-cyan-500 absolute top-4 left-6">"</div>
              <p className="text-gray-300 mb-6 mt-4 relative z-10 italic">
                "Simplesmente a melhor ferramenta de automação. Configurei em 10 minutos e agora meu suporte funciona sozinho. Incrível!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-600 rounded-full mr-3 flex items-center justify-center text-white font-bold">J</div>
                <div>
                  <div className="text-white font-bold">Júlia Mattos</div>
                  <div className="text-gray-400 text-xs">Fundadora, Clínica Sorriso</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 relative">
              <div className="text-4xl text-green-500 absolute top-4 left-6">"</div>
              <p className="text-gray-300 mb-6 mt-4 relative z-10 italic">
                "Minha equipe de vendas parou de perder tempo qualificando curiosos. O lead já chega pronto para comprar. Recomendo demais."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-600 rounded-full mr-3 flex items-center justify-center text-white font-bold">M</div>
                <div>
                  <div className="text-white font-bold">Marcos Paulo</div>
                  <div className="text-gray-400 text-xs">CEO, TechEdu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Só Free Plan) */}
      <section id="pricing" className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Comece sem gastar nada
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experimente o poder da IA no seu WhatsApp com nosso plano gratuito. Sem pegadinhas.
            </p>
          </div>

          <div className="flex justify-center">
            {/* Free Plan Card - Highlighted */}
            <div className="w-full max-w-md bg-gray-800 rounded-3xl p-8 border-2 border-purple-500/50 relative shadow-2xl shadow-purple-900/20 transform hover:-translate-y-2 transition duration-300">
              <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">
                Popular
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Plano Inicial</h3>
                <p className="text-gray-400">Ideal para testar e validar.</p>
              </div>
              <div className="mb-8 border-b border-gray-700 pb-8">
                <div className="flex items-baseline">
                  <span className="text-5xl font-extrabold text-white">R$ 0</span>
                  <span className="text-gray-400 ml-2 text-xl">/mês</span>
                </div>
                <p className="text-green-400 text-sm mt-2 font-medium">Vitalício. Sem cartão de crédito.</p>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  "200 mensagens automáticas/mês",
                  "IA treinada para seu negócio",
                  "1 número de WhatsApp conectado",
                  "Painel de Analytics Básico",
                  "Suporte via Comunidade",
                  "Acesso imediato"
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro" className="block w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 text-center shadow-lg hover:shadow-purple-500/30">
                Criar Conta Grátis
              </Link>
              <p className="text-center text-gray-500 text-xs mt-4">
                Não requer cartão de crédito • Cancele quando quiser
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Mais persuasivo */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="rounded-3xl bg-gradient-to-r from-purple-900 to-indigo-900 p-12 md:p-20 text-center border border-purple-500/30 shadow-2xl">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Pare de perder vendas no WhatsApp
            </h2>
            <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
              Seu concorrente já está usando IA. Não fique para trás. Configure seu robô de vendas em 2 minutos e veja os resultados hoje mesmo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/cadastro" className="w-full sm:w-auto bg-white text-purple-900 hover:bg-gray-100 font-bold py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl text-lg flex items-center justify-center">
                Começar Agora - É Grátis
                <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-900 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8V4H8" />
                    <rect width="16" height="12" x="4" y="8" rx="2" />
                    <path d="M2 14h2" />
                    <path d="M20 14h2" />
                    <path d="M15 13v2" />
                    <path d="M9 13v2" />
                  </svg>
                </div>
                <span className="text-white font-bold text-lg">ZapFlow</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Automação inteligente para empresas que querem vender mais gastando menos tempo.
              </p>
            </div>
            {/* Links do footer mantidos simplificados para foco na conversão */}
            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#features" className="hover:text-purple-400 transition">Recursos</a></li>
                <li><a href="#pricing" className="hover:text-purple-400 transition">Preço</a></li>
                <li><Link href="/login" className="hover:text-purple-400 transition">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition">Privacidade</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Termos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition">suporte@zapflow.ai</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-900 pt-8 text-center text-gray-600 text-sm">
            <p>&copy; 2024 ZapFlow AI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
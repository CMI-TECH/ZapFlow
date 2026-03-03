import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans antialiased">
      
      {/* ============================================================ */}
      {/* NAV — Minimal, limpa, confiança imediata                     */}
      {/* ============================================================ */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
              <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">
              Zap<span className="text-emerald-400">Flow</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#problema" className="text-sm text-zinc-400 hover:text-white transition-colors">O Problema</a>
            <a href="#solucao" className="text-sm text-zinc-400 hover:text-white transition-colors">A Solução</a>
            <a href="#prova" className="text-sm text-zinc-400 hover:text-white transition-colors">Resultados</a>
            <a href="#preco" className="text-sm text-zinc-400 hover:text-white transition-colors">Preço</a>
            <Link href="/login" className="text-sm text-zinc-300 hover:text-white transition-colors font-medium">Entrar</Link>
            <Link href="/cadastro" className="bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold px-5 py-2.5 rounded-lg transition-all hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5">
              Começar Agora
            </Link>
          </div>
        </div>
      </nav>

      {/* ============================================================ */}
      {/* HERO — O "Porquê" (Sinek). Foco na DOR, não na ferramenta.   */}
      {/* ============================================================ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* Ambient glow — sutil */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/[0.07] rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge de urgência */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-8 tracking-wide">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
              Enquanto você lê isso, leads estão esperando resposta
            </div>

            {/* Headline — Emocional, direto na dor */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
              Nunca mais perca uma venda
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                para a bagunça do WhatsApp.
              </span>
            </h1>

            {/* Subtítulo — O "Porquê" */}
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Acreditamos que <strong className="text-white">velocidade é dinheiro</strong>. O ZapFlow organiza o caos, automatiza o repetitivo e garante que seu cliente seja atendido em <strong className="text-emerald-400">segundos</strong>, não em horas.
            </p>

            {/* CTA — Focado no resultado, não na ferramenta */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/cadastro" className="group relative bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1 overflow-hidden">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Quero parar de perder vendas
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* Micro proof */}
            <div className="flex items-center justify-center gap-6 text-sm text-zinc-500">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Setup em 2 minutos
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Sem cartão de crédito
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Cancele quando quiser
              </span>
            </div>
          </div>

          {/* ======== VISUAL "ANTES E DEPOIS" ======== */}
          <div className="mt-20 max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {/* ANTES — O Caos */}
              <div className="relative group">
                <div className="absolute inset-0 bg-red-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
                <div className="relative bg-zinc-900/80 backdrop-blur border border-red-500/20 rounded-2xl p-6 hover:border-red-500/40 transition-colors">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-400 text-xs font-bold tracking-widest uppercase">Sem ZapFlow</span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-red-950/30 rounded-xl p-3 border border-red-900/30">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-red-300 text-xs font-bold">📱 WhatsApp Comercial</span>
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto">347</span>
                      </div>
                      <p className="text-zinc-500 text-xs">Mensagens não lidas acumulando...</p>
                    </div>
                    <div className="bg-red-950/20 rounded-xl p-3 border border-red-900/20">
                      <p className="text-zinc-500 text-xs">😤 "Fui comprar no concorrente, vcs demoraram demais"</p>
                      <span className="text-red-400/60 text-[10px]">Há 3 horas</span>
                    </div>
                    <div className="bg-red-950/20 rounded-xl p-3 border border-red-900/20">
                      <p className="text-zinc-500 text-xs">😡 "Alguém pode me responder???"</p>
                      <span className="text-red-400/60 text-[10px]">Há 5 horas</span>
                    </div>
                  </div>
                  <p className="text-red-400/80 text-xs mt-4 font-medium text-center">💸 R$ 12.400/mês perdidos em vendas</p>
                </div>
              </div>

              {/* DEPOIS — A Ordem */}
              <div className="relative group">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
                <div className="relative bg-zinc-900/80 backdrop-blur border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">Com ZapFlow</span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-emerald-950/30 rounded-xl p-3 border border-emerald-900/30">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-emerald-300 text-xs font-bold">✅ Todas as conversas respondidas</span>
                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto">0</span>
                      </div>
                      <p className="text-zinc-500 text-xs">IA respondeu em 3 segundos cada</p>
                    </div>
                    <div className="bg-emerald-950/20 rounded-xl p-3 border border-emerald-900/20">
                      <p className="text-zinc-400 text-xs">🤖 "Olá! Temos desconto especial para você. Posso enviar o catálogo?"</p>
                      <span className="text-emerald-400/60 text-[10px]">Agora • Resposta automática</span>
                    </div>
                    <div className="bg-emerald-950/20 rounded-xl p-3 border border-emerald-900/20">
                      <p className="text-zinc-400 text-xs">😄 "Que rápido! Sim, por favor!"</p>
                      <span className="text-emerald-400/60 text-[10px]">Há 1 segundo • Lead qualificado ✓</span>
                    </div>
                  </div>
                  <p className="text-emerald-400/80 text-xs mt-4 font-medium text-center">📈 +300% em conversões este mês</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SOCIAL PROOF — Números que geram confiança                    */}
      {/* ============================================================ */}
      <section className="py-16 border-y border-white/5 bg-zinc-950/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '+5.000', label: 'Empresas confiam' },
              { value: '2M+', label: 'Mensagens/mês' },
              { value: '3s', label: 'Tempo médio de resposta' },
              { value: '300%', label: 'Mais conversões' },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-zinc-500 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* O PROBLEMA — Seção que articula a dor (antes da solução)      */}
      {/* ============================================================ */}
      <section id="problema" className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-red-400 text-xs font-bold tracking-widest uppercase mb-4 block">O problema que ninguém fala</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Seu WhatsApp está <span className="text-red-400">sangrando dinheiro</span> agora mesmo.
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Enquanto sua equipe almoça, dorme ou atende outro cliente, dezenas de mensagens ficam sem resposta. Cada minuto de silêncio é um lead quente esfriando — e indo para o concorrente.
            </p>
          </div>

          {/* Bento Grid — Dores reais */}
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 hover:border-red-500/30 transition-colors group">
              <div className="text-3xl mb-4">⏰</div>
              <h3 className="text-lg font-bold text-white mb-2">Demora que mata</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">78% dos clientes compram de quem responde primeiro. Se você demora 10 minutos, já perdeu.</p>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 hover:border-red-500/30 transition-colors group">
              <div className="text-3xl mb-4">🤷</div>
              <h3 className="text-lg font-bold text-white mb-2">O "estava no celular do fulano"</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Conversas perdidas entre atendentes, histórico que some, leads que ninguém sabe de quem é.</p>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 hover:border-red-500/30 transition-colors group">
              <div className="text-3xl mb-4">🌙</div>
              <h3 className="text-lg font-bold text-white mb-2">Fora do horário = fora da venda</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Seu melhor vendedor não trabalha de noite. Mas seu cliente pesquisa e compra às 23h.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* A SOLUÇÃO — Features orientadas ao "Porquê"                  */}
      {/* ============================================================ */}
      <section id="solucao" className="py-20 md:py-28 bg-zinc-950/50 border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-4 block">A solução</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Seu WhatsApp, agora com <span className="text-emerald-400">superpoderes</span>.
            </h2>
            <p className="text-zinc-400 text-lg">
              Não vendemos "software". Vendemos a certeza de que nenhum cliente será ignorado.
            </p>
          </div>

          {/* Bento Grid — Benefícios (não funcionalidades) */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            
            {/* Card 1 — Multi-atendimento */}
            <div className="md:col-span-2 bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                </div>
                <span className="text-emerald-400/60 text-xs font-bold tracking-widest uppercase">Equipe</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Sua equipe unida, seu cliente atendido.</h3>
              <p className="text-zinc-400 leading-relaxed">
                Acabe com a desculpa de "estava no celular do fulano". Um número, múltiplos atendentes, controle total. Cada conversa tem dono, histórico e contexto.
              </p>
            </div>

            {/* Card 2 — Chatbot IA */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-cyan-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Atendimento imediato, mesmo enquanto você dorme.</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Liberte sua equipe de responder "qual o horário de funcionamento" 50 vezes por dia. A IA faz isso em 3 segundos.
              </p>
            </div>

            {/* Card 3 — Dashboard */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-purple-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">O fim do "eu acho".</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Tenha certeza de quem vende, quem demora e onde está o gargalo da sua operação. Dados reais, decisões inteligentes.
              </p>
            </div>

            {/* Card 4 — CRM integrado */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-amber-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Cada lead vira dinheiro, não planilha.</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                CRM integrado que transforma conversas em oportunidades e acompanha o funil automaticamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PROVA SOCIAL — Depoimentos com contexto emocional            */}
      {/* ============================================================ */}
      <section id="prova" className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-zinc-500 text-xs font-bold tracking-widest uppercase mb-4 block">Resultados reais</span>
            <h2 className="text-3xl md:text-4xl font-bold">
              Quem usou, não <span className="text-emerald-400">volta atrás</span>.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                quote: "Desde que implementamos o ZapFlow, recuperamos 40% dos clientes que chamavam fora do horário. A IA paga a si mesma na primeira semana.",
                name: "Ricardo Alves",
                role: "Diretor Comercial, Imobiliária Viva",
                initial: "R",
                color: "emerald",
              },
              {
                quote: "Minha equipe parou de perder tempo qualificando curiosos. O lead já chega pronto para comprar. Resultado: 3x mais fechamentos.",
                name: "Marcos Paulo",
                role: "CEO, TechEdu",
                initial: "M",
                color: "cyan",
              },
              {
                quote: "Configurei em 10 minutos e agora meu suporte funciona sozinho. Reduzi custos com atendimento em 60% — sem demitir ninguém.",
                name: "Júlia Mattos",
                role: "Fundadora, Clínica Sorriso",
                initial: "J",
                color: "purple",
              },
            ].map((t, i) => (
              <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 bg-${t.color}-500/20 border border-${t.color}-500/30 rounded-full flex items-center justify-center text-${t.color}-400 text-sm font-bold`}>{t.initial}</div>
                  <div>
                    <div className="text-white text-sm font-semibold">{t.name}</div>
                    <div className="text-zinc-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CMI / ENER — Selo de Confiança (o "pai rico")                 */}
      {/* ============================================================ */}
      <section className="py-20 border-y border-white/5 bg-zinc-950/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800/50 border border-zinc-700/50 rounded-3xl p-10 md:p-14 relative overflow-hidden">
            {/* Subtle accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                  Não somos mais um "aplicativo de zap".
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  O ZapFlow é desenvolvido pela <strong className="text-white">CMI Tecnologia</strong>, com o mesmo rigor técnico usado em obras de infraestrutura e inteligência artificial pelo <strong className="text-white">Grupo Ener</strong>. Segurança, estabilidade e engenharia de verdade para o canal mais crítico da sua empresa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PREÇO — Simples, sem confusão                                */}
      {/* ============================================================ */}
      <section id="preco" className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Comece sem gastar nada.</h2>
            <p className="text-zinc-400 text-lg">Sem pegadinhas. Sem surpresas na fatura.</p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-zinc-900/80 border-2 border-emerald-500/30 rounded-3xl p-8 relative hover:border-emerald-500/60 transition-colors hover:shadow-2xl hover:shadow-emerald-500/10">
              {/* Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-xs font-bold px-4 py-1 rounded-full">
                Mais Popular
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">Plano Inicial</h3>
                <p className="text-zinc-500 text-sm">Ideal para validar e começar a vender mais.</p>
              </div>

              <div className="mb-8 pb-6 border-b border-zinc-800">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-white">R$ 0</span>
                  <span className="text-zinc-500 text-lg">/mês</span>
                </div>
                <p className="text-emerald-400 text-sm mt-2 font-medium">Vitalício. Sem cartão de crédito.</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  '200 mensagens automáticas/mês',
                  'IA treinada para seu negócio',
                  '1 número de WhatsApp conectado',
                  'CRM com funil de vendas',
                  'Dashboard com métricas reais',
                  'Suporte via comunidade',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-300 text-sm">
                    <svg className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/cadastro" className="block w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-xl transition-all text-center hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5">
                Quero parar de perder vendas
              </Link>
              <p className="text-center text-zinc-600 text-xs mt-3">Upgrade disponível a qualquer momento</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA FINAL — Urgência + Emoção                                */}
      {/* ============================================================ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/30 to-cyan-950/30" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Seu concorrente já está usando IA.<br />
              <span className="text-emerald-400">Não fique para trás.</span>
            </h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
              Cada hora sem o ZapFlow é dinheiro escorrendo pelo ralo do seu WhatsApp bagunçado. Configure em 2 minutos.
            </p>
            <Link href="/cadastro" className="inline-flex items-center gap-2 bg-white text-black font-bold text-lg px-10 py-4 rounded-xl hover:bg-zinc-100 transition-all hover:shadow-2xl hover:-translate-y-1">
              Começar Agora — É Grátis
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FOOTER — Limpo e profissional                                */}
      {/* ============================================================ */}
      <footer className="border-t border-white/5 bg-[#050508] py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                </div>
                <span className="text-white font-bold">ZapFlow</span>
              </div>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Velocidade é respeito. Atendimento inteligente para empresas que não aceitam perder vendas.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Produto</h4>
              <ul className="space-y-2 text-zinc-500 text-sm">
                <li><a href="#solucao" className="hover:text-emerald-400 transition">Recursos</a></li>
                <li><a href="#preco" className="hover:text-emerald-400 transition">Preço</a></li>
                <li><Link href="/login" className="hover:text-emerald-400 transition">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-zinc-500 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition">Privacidade</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Termos de Uso</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Contato</h4>
              <ul className="space-y-2 text-zinc-500 text-sm">
                <li><a href="mailto:suporte@zapflow.ai" className="hover:text-emerald-400 transition">suporte@zapflow.ai</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-900 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-zinc-700 text-xs">&copy; {new Date().getFullYear()} ZapFlow — CMI Tecnologia. Todos os direitos reservados.</p>
            <p className="text-zinc-800 text-xs">Desenvolvido com engenharia de verdade.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
import Link from 'next/link';
import { Bot } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Zap<span className="text-blue-400">Flow</span></span>
            </Link>
            <p className="text-slate-400 max-w-md">
              Automatize seu atendimento ao cliente com inteligência artificial avançada. 
              Respostas instantâneas, 24 horas por dia, 7 dias por semana.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><Link href="/planos" className="text-slate-400 hover:text-blue-400 transition-colors">Planos</Link></li>
              <li><Link href="/contato" className="text-slate-400 hover:text-blue-400 transition-colors">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Conta</h3>
            <ul className="space-y-2">
              <li><Link href="/login" className="text-slate-400 hover:text-blue-400 transition-colors">Entrar</Link></li>
              <li><Link href="/cadastro" className="text-slate-400 hover:text-blue-400 transition-colors">Cadastrar</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} ZapFlow. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

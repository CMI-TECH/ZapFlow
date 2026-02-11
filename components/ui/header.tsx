'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Bot, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const { data: session } = useSession() || {};
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Zap<span className="text-blue-400">Flow</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/#recursos" className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all">
              Recursos
            </Link>
            <Link href="/#como-funciona" className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all">
              Como Funciona
            </Link>
            <Link href="/planos" className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all">
              Planos
            </Link>
            <Link href="/contato" className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all">
              Contato
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all"
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut?.({ callbackUrl: '/' })}
                  className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                >
                  Começar Agora
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-t border-slate-700/50"
          >
            <div className="px-4 py-4 space-y-2">
              <Link href="/#recursos" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Recursos
              </Link>
              <Link href="/#como-funciona" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Como Funciona
              </Link>
              <Link href="/planos" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Planos
              </Link>
              <Link href="/contato" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Contato
              </Link>
              <div className="pt-2 border-t border-slate-700">
                {session ? (
                  <>
                    <Link href="/dashboard" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { signOut?.({ callbackUrl: '/' }); setMobileMenuOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                    >
                      Sair
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                      Entrar
                    </Link>
                    <Link href="/cadastro" className="block px-4 py-2 mt-2 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                      Começar Agora
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

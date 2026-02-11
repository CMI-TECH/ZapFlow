'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Phone, Mail, MessageSquare, User, Trash2, Brain,
  LayoutDashboard, ChevronLeft, Sparkles, Search,
  Filter, X, TrendingUp, Users, Target, ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';

// --- CONFIGURAÇÕES E TIPOS ---

type LeadStage = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  stage: LeadStage;
  priority?: Priority;
  tags: string[];
  notes: string | null;
  summary: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { messages: number };
}

interface LeadMessage {
  id: string;
  content: string;
  fromLead: boolean;
  createdAt: string;
}

interface LeadWithMessages extends Lead {
  messages?: LeadMessage[];
}

const STAGES: { value: LeadStage; label: string; color: string; headerColor: string; dotColor: string }[] = [
  { value: 'NEW', label: 'Novo', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', headerColor: 'border-t-cyan-500', dotColor: 'bg-cyan-500' },
  { value: 'CONTACTED', label: 'Contato', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', headerColor: 'border-t-blue-500', dotColor: 'bg-blue-500' },
  { value: 'QUALIFIED', label: 'Qualificado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', headerColor: 'border-t-emerald-500', dotColor: 'bg-emerald-500' },
  { value: 'PROPOSAL', label: 'Proposta', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', headerColor: 'border-t-amber-500', dotColor: 'bg-amber-500' },
  { value: 'NEGOTIATION', label: 'Negociação', color: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20', headerColor: 'border-t-fuchsia-500', dotColor: 'bg-fuchsia-500' },
  { value: 'WON', label: 'Ganho', color: 'bg-green-500/10 text-green-400 border-green-500/20', headerColor: 'border-t-green-500', dotColor: 'bg-green-500' },
  { value: 'LOST', label: 'Perdido', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', headerColor: 'border-t-rose-500', dotColor: 'bg-rose-500' },
];

const PRIORITIES = {
  HIGH: { label: 'Alta', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', dot: 'bg-rose-500' },
  MEDIUM: { label: 'Média', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-500' },
  LOW: { label: 'Baixa', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-500' },
};

// --- COMPONENTES AUXILIARES ---

function StatsCard({ title, value, icon, description, trend }: any) {
  return (
    <Card className="bg-[#0D1117] border-slate-800 p-5 hover:border-slate-700 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-white">{value}</h3>
            {trend && <span className="text-[10px] text-emerald-500 font-bold flex items-center"><ArrowUpRight className="w-3 h-3" />{trend}</span>}
          </div>
          <p className="text-[11px] text-slate-600 leading-none">{description}</p>
        </div>
        <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 group-hover:border-slate-700 transition-colors">{icon}</div>
      </div>
    </Card>
  );
}

// --- COMPONENTE PRINCIPAL ---

export default function CRMPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<LeadWithMessages | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPaywallDialog, setShowPaywallDialog] = useState(false);
  const [deletingLead, setDeletingLead] = useState(false);
  const [previousLeadCount, setPreviousLeadCount] = useState<number>(0);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Fetch e Polling
  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/crm/leads');
      const data = await res.json();
      const newLeads = data.leads || [];
      if (previousLeadCount > 0 && newLeads.length > previousLeadCount) {
        toast.success(`🎉 ${newLeads.length - previousLeadCount} novo(s) lead(s) chegaram!`);
      }
      setLeads(newLeads);
      setPreviousLeadCount(newLeads.length);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') fetchLeads();
  }, [status]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const interval = setInterval(fetchLeads, 10000);
    return () => clearInterval(interval);
  }, [status]);

  // Lógica de Filtro e Métricas
  const filteredLeads = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return leads.filter(l =>
      l.name.toLowerCase().includes(s) ||
      l.phone.includes(s) ||
      (l.email?.toLowerCase().includes(s)) ||
      (PRIORITIES[l.priority || 'MEDIUM'].label.toLowerCase().includes(s))
    );
  }, [leads, searchTerm]);

  const stats = useMemo(() => ({
    total: leads.length,
    new: leads.filter(l => l.stage === 'NEW').length,
    active: leads.filter(l => ['PROPOSAL', 'NEGOTIATION'].includes(l.stage)).length,
    conversion: leads.length ? Math.round((leads.filter(l => l.stage === 'WON').length / leads.length) * 100) : 0
  }), [leads]);

  // Handlers
  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const leadId = active.id as string;
    const newStage = over.id as LeadStage;
    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.stage === newStage) return;

    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
    try {
      await fetch(`/api/crm/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      toast.success('Estágio atualizado');
    } catch { toast.error('Erro ao salvar'); fetchLeads(); }
  };

  const updateLead = async (leadId: string, updates: Partial<Lead>) => {
    // Atualização otimista instantânea (Visual-first)
    setSelectedLead(prev => prev ? { ...prev, ...updates } : null);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...updates } : l));

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/crm/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const data = await res.json();
        // Sincroniza com os dados reais do servidor
        if (data.lead) {
          setSelectedLead(prev => prev ? { ...prev, ...data.lead } : null);
          setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...data.lead } : l));
        }
      }
    } catch {
      console.error('Erro ao sincronizar com o servidor');
      // Não damos toast de erro aqui para não quebrar a experiência "visual" solicitada pelo usuário
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteLead = async () => {
    if (!selectedLead) return;
    setDeletingLead(true);
    try {
      await fetch(`/api/crm/leads/${selectedLead.id}`, { method: 'DELETE' });
      setLeads(prev => prev.filter(l => l.id !== selectedLead.id));
      setSelectedLead(null);
      setShowDeleteDialog(false);
      toast.success('Lead removido');
    } finally { setDeletingLead(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#020617]">
      <div className="h-12 w-12 rounded-full border-t-2 border-cyan-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-cyan-500/30">
      {/* HEADER */}
      <header className="border-b border-slate-800/60 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <LayoutDashboard className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">CRM ZapFlow</h1>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs text-slate-500">Live Sync</p>
              </div>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard')} variant="ghost" className="text-slate-400 gap-2 border border-transparent hover:border-slate-800 transition-all">
            <ChevronLeft className="w-4 h-4" /> Voltar para o Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-8">
        {/* DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Leads" value={stats.total} icon={<Users className="w-5 h-5 text-cyan-400" />} description="Volume total da base" />
          <StatsCard title="Novos" value={stats.new} icon={<Sparkles className="w-5 h-5 text-amber-400" />} trend="+5%" description="Aguardando contato" />
          <StatsCard title="Em Negociação" value={stats.active} icon={<Target className="w-5 h-5 text-fuchsia-400" />} description="Pipeline ativo" />
          <StatsCard title="Conversão" value={`${stats.conversion}%`} icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} description="Taxa de fechamento" />
        </div>

        {/* SEARCH BAR */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Buscar por nome, fone ou prioridade..."
              className="pl-11 bg-[#0D1117] border-slate-800 h-12 rounded-xl focus:border-cyan-500/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && <X onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 cursor-pointer" />}
          </div>
          <Button variant="outline" className="h-12 border-slate-800 bg-[#0D1117] px-6 rounded-xl gap-2">
            <Filter className="w-4 h-4 text-slate-400" /> Filtros
          </Button>
        </div>

        {/* KANBAN */}
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide min-h-[60vh]">
            {STAGES.map((stage) => (
              <KanbanColumn
                key={stage.value}
                stage={stage}
                leads={filteredLeads.filter(l => l.stage === stage.value)}
                onLeadClick={(id) => {
                  fetch(`/api/crm/leads/${id}`).then(res => res.json()).then(data => setSelectedLead(data.lead));
                }}
              />
            ))}
          </div>
          <DragOverlay>
            {activeId ? <LeadCard lead={leads.find(l => l.id === activeId)!} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </main>

      {/* MODAL DETALHES */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden bg-[#0B0F1A] border-slate-800 p-0 shadow-2xl shadow-black/50 flex flex-col">
          {selectedLead && (
            <>
              <div className="p-6 border-b border-slate-800 bg-slate-900/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {selectedLead.name.charAt(0)}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-white">{selectedLead.name}</DialogTitle>
                    <p className="text-sm text-slate-400">{selectedLead.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setShowDeleteDialog(true)} className="text-rose-500 hover:bg-rose-500/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Configurações</Label>
                    <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] text-slate-500">Nível de Prioridade</Label>
                        <div className="flex gap-2">
                          {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => updateLead(selectedLead.id, { priority: p })}
                              className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${(selectedLead.priority || 'MEDIUM') === p
                                ? `${PRIORITIES[p].bg} ${PRIORITIES[p].border} ${PRIORITIES[p].color} ring-1 ring-current`
                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-900'
                                }`}
                            >
                              {PRIORITIES[p].label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-slate-500">E-mail</Label>
                        <Input className="bg-slate-950 h-9 border-slate-800" value={selectedLead.email || ''} onChange={(e) => setSelectedLead({ ...selectedLead, email: e.target.value })} onBlur={(e) => updateLead(selectedLead.id, { email: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                      <Brain className="w-3 h-3" /> Resumo IA
                    </Label>
                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 min-h-[150px] flex flex-col items-center justify-center text-center">
                      {selectedLead.summary ? (
                        <p className="text-sm text-slate-300 italic">"{selectedLead.summary}"</p>
                      ) : (
                        <>
                          <p className="text-xs text-slate-500 mb-4 px-4">Analise o perfil deste lead e o histórico automaticamente.</p>
                          <Button size="sm" onClick={() => setShowPaywallDialog(true)} className="bg-purple-600 rounded-full px-6 text-xs h-10">
                            Gerar resumo da conversa
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <MessageSquare className="w-4 h-4 text-cyan-500" />
                    <h3 className="font-bold text-white tracking-tight text-sm">Conversas Recentes</h3>
                  </div>
                  <div className="space-y-3">
                    {selectedLead.messages?.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.fromLead ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.fromLead ? 'bg-slate-800/50 border border-slate-700 text-slate-200' : 'bg-cyan-600 text-white'}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* DIALOGS DE SUPORTE */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#0B0F1A] border-slate-800 text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-500">Excluir Lead?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-none text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteLead} className="bg-rose-600 hover:bg-rose-700 border-none">
              {deletingLead ? "Excluindo..." : "Sim, Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPaywallDialog} onOpenChange={setShowPaywallDialog}>
        <AlertDialogContent className="bg-[#0B0F1A] border-slate-800 text-slate-100 max-w-sm">
          <AlertDialogHeader>
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-xl shadow-purple-500/20">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <AlertDialogTitle className="text-center">Recurso Premium</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-slate-400">A análise automática de leads está disponível nos planos corporativos.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 mt-4">
            <AlertDialogAction className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 rounded-xl border-none shadow-lg shadow-purple-500/20 transition-all" onClick={() => window.open('https://wa.me/5562996917009', '_blank')}>Fazer Upgrade</AlertDialogAction>
            <AlertDialogCancel className="w-full bg-transparent border-slate-800 text-slate-500">Depois</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function KanbanColumn({ stage, leads, onLeadClick }: { stage: any; leads: Lead[]; onLeadClick: (id: string) => void }) {
  const { setNodeRef } = useDroppable({ id: stage.value });

  return (
    <div ref={setNodeRef} className={`flex-shrink-0 w-[300px] rounded-2xl border-t-4 bg-slate-900/20 border-x border-b border-slate-800/50 p-4 min-h-[500px] transition-all flex flex-col gap-4 ${stage.headerColor}`}>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
          <h3 className="font-bold text-xs text-slate-200 uppercase tracking-tighter">{stage.label}</h3>
        </div>
        <Badge variant="outline" className="bg-slate-950/50 border-slate-800 text-slate-500 font-mono text-[10px]">{leads.length}</Badge>
      </div>
      <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead.id)} />
        ))}
      </div>
    </div>
  );
}

function LeadCard({ lead, isDragging, onClick }: { lead: Lead; isDragging?: boolean; onClick?: () => void }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: lead.id });
  const priorityInfo = PRIORITIES[lead.priority || 'MEDIUM'];

  return (
    <div
      ref={setNodeRef}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`group bg-[#0D1117] border border-slate-800 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-slate-600 transition-all hover:shadow-2xl shadow-black/50 ${isDragging ? 'opacity-40' : ''}`}
    >
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${priorityInfo.bg} ${priorityInfo.border}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${priorityInfo.dot}`} />
            <span className={`text-[9px] font-bold uppercase tracking-wider ${priorityInfo.color}`}>{priorityInfo.label}</span>
          </div>
          <span className="text-[9px] text-slate-600 font-mono">#{lead.id.slice(-4)}</span>
        </div>

        <h4 className="font-bold text-[13px] text-white leading-tight group-hover:text-cyan-400 transition-colors">{lead.name}</h4>

        {lead.lastMessage && (
          <p className="text-[11px] text-slate-400 line-clamp-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/50 italic">
            "{lead.lastMessage}"
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-cyan-500/70" />
            <span className="text-[10px] text-slate-500 font-medium">{lead.phone}</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-slate-600">
            <MessageSquare className="w-2.5 h-2.5" /> {lead._count?.messages || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
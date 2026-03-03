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
  Filter, X, TrendingUp, Users, Target, ArrowUpRight,
  Plus, Settings2, GripVertical, Palette, ChevronDown,
  Zap, Save, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// --- TYPES ---

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
}

interface Pipeline {
  id: string;
  name: string;
  isDefault: boolean;
  stages: PipelineStage[];
  _count: { leads: number };
}

type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  stage: string;
  priority?: Priority;
  tags: string[];
  notes: string | null;
  summary: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  pipelineId: string | null;
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

const PRIORITIES = {
  HIGH: { label: 'Alta', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', dot: 'bg-rose-500' },
  MEDIUM: { label: 'Média', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-500' },
  LOW: { label: 'Baixa', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-500' },
};

const STAGE_COLORS = [
  '#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#d946ef',
  '#22c55e', '#f43f5e', '#8b5cf6', '#ec4899', '#14b8a6',
];

// --- STATS CARD ---

function StatsCard({ title, value, icon, description, trend }: any) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800/50 p-5 hover:border-zinc-700 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/[0.02] to-transparent rounded-full -mr-12 -mt-12" />
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-white">{value}</h3>
            {trend && <span className="text-[10px] text-emerald-500 font-bold flex items-center"><ArrowUpRight className="w-3 h-3" />{trend}</span>}
          </div>
          <p className="text-[11px] text-zinc-600 leading-none">{description}</p>
        </div>
        <div className="p-2.5 bg-zinc-800/50 rounded-xl border border-zinc-800">{icon}</div>
      </div>
    </Card>
  );
}

// --- MAIN CRM PAGE ---

export default function CRMPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [activePipelineId, setActivePipelineId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<LeadWithMessages | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPaywallDialog, setShowPaywallDialog] = useState(false);
  const [deletingLead, setDeletingLead] = useState(false);
  const [previousLeadCount, setPreviousLeadCount] = useState<number>(0);

  // Pipeline editor
  const [showPipelineEditor, setShowPipelineEditor] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [pipelineName, setPipelineName] = useState('');
  const [pipelineStages, setPipelineStages] = useState<{ name: string; color: string }[]>([]);
  const [savingPipeline, setSavingPipeline] = useState(false);
  const [showPipelineDropdown, setShowPipelineDropdown] = useState(false);
  const [showDeletePipelineDialog, setShowDeletePipelineDialog] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const activePipeline = pipelines.find(p => p.id === activePipelineId) || pipelines[0];
  const activeStages = activePipeline?.stages || [];

  // --- FETCH ---
  const fetchPipelines = async () => {
    try {
      const res = await fetch('/api/crm/pipelines');
      const data = await res.json();
      if (data.pipelines) {
        setPipelines(data.pipelines);
        if (!activePipelineId && data.pipelines.length > 0) {
          setActivePipelineId(data.pipelines[0].id);
        }
      }
    } catch (error) { console.error(error); }
  };

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
    if (status === 'authenticated') {
      Promise.all([fetchPipelines(), fetchLeads()]);
    }
  }, [status]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const interval = setInterval(fetchLeads, 10000);
    return () => clearInterval(interval);
  }, [status]);

  // --- FILTERS & STATS ---
  const pipelineLeads = useMemo(() => {
    if (!activePipelineId) return leads;
    return leads.filter(l => l.pipelineId === activePipelineId);
  }, [leads, activePipelineId]);

  const filteredLeads = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return pipelineLeads.filter(l =>
      l.name.toLowerCase().includes(s) ||
      l.phone.includes(s) ||
      (l.email?.toLowerCase().includes(s)) ||
      (PRIORITIES[l.priority || 'MEDIUM'].label.toLowerCase().includes(s))
    );
  }, [pipelineLeads, searchTerm]);

  const stats = useMemo(() => ({
    total: pipelineLeads.length,
    new: pipelineLeads.filter(l => activeStages[0] && l.stage === activeStages[0].name).length,
    active: pipelineLeads.filter(l => {
      const mid = activeStages.slice(2, -2);
      return mid.some(s => s.name === l.stage);
    }).length,
    conversion: pipelineLeads.length
      ? Math.round((pipelineLeads.filter(l => activeStages.length > 1 && l.stage === activeStages[activeStages.length - 2]?.name).length / pipelineLeads.length) * 100)
      : 0
  }), [pipelineLeads, activeStages]);

  // --- HANDLERS ---
  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const leadId = active.id as string;
    const newStage = over.id as string;
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
        if (data.lead) {
          setSelectedLead(prev => prev ? { ...prev, ...data.lead } : null);
          setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...data.lead } : l));
        }
      }
    } catch { } finally { setIsUpdating(false); }
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

  // --- PIPELINE CRUD ---
  const openPipelineEditor = (pipeline?: Pipeline) => {
    if (pipeline) {
      setEditingPipeline(pipeline);
      setPipelineName(pipeline.name);
      setPipelineStages(pipeline.stages.map(s => ({ name: s.name, color: s.color })));
    } else {
      setEditingPipeline(null);
      setPipelineName('');
      setPipelineStages([
        { name: 'Novo', color: '#06b6d4' },
        { name: 'Em Progresso', color: '#3b82f6' },
        { name: 'Concluído', color: '#22c55e' },
      ]);
    }
    setShowPipelineEditor(true);
    setShowPipelineDropdown(false);
  };

  const savePipeline = async () => {
    if (!pipelineName.trim()) { toast.error('Nome obrigatório'); return; }
    if (pipelineStages.length < 2) { toast.error('Mínimo 2 etapas'); return; }

    setSavingPipeline(true);
    try {
      const url = editingPipeline
        ? `/api/crm/pipelines/${editingPipeline.id}`
        : '/api/crm/pipelines';
      const method = editingPipeline ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: pipelineName, stages: pipelineStages })
      });

      if (res.ok) {
        toast.success(editingPipeline ? 'Pipeline atualizado' : 'Pipeline criado');
        setShowPipelineEditor(false);
        await fetchPipelines();
      } else {
        toast.error('Erro ao salvar pipeline');
      }
    } catch { toast.error('Erro de conexão'); }
    finally { setSavingPipeline(false); }
  };

  const deletePipeline = async () => {
    if (!editingPipeline) return;
    try {
      const res = await fetch(`/api/crm/pipelines/${editingPipeline.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Pipeline excluído');
        setShowDeletePipelineDialog(false);
        setShowPipelineEditor(false);
        setActivePipelineId(pipelines.find(p => p.isDefault)?.id || null);
        await fetchPipelines();
        await fetchLeads();
      }
    } catch { toast.error('Erro ao excluir'); }
  };

  const addStage = () => {
    const idx = pipelineStages.length;
    setPipelineStages([...pipelineStages, {
      name: `Etapa ${idx + 1}`,
      color: STAGE_COLORS[idx % STAGE_COLORS.length]
    }]);
  };

  const removeStage = (index: number) => {
    if (pipelineStages.length <= 2) { toast.error('Mínimo 2 etapas'); return; }
    setPipelineStages(pipelineStages.filter((_, i) => i !== index));
  };

  const updateStage = (index: number, field: 'name' | 'color', value: string) => {
    setPipelineStages(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  // --- LOADING ---
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-200 font-sans antialiased">
      {/* HEADER */}
      <header className="border-b border-zinc-800/50 bg-[#0a0a0f]/90 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <LayoutDashboard className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">CRM ZapFlow</h1>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-zinc-500">Live Sync</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Pipeline Selector */}
            <div className="relative">
              <button
                onClick={() => setShowPipelineDropdown(!showPipelineDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all text-sm"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-white font-medium">{activePipeline?.name || 'Pipeline'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              {showPipelineDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowPipelineDropdown(false)} />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
                    <div className="p-2">
                      {pipelines.map(p => (
                        <button
                          key={p.id}
                          onClick={() => { setActivePipelineId(p.id); setShowPipelineDropdown(false); }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${activePipelineId === p.id
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5" />
                            <span className="font-medium">{p.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-600">{p._count.leads} leads</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); openPipelineEditor(p); }}
                              className="p-1 hover:bg-zinc-700 rounded transition-colors"
                            >
                              <Settings2 className="w-3 h-3 text-zinc-500" />
                            </button>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-zinc-800 p-2">
                      <button
                        onClick={() => openPipelineEditor()}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg text-sm font-medium transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Novo Pipeline
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Button onClick={() => router.push('/dashboard')} variant="ghost" className="text-zinc-500 gap-2 border border-zinc-800 hover:bg-zinc-800/50 text-sm">
              <ChevronLeft className="w-4 h-4" /> Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-8">
        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Leads" value={stats.total} icon={<Users className="w-5 h-5 text-emerald-400" />} description="Neste pipeline" />
          <StatsCard title="Novos" value={stats.new} icon={<Sparkles className="w-5 h-5 text-amber-400" />} description="Aguardando contato" />
          <StatsCard title="Em Negociação" value={stats.active} icon={<Target className="w-5 h-5 text-purple-400" />} description="Pipeline ativo" />
          <StatsCard title="Conversão" value={`${stats.conversion}%`} icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} description="Taxa de fechamento" />
        </div>

        {/* SEARCH */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Buscar por nome, fone ou prioridade..."
              className="pl-11 bg-zinc-900/50 border-zinc-800 h-11 rounded-lg focus:border-emerald-500/50 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && <X onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 cursor-pointer hover:text-white transition-colors" />}
          </div>
        </div>

        {/* KANBAN */}
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-5 overflow-x-auto pb-8 min-h-[60vh]" style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272a transparent' }}>
            {activeStages.map((stage) => (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                leads={filteredLeads.filter(l => l.stage === stage.name)}
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

      {/* MODAL DETALHES DO LEAD */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden bg-[#0a0a0f] border-zinc-800 p-0 shadow-2xl shadow-black/50 flex flex-col">
          {selectedLead && (
            <>
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                    {selectedLead.name.charAt(0)}
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white">{selectedLead.name}</DialogTitle>
                    <p className="text-sm text-zinc-500">{selectedLead.phone}</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setShowDeleteDialog(true)} className="text-rose-500 hover:bg-rose-500/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Configurações</Label>
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] text-zinc-500">Prioridade</Label>
                        <div className="flex gap-2">
                          {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => updateLead(selectedLead.id, { priority: p })}
                              className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${(selectedLead.priority || 'MEDIUM') === p
                                ? `${PRIORITIES[p].bg} ${PRIORITIES[p].border} ${PRIORITIES[p].color} ring-1 ring-current`
                                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:bg-zinc-900'
                                }`}
                            >
                              {PRIORITIES[p].label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-zinc-500">E-mail</Label>
                        <Input className="bg-zinc-950 h-9 border-zinc-800 text-sm" value={selectedLead.email || ''} onChange={(e) => setSelectedLead({ ...selectedLead, email: e.target.value })} onBlur={(e) => updateLead(selectedLead.id, { email: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                      <Brain className="w-3 h-3" /> Resumo IA
                    </Label>
                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 min-h-[150px] flex flex-col items-center justify-center text-center">
                      {selectedLead.summary ? (
                        <p className="text-sm text-zinc-300 italic">"{selectedLead.summary}"</p>
                      ) : (
                        <>
                          <p className="text-xs text-zinc-500 mb-4 px-4">Analise o perfil deste lead automaticamente.</p>
                          <Button size="sm" onClick={() => setShowPaywallDialog(true)} className="bg-purple-600 rounded-full px-6 text-xs h-10">
                            Gerar resumo da conversa
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-bold text-white tracking-tight text-sm">Conversas Recentes</h3>
                  </div>
                  <div className="space-y-3">
                    {selectedLead.messages?.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.fromLead ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.fromLead ? 'bg-zinc-800/50 border border-zinc-700 text-zinc-200' : 'bg-emerald-600 text-white'}`}>
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

      {/* DELETE LEAD DIALOG */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#0a0a0f] border-zinc-800 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-500">Excluir Lead?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-none text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteLead} className="bg-rose-600 hover:bg-rose-700 border-none">
              {deletingLead ? "Excluindo..." : "Sim, Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PAYWALL DIALOG */}
      <AlertDialog open={showPaywallDialog} onOpenChange={setShowPaywallDialog}>
        <AlertDialogContent className="bg-[#0a0a0f] border-zinc-800 text-zinc-100 max-w-sm">
          <AlertDialogHeader>
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-xl shadow-purple-500/20">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <AlertDialogTitle className="text-center">Recurso Premium</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-zinc-400">A análise automática de leads está disponível nos planos corporativos.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 mt-4">
            <AlertDialogAction className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 rounded-xl border-none" onClick={() => window.open('https://wa.me/5562996917009', '_blank')}>Fazer Upgrade</AlertDialogAction>
            <AlertDialogCancel className="w-full bg-transparent border-zinc-800 text-zinc-500">Depois</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PIPELINE EDITOR MODAL */}
      <Dialog open={showPipelineEditor} onOpenChange={setShowPipelineEditor}>
        <DialogContent className="max-w-md bg-[#0a0a0f] border-zinc-800 p-0 overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <DialogTitle className="text-lg font-bold text-white">
              {editingPipeline ? 'Editar Pipeline' : 'Novo Pipeline'}
            </DialogTitle>
            <p className="text-zinc-500 text-xs mt-1">Defina o nome e as etapas do Kanban</p>
          </div>

          <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Nome */}
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400 font-medium">Nome do Pipeline</Label>
              <Input
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                placeholder="Ex: Vendas, Suporte, Projetos..."
                className="bg-zinc-900/50 border-zinc-800 h-10 text-sm focus:border-emerald-500/50"
              />
            </div>

            {/* Stages */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-zinc-400 font-medium">Etapas do Kanban</Label>
                <button onClick={addStage} className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-colors">
                  <Plus className="w-3 h-3" /> Adicionar
                </button>
              </div>

              <div className="space-y-2">
                {pipelineStages.map((stage, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-zinc-900/50 border border-zinc-800 rounded-lg group">
                    <GripVertical className="w-3.5 h-3.5 text-zinc-700 flex-shrink-0" />
                    <input
                      type="color"
                      value={stage.color}
                      onChange={(e) => updateStage(index, 'color', e.target.value)}
                      className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent flex-shrink-0"
                    />
                    <Input
                      value={stage.name}
                      onChange={(e) => updateStage(index, 'name', e.target.value)}
                      className="bg-transparent border-0 h-7 text-sm text-white p-0 focus-visible:ring-0"
                      placeholder="Nome da etapa"
                    />
                    <button
                      onClick={() => removeStage(index)}
                      className="p-1 text-zinc-700 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-zinc-800 space-y-3">
            <Button
              onClick={savePipeline}
              disabled={savingPipeline}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-10 text-sm"
            >
              {savingPipeline ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Salvar Pipeline</>}
            </Button>
            {editingPipeline && !editingPipeline.isDefault && (
              <button
                onClick={() => setShowDeletePipelineDialog(true)}
                className="w-full text-rose-400 hover:text-rose-300 text-xs font-medium py-2 transition-colors"
              >
                Excluir este pipeline
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE PIPELINE DIALOG */}
      <AlertDialog open={showDeletePipelineDialog} onOpenChange={setShowDeletePipelineDialog}>
        <AlertDialogContent className="bg-[#0a0a0f] border-zinc-800 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-500">Excluir Pipeline?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Os leads serão movidos para o pipeline padrão.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-none text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deletePipeline} className="bg-rose-600 hover:bg-rose-700 border-none">
              Excluir Pipeline
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// --- KANBAN COMPONENTS ---

function KanbanColumn({ stage, leads, onLeadClick }: { stage: PipelineStage; leads: Lead[]; onLeadClick: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.name });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-[290px] rounded-xl border bg-zinc-900/30 border-zinc-800/50 p-4 min-h-[500px] transition-all flex flex-col gap-3 ${isOver ? 'border-emerald-500/30 bg-emerald-500/[0.02]' : ''}`}
      style={{ borderTopWidth: '3px', borderTopColor: stage.color }}
    >
      <div className="flex items-center justify-between px-1 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
          <h3 className="font-bold text-xs text-zinc-300 uppercase tracking-tight">{stage.name}</h3>
        </div>
        <Badge variant="outline" className="bg-zinc-950/50 border-zinc-800 text-zinc-500 font-mono text-[10px]">{leads.length}</Badge>
      </div>
      <div className="space-y-2.5 flex-1 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272a transparent' }}>
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead.id)} />
        ))}
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-32 text-zinc-700 text-xs">
            Nenhum lead neste estágio
          </div>
        )}
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
      className={`group bg-zinc-900/80 border border-zinc-800 rounded-lg p-3.5 cursor-grab active:cursor-grabbing hover:border-zinc-600 transition-all ${isDragging ? 'opacity-40' : ''}`}
    >
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${priorityInfo.bg} ${priorityInfo.border}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${priorityInfo.dot}`} />
            <span className={`text-[9px] font-bold uppercase tracking-wider ${priorityInfo.color}`}>{priorityInfo.label}</span>
          </div>
          <span className="text-[9px] text-zinc-700 font-mono">#{lead.id.slice(-4)}</span>
        </div>

        <h4 className="font-semibold text-[13px] text-white leading-tight group-hover:text-emerald-400 transition-colors">{lead.name}</h4>

        {lead.lastMessage && (
          <p className="text-[11px] text-zinc-400 line-clamp-2 bg-zinc-950/50 p-2 rounded-md border border-zinc-800/50 italic">
            "{lead.lastMessage}"
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-emerald-500/70" />
            <span className="text-[10px] text-zinc-500 font-medium">{lead.phone}</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-zinc-600">
            <MessageSquare className="w-2.5 h-2.5" /> {lead._count?.messages || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
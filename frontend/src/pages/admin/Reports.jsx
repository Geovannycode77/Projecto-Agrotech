import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminService } from "../../services/api";
import api from "../../services/api";
import {
  FileText, Download, Calendar, Users,
  DollarSign, Package, Activity, Printer, Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const gerarPDF = (titulo, secoes) => {
  const conteudoHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${titulo}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        h1 { color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px; }
        h2 { color: #374151; margin-top: 24px; font-size: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #f3f4f6; padding: 8px 12px; text-align: left; border: 1px solid #e5e7eb; font-size: 13px; }
        td { padding: 8px 12px; border: 1px solid #e5e7eb; font-size: 13px; }
        tr:nth-child(even) { background: #f9fafb; }
        .meta { color: #6b7280; font-size: 13px; margin-bottom: 20px; }
        .footer { margin-top: 40px; color: #9ca3af; font-size: 11px; border-top: 1px solid #e5e7eb; padding-top: 10px; }
        @media print { body { margin: 20px; } }
      </style>
    </head>
    <body>
      <h1>AgroTech — ${titulo}</h1>
      <p class="meta">Gerado em: ${new Date().toLocaleString('pt-AO')}</p>
      ${secoes.map(s => `
        <h2>${s.titulo}</h2>
        <table>
          <thead><tr>${s.colunas.map(c => `<th>${c}</th>`).join('')}</tr></thead>
          <tbody>${s.linhas.map(l => `<tr>${l.map(c => `<td>${c ?? '—'}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      `).join('')}
      <div class="footer">AgroTech — Sistema de Gestão de Fazenda © ${new Date().getFullYear()}</div>
    </body>
    </html>
  `;

  const janela = window.open('', '_blank');
  if (!janela) {
    alert('Permita pop-ups para gerar o PDF.');
    return;
  }
  janela.document.write(conteudoHTML);
  janela.document.close();
  janela.focus();
  setTimeout(() => { janela.print(); }, 800);
};

export default function AdminReports() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    end:   new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    adminService.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async (reportId) => {
    setGerando(reportId);
    try {
      switch (reportId) {

        case 'users': {
          const usersRes = await adminService.getUsers();
          const users = usersRes.results || usersRes;
          gerarPDF('Relatório de Utilizadores', [
            {
              titulo: 'Lista de Utilizadores',
              colunas: ['Email', 'Função', 'Estado', 'Data de Registo'],
              linhas: users.map(u => [
                u.email,
                u.role || '—',
                u.is_approved ? 'Aprovado' : 'Pendente',
                u.date_joined ? new Date(u.date_joined).toLocaleDateString('pt-BR') : '—',
              ]),
            },
            {
              titulo: 'Resumo por Função',
              colunas: ['Função', 'Total'],
              linhas: stats?.users_by_role
                ? Object.entries(stats.users_by_role).map(([r, c]) => [r, c])
                : [['Sem dados', '']],
            },
          ]);
          break;
        }

        case 'financial': {
          const [receitasRes, despesasRes] = await Promise.allSettled([
            api.get('gestor-financeiro/receitas/'),
            api.get('gestor-financeiro/despesas/'),
          ]);
          const receitas = receitasRes.status === 'fulfilled'
            ? (receitasRes.value.data.results || receitasRes.value.data) : [];
          const despesas = despesasRes.status === 'fulfilled'
            ? (despesasRes.value.data.results || despesasRes.value.data) : [];

          const totalR = receitas.reduce((s, r) => s + parseFloat(r.valor || 0), 0);
          const totalD = despesas.reduce((s, d) => s + parseFloat(d.valor || 0), 0);

          gerarPDF('Relatório Financeiro', [
            {
              titulo: 'Receitas',
              colunas: ['Data', 'Categoria', 'Descrição', 'Valor (AOA)'],
              linhas: receitas.length > 0
                ? receitas.map(r => [
                    r.data || '—',
                    r.categoria_display || r.categoria || '—',
                    r.descricao || '—',
                    parseFloat(r.valor || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 }),
                  ])
                : [['Sem registos', '', '', '']],
            },
            {
              titulo: 'Despesas',
              colunas: ['Data', 'Categoria', 'Descrição', 'Valor (AOA)'],
              linhas: despesas.length > 0
                ? despesas.map(d => [
                    d.data || '—',
                    d.categoria_display || d.categoria || '—',
                    d.descricao || '—',
                    parseFloat(d.valor || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 }),
                  ])
                : [['Sem registos', '', '', '']],
            },
            {
              titulo: 'Resumo',
              colunas: ['Métrica', 'Valor (AOA)'],
              linhas: [
                ['Total Receitas', totalR.toLocaleString('pt-AO', { minimumFractionDigits: 2 })],
                ['Total Despesas', totalD.toLocaleString('pt-AO', { minimumFractionDigits: 2 })],
                ['Lucro Líquido',  (totalR - totalD).toLocaleString('pt-AO', { minimumFractionDigits: 2 })],
              ],
            },
          ]);
          break;
        }

        case 'production': {
          const animaisRes = await api.get('produtor/animais/').catch(() => ({ data: [] }));
          const animais = animaisRes.data.results || animaisRes.data || [];

          gerarPDF('Relatório de Produção', [
            {
              titulo: 'Lista de Animais',
              colunas: ['Brinco', 'Nome', 'Espécie', 'Sexo', 'Peso (kg)', 'Estado'],
              linhas: animais.length > 0
                ? animais.map(a => [
                    a.brinco || '—',
                    a.nome || '—',
                    a.especie || '—',
                    a.sexo === 'M' ? 'Macho' : 'Fêmea',
                    a.peso_atual || '—',
                    a.status || '—',
                  ])
                : [['Sem animais cadastrados', '', '', '', '', '']],
            },
            {
              titulo: 'Resumo do Rebanho',
              colunas: ['Métrica', 'Valor'],
              linhas: [
                ['Total de Animais', animais.length],
                ['Machos',           animais.filter(a => a.sexo === 'M').length],
                ['Fêmeas',           animais.filter(a => a.sexo === 'F').length],
                ['Activos',          animais.filter(a => a.status === 'ativo').length],
                ['Doentes',          animais.filter(a => a.status === 'doente').length],
                ['Peso Médio (kg)',   animais.length > 0
                  ? Math.round(animais.reduce((s, a) => s + parseFloat(a.peso_atual || 0), 0) / animais.length)
                  : 0],
              ],
            },
          ]);
          break;
        }

        case 'activity': {
          const usersRes = await adminService.getUsers();
          const users = usersRes.results || usersRes;

          gerarPDF('Relatório de Actividades', [
            {
              titulo: 'Estado dos Utilizadores',
              colunas: ['Email', 'Função', 'Aprovado', 'Email Confirmado', 'Bloqueado'],
              linhas: users.map(u => [
                u.email,
                u.role || '—',
                u.is_approved     ? 'Sim' : 'Não',
                u.email_confirmed ? 'Sim' : 'Não',
                u.is_blocked      ? 'Sim' : 'Não',
              ]),
            },
            {
              titulo: 'Estatísticas Gerais',
              colunas: ['Métrica', 'Valor'],
              linhas: [
                ['Total Utilizadores', stats?.total_users    || 0],
                ['Aprovados',          stats?.approved_users || 0],
                ['Pendentes',          stats?.pending_users  || 0],
                ['Total Fazendas',     stats?.total_farms    || 0],
                ['Total Animais',      stats?.total_animals  || 0],
              ],
            },
          ]);
          break;
        }

        default: break;
      }

      toast({ title: 'Relatório gerado', description: 'Escolha "Guardar como PDF" no diálogo de impressão.' });

    } catch (err) {
      console.error('Erro:', err);
      toast({ title: 'Erro', description: 'Erro ao gerar relatório.', variant: 'destructive' });
    } finally {
      setGerando(null);
    }
  };

  const handleExportCSV = () => {
    if (!stats) return;
    const linhas = [
      'Métrica,Valor',
      `Total Utilizadores,${stats.total_users    || 0}`,
      `Aprovados,${stats.approved_users          || 0}`,
      `Pendentes,${stats.pending_users           || 0}`,
      `Total Fazendas,${stats.total_farms        || 0}`,
      `Total Animais,${stats.total_animals       || 0}`,
      '',
      'Função,Total',
      ...(stats.users_by_role
        ? Object.entries(stats.users_by_role).map(([r, c]) => `${r},${c}`)
        : []),
    ];
    const blob = new Blob([linhas.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `agrotech_dados_${dateRange.start}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'CSV exportado com sucesso.' });
  };

  const reportTypes = [
    { id: 'users',      name: 'Utilizadores', icon: Users,      color: 'from-blue-500 to-cyan-500',    description: 'Lista completa de utilizadores' },
    { id: 'financial',  name: 'Financeiro',   icon: DollarSign, color: 'from-green-500 to-emerald-500', description: 'Receitas, despesas e lucro' },
    { id: 'production', name: 'Produção',     icon: Package,    color: 'from-yellow-500 to-orange-500', description: 'Lista e resumo do rebanho' },
    { id: 'activity',   name: 'Actividades',  icon: Activity,   color: 'from-purple-500 to-pink-500',   description: 'Estado e actividade dos utilizadores' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Relatórios Gerais</h1>
        <p className="text-gray-500 mt-1">Gere e exporte relatórios do sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-gray-600 block mb-1">Data Inicial</label>
              <input type="date" value={dateRange.start}
                onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-600 block mb-1">Data Final</label>
              <input type="date" value={dateRange.end}
                onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Utilizadores', valor: stats.total_users    || 0, icon: Users,   cor: 'text-blue-600',   bg: 'bg-blue-50' },
            { label: 'Aprovados',    valor: stats.approved_users || 0, icon: Users,   cor: 'text-emerald-600',bg: 'bg-emerald-50' },
            { label: 'Pendentes',    valor: stats.pending_users  || 0, icon: Users,   cor: 'text-amber-600',  bg: 'bg-amber-50' },
            { label: 'Fazendas',     valor: stats.total_farms    || 0, icon: Package, cor: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((item, i) => (
            <Card key={i}>
              <CardContent className="pt-4 pb-4">
                <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center mb-2`}>
                  <item.icon className={`h-5 w-5 ${item.cor}`} />
                </div>
                <p className="text-2xl font-bold">{item.valor}</p>
                <p className="text-sm text-gray-500">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTypes.map(report => {
            const Icon = report.icon;
            const busy = gerando === report.id;
            return (
              <Card key={report.id}
                className={`cursor-pointer hover:shadow-lg transition-shadow ${busy ? 'opacity-70 pointer-events-none' : ''}`}
                onClick={() => !gerando && handleGenerate(report.id)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center`}>
                      {busy
                        ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                        : <Icon className="w-6 h-6 text-white" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{report.name}</h3>
                      <p className="text-sm text-gray-500">{report.description}</p>
                    </div>
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-600" />Exportar Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleExportCSV} className="gap-2">
              <Download className="w-4 h-4" />Exportar como CSV
            </Button>
            <Button variant="outline" onClick={() => window.print()} className="gap-2">
              <Printer className="w-4 h-4" />Imprimir página
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Os relatórios abrem uma janela de impressão — escolha "Guardar como PDF" no diálogo do browser.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
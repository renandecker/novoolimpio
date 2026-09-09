import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api} from '../../shared/services/api';
import {PermissionGate} from '../../shared/services/permissions';
import {ScheduleWeekView, mondayOf, toIsoDate} from '../../shared/components/WeeklyGrid';
import type {ScheduleEventData} from '../../shared/components/WeeklyGrid';
import '../../features/professor/Disponibilidade.css';

interface UnidadeRow {
    id: number;
    nome_fantasia?: string;
    razao_social?: string;
    fl_ativo?: boolean;
}

const LEGENDA = [
    {className: 'evento-yellow', label: 'Em andamento'},
    {className: 'evento-green', label: 'Liberada'},
    {className: 'evento-orange', label: 'Pendente'},
    {className: 'evento-red', label: 'Lotada'},
    {className: 'evento-black', label: 'Concluída'},
    {className: 'evento-purple', label: 'Finalizada'},
    {className: 'evento-blue', label: 'Outro / Feriado'},
];

export default function ViewOferecimentoComponenteCurricularDisponibilidadeOferecimentoListScreen() {
    const [unidadeId, setUnidadeId] = useState('');
    const [weekStart, setWeekStart] = useState(() => toIsoDate(mondayOf(new Date())));

    const unidadesQuery = useQuery({
        queryKey: ['disp-oferecimento-unidades'],
        queryFn: async () => (await api.get<UnidadeRow[]>('/api/view/unidade/listUnidade')).data,
    });

    const eventosQuery = useQuery({
        queryKey: ['disp-oferecimento-eventos', unidadeId, weekStart],
        queryFn: async () =>
            (
                await api.get<ScheduleEventData[]>('/api/educacao/disponibilidade-oferecimento-curso/schedule-events', {
                    params: {unidadeId, inicio: weekStart, fim: weekStart},
                })
            ).data,
        enabled: !!unidadeId,
    });

    const unidades = (unidadesQuery.data ?? []).filter((u) => u.fl_ativo !== false);

    return (
        <PermissionGate permission="READ">
            <main className="disp-screens">
                <h1>Disponibilidade do Oferecimento</h1>
                <div className="disp-filtros">
                    <div className="disp-filtro">
                        <label htmlFor="disp-oferecimento-unidade">Unidade</label>
                        <select
                            id="disp-oferecimento-unidade"
                            className="disp-select"
                            value={unidadeId}
                            onChange={(e) => setUnidadeId(e.target.value)}
                        >
                            <option value="">Selecione a unidade</option>
                            {unidades.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.nome_fantasia || u.razao_social || `Unidade ${u.id}`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {!unidadeId && <p className="disp-aviso">Selecione uma unidade para visualizar a agenda semanal.</p>}
                <ScheduleWeekView
                    startDate={weekStart}
                    onWeekChange={setWeekStart}
                    events={eventosQuery.data ?? []}
                    loading={!!unidadeId && eventosQuery.isLoading}
                    error={eventosQuery.isError ? 'Erro ao carregar a agenda.' : null}
                    legend={LEGENDA}
                />
            </main>
        </PermissionGate>
    );
}

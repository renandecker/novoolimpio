import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api} from '../../../shared/services/api';
import {PermissionGate} from '../../../shared/services/permissions';
import {ScheduleWeekView, mondayOf, toIsoDate, monthRangeForWeek} from '../../../shared/components/WeeklyGrid';
import type {ScheduleEventData} from '../../../shared/components/WeeklyGrid';
import '../../professor/Disponibilidade.css';

interface UnidadeRow {
    id: number;
    nome_fantasia?: string;
    razao_social?: string;
    fl_ativo?: boolean;
}

interface Sala {
    id: number;
    numero?: number | null;
    descricao?: string;
    sucinto?: string;
    unidadeId?: number | null;
}

const LEGENDA_TODAS = [
    {className: 'evento-blue', label: 'Feriado'},
    {className: 'evento-yellow', label: 'Aula (todas as salas)'},
];

const LEGENDA_SALA = [
    {className: 'evento-blue', label: 'Feriado'},
    {className: 'evento-black', label: 'Aula na sala'},
];

export default function ViewDisponibilidadeSalaListDisponibilidadeSalaListScreen() {
    const [unidadeId, setUnidadeId] = useState('');
    const [salaId, setSalaId] = useState('');
    const [weekStart, setWeekStart] = useState(() => toIsoDate(mondayOf(new Date())));

    const {inicio: rangeInicio, fim: rangeFim} = monthRangeForWeek(weekStart);

    const unidadesQuery = useQuery({
        queryKey: ['disp-sala-unidades'],
        queryFn: async () => (await api.get<UnidadeRow[]>('/api/view/unidade/listUnidade')).data,
    });

    const salasQuery = useQuery({
        queryKey: ['disp-sala-salas', unidadeId],
        queryFn: async () => (await api.get<Sala[]>('/api/educacao/sala')).data,
        enabled: !!unidadeId,
    });

    const eventosQuery = useQuery({
        queryKey: ['disp-sala-eventos', unidadeId, salaId, rangeInicio, rangeFim],
        queryFn: async () =>
            (
                await api.get<ScheduleEventData[]>('/api/educacao/disponibilidade-sala/schedule-events', {
                    params: {
                        unidadeId,
                        ...(salaId ? {salaId} : {}),
                        inicio: rangeInicio,
                        fim: rangeFim,
                    },
                })
            ).data,
        enabled: !!unidadeId,
    });

    const unidades = (unidadesQuery.data ?? []).filter((u) => u.fl_ativo !== false);
    const salas = (salasQuery.data ?? []).filter((s) => s.unidadeId === Number(unidadeId));

    function labelSala(s: Sala): string {
        if (s.numero != null) return `Sala ${s.numero}`;
        if (s.sucinto) return `Sala ${s.sucinto}`;
        if (s.descricao) return `Sala ${s.descricao}`;
        return `Sala ${s.id}`;
    }

    return (
        <PermissionGate permission="READ">
            <main className="disp-screens">
                <h1>Disponibilidade de Sala</h1>
                <div className="disp-filtros">
                    <div className="disp-filtro">
                        <label htmlFor="disp-sala-unidade">Unidade</label>
                        <select
                            id="disp-sala-unidade"
                            className="disp-select"
                            value={unidadeId}
                            onChange={(e) => {
                                setUnidadeId(e.target.value);
                                setSalaId('');
                            }}
                        >
                            <option value="">Selecione a unidade</option>
                            {unidades.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.nome_fantasia || u.razao_social || `Unidade ${u.id}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="disp-filtro">
                        <label htmlFor="disp-sala">Sala</label>
                        <select
                            id="disp-sala"
                            className="disp-select"
                            value={salaId}
                            onChange={(e) => setSalaId(e.target.value)}
                            disabled={!unidadeId}
                        >
                            <option value="">Todas as salas</option>
                            {salas.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {labelSala(s)}
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
                    legend={salaId ? LEGENDA_SALA : LEGENDA_TODAS}
                />
            </main>
        </PermissionGate>
    );
}

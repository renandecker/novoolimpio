import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api} from '../api';
import {PermissionGate} from '../permissions';
import {ScheduleWeekView, mondayOf, toIsoDate} from '../WeeklyGrid';
import type {ScheduleEventData} from '../WeeklyGrid';
import '../Disponibilidade.css';

interface Opcao {
    id: number;
    nome: string;
}

const LEGENDA = [
    {className: 'evento-green', label: 'Disponível'},
    {className: 'evento-black', label: 'Aula (ocupado)'},
    {className: 'evento-blue', label: 'Feriado'},
];

export default function ViewDisponibilidadeProfessorListDisponibilidadeProfessorListScreen() {
    const [professorId, setProfessorId] = useState('');
    const [weekStart, setWeekStart] = useState(() => toIsoDate(mondayOf(new Date())));

    const opcoesQuery = useQuery({
        queryKey: ['disp-professor-opcoes'],
        queryFn: async () => (await api.get<Opcao[]>('/api/professor/disponibilidade-professor/opcoes-professores')).data,
    });

    const eventosQuery = useQuery({
        queryKey: ['disp-professor-eventos', professorId, weekStart],
        queryFn: async () =>
            (
                await api.get<ScheduleEventData[]>('/api/professor/disponibilidade-professor/schedule-events', {
                    params: {professorId, inicio: weekStart, fim: weekStart},
                })
            ).data,
        enabled: !!professorId,
    });

    const opcoes = opcoesQuery.data ? ? [];

    return (
        <PermissionGate permission="READ">
            <main className="disp-screens">
                <h1>Disponibilidade do Professor</h1>
                <div className="disp-filtros">
                    <div className="disp-filtro">
                        <label htmlFor="disp-professor">Professor</label>
                        <select
                            id="disp-professor"
                            className="disp-select"
                            value={professorId}
                            onChange={(e) => setProfessorId(e.target.value)}
                        >
                            <option value="">Selecione o professor</option>
                            {opcoes.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {!professorId && <p className="disp-aviso">Selecione um professor para visualizar a agenda semanal.</p>}
                <ScheduleWeekView
                    startDate={weekStart}
                    onWeekChange={setWeekStart}
                    events={eventosQuery.data ? ? []}
                    loading={!!professorId && eventosQuery.isLoading}
                    error={eventosQuery.isError ? 'Erro ao carregar a agenda.' : null}
                    legend={LEGENDA}
                />
            </main>
        </PermissionGate>
    );
}

import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api} from '../../shared/services/api';
import {PermissionGate} from '../../shared/services/permissions';
import {ScheduleWeekView, mondayOf, toIsoDate} from '../../shared/components/WeeklyGrid';
import type {ScheduleEventData} from '../../shared/components/WeeklyGrid';
import '../../features/professor/Disponibilidade.css';

interface Opcao {
    id: number;
    nome: string;
}

const LEGENDA = [
    {className: 'evento-green', label: 'Disponível'},
    {className: 'evento-black', label: 'Aula (ocupado)'},
    {className: 'evento-blue', label: 'Feriado'},
];

export default function ViewPessoaListDisponibilidadePessoaListScreen() {
    const [pessoaId, setPessoaId] = useState('');
    const [weekStart, setWeekStart] = useState(() => toIsoDate(mondayOf(new Date())));

    const opcoesQuery = useQuery({
        queryKey: ['disp-pessoa-opcoes'],
        queryFn: async () => (await api.get<Opcao[]>('/api/basico/disponibilidade-pessoa/opcoes-pessoas')).data,
    });

    const eventosQuery = useQuery({
        queryKey: ['disp-pessoa-eventos', pessoaId, weekStart],
        queryFn: async () =>
            (
                await api.get<ScheduleEventData[]>('/api/basico/disponibilidade-pessoa/schedule-events', {
                    params: {pessoaId, inicio: weekStart, fim: weekStart},
                })
            ).data,
        enabled: !!pessoaId,
    });

    const opcoes = opcoesQuery.data ?? [];

    return (
        <PermissionGate permission="READ">
            <main className="disp-screens">
                <h1>Disponibilidade da Pessoa</h1>
                <div className="disp-filtros">
                    <div className="disp-filtro">
                        <label htmlFor="disp-pessoa">Pessoa</label>
                        <select id="disp-pessoa" className="disp-select" value={pessoaId}
                                onChange={(e) => setPessoaId(e.target.value)}>
                            <option value="">Selecione a pessoa</option>
                            {opcoes.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {!pessoaId && <p className="disp-aviso">Selecione uma pessoa para visualizar a agenda semanal.</p>}
                <ScheduleWeekView
                    startDate={weekStart}
                    onWeekChange={setWeekStart}
                    events={eventosQuery.data ?? []}
                    loading={!!pessoaId && eventosQuery.isLoading}
                    error={eventosQuery.isError ? 'Erro ao carregar a agenda.' : null}
                    legend={LEGENDA}
                />
            </main>
        </PermissionGate>
    );
}

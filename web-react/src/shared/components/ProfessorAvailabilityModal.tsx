import {useEffect, useState} from 'react';

import {Modal} from './Modal';
import {ScheduleWeekView, mondayOf, toIsoDate, monthRangeForWeek, type ScheduleEventData} from './WeeklyGrid';
import {api} from '../services/api';

const LEGENDA = [
    {className: 'evento-green', label: 'Disponível'},
    {className: 'evento-black', label: 'Aula (ocupado)'},
    {className: 'evento-blue', label: 'Feriado'},
];

interface ProfessorAvailabilityModalProps {
    professorId: number | null;
    professorNome: string | null;
    open: boolean;
    onClose: () => void;
}

export function ProfessorAvailabilityModal({
    professorId,
    professorNome,
    open,
    onClose,
}: ProfessorAvailabilityModalProps) {
    const [weekStart, setWeekStart] = useState(() => toIsoDate(mondayOf(new Date())));
    const [eventos, setEventos] = useState<ScheduleEventData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open || !professorId) {
            setEventos([]);
            return;
        }

        const fetchEventos = async () => {
            setLoading(true);
            setError(null);
            try {
                const {inicio, fim} = monthRangeForWeek(weekStart);
                const res = await api.get<ScheduleEventData[]>('/api/professor/disponibilidade-professor/schedule-events', {
                    params: {professorId, inicio, fim},
                });
                setEventos(res.data ?? []);
            } catch (err) {
                setError('Erro ao carregar a agenda do professor.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEventos();
    }, [open, professorId, weekStart]);

    if (!open) return null;

    return (
        <Modal
            title={`Disponibilidade do Professor: ${professorNome ?? '—'}`}
            open={open}
            onClose={onClose}
            size="xl"
        >
            {!professorId && <p className="disp-aviso">Selecione um professor para visualizar a agenda semanal.</p>}
            <ScheduleWeekView
                startDate={weekStart}
                onWeekChange={setWeekStart}
                events={eventos}
                loading={loading}
                error={error}
                legend={LEGENDA}
            />
        </Modal>
    );
}
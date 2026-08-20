import {useMemo} from 'react';
import {useAuth} from './auth';
import {normalizeOutcome, useCurrentOutcome} from './permissions';

export type Module = {
    id: number;
    antecessorId: number | null;
    rotulo: string;
    descricao: string;
    icone: string;
    ajuda: string;
    outcome: string;
    ordem: number;
};

const normalize = (value: string) => normalizeOutcome(value).replace(/\/$/, '');

export const useCurrentModule = () => {
    const {session} = useAuth();
    const outcome = useCurrentOutcome();

    return useMemo(() => {
        const modulos = (session?.modules ? ? []) as Module[];
        const byId = new Map<number, Module>();
        for (const m of modulos) byId.set(m.id, m);

        const target =
            modulos.find((m) => normalize(m.outcome) === normalize(outcome)) ? ? null;

        const ancestors: Module[] = [];
        let current = target;
        while (current?.antecessorId != null) {
            const parent = byId.get(current.antecessorId);
            if (!parent) break;
            ancestors.unshift(parent);
            current = parent;
        }

        return {module: target, ancestors, outcome};
    }, [session?.modules, outcome]);
};

import React, {useEffect, useState} from 'react';
import {Alert} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {FormLayout, FormTabConfig} from '../FormLayout';
import {api} from '../api';

const DIRECAO_OPTIONS = [
    {value: 'HORIZONTAL', label: 'Horizontal'},
    {value: 'VERTICAL', label: 'Vertical'},
    {value: 'TOGGLE_REVERSE', label: 'Toggle Reverse'},
];

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

const tabs: FormTabConfig[] = [
    {
        key: 'definicao',
        label: 'Definição',
        fields: [
            {name: 'nome', label: 'Nome', required: true},
            {name: 'direcao', label: 'Direção', type: 'select', options: DIRECAO_OPTIONS, required: true},
            {
                name: 'sql',
                label: 'SQL',
                type: 'textarea',
                required: true,
                full: true,
                placeholder: 'select id, parentId, name, job, department, location, status, avatar from <Tabela> where <condição>',
            },
        ],
    },
];

export default function ViewRelatoriosFormOrganogramaListScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const idParam = (route.params as {id?: string} | undefined)?.id;

    const [organogramaId, setOrganogramaId] = useState<number | undefined>();
    const [initialValues, setInitialValues] = useState<Record<string, unknown>>({direcao: 'VERTICAL'});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!idParam) return;
        let ativo = true;
        (async () => {
            try {
                const resp = await api.get(`/api/relatorios/organograma/${idParam}`);
                if (!ativo) return;
                const organograma = resp.data as Record<string, unknown>;
                setOrganogramaId(organograma.id as number);
                setInitialValues({
                    nome: str(organograma.nome),
                    direcao: str(organograma.direcao) || 'VERTICAL',
                    sql: str(organograma.sql),
                });
            } catch (erro) {
                console.error('Erro ao carregar organograma:', erro);
                Alert.alert('Erro', 'Não foi possível carregar o registro.');
            }
        })();
        return () => {
            ativo = false;
        };
    }, [idParam]);

    const salvar = async (values: Record<string, unknown>) => {
        if (!values.nome || !values.sql) {
            Alert.alert('Atenção', 'Informe pelo menos Nome e SQL.');
            return;
        }
        setSaving(true);
        try {
            const body = {
                nome: values.nome,
                direcao: values.direcao || 'VERTICAL',
                sql: values.sql,
            };
            if (organogramaId) {
                await api.put(`/api/relatorios/organograma/${organogramaId}`, body);
            } else {
                await api.post('/api/relatorios/organograma', body);
            }
            Alert.alert('Sucesso', 'Organograma salvo com sucesso.', [
                {text: 'OK', onPress: () => navigation.goBack()},
            ]);
        } catch (erro) {
            console.error('Erro ao salvar organograma:', erro);
            Alert.alert('Erro', 'Não foi possível salvar o organograma.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <FormLayout
            title={organogramaId ? `Organograma #${organogramaId}` : 'Novo Organograma'}
            tabs={tabs}
            initialValues={initialValues}
            onSubmit={salvar}
            onCancel={() => navigation.goBack()}
            submitLabel={saving ? 'Salvando...' : 'Salvar'}
            cancelLabel="Voltar"
        />
    );
}

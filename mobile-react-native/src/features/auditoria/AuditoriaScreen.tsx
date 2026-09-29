import React, {useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, ScrollView} from 'react-native';
import {Tabs} from '../../Tabs';
import {api} from '../../shared/services/api';
import {AUDITORIA_GRUPOS} from '../../auditoria/auditoriaGrupos';

function AuditGroup({grupo}: { grupo: { key: string; label: string; itens: any[] } }) {
    const [activeSub, setActiveSub] = useState(grupo.itens[0]?.key);

    return (
        <View style={{marginBottom: 24}}>
            <Text style={{fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#2a5a88'}}>
                {grupo.label}
            </Text>
            <Tabs
                tabs={grupo.itens.map((tab) => ({
                    key: tab.key,
                    label: tab.label,
                    content: <AuditTab entidade={tab.entidade} titulo={tab.label} />,
                }))}
                initial={activeSub}
            />
        </View>
    );
}

function AuditTab({entidade, titulo}: { entidade: string; titulo: string }) {
    const [page, setPage] = useState(0);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const PAGE_SIZE = 20;

    const query = useQuery({
        queryKey: ['auditoria', entidade, page],
        queryFn: async () => {
            const response = await api.get('/api/educacao/auditoria', {
                params: {entidade, page, size: PAGE_SIZE},
            });
            return response.data;
        },
    });

    const items = query.data?.content ?? [];
    const totalPages = Math.max(1, query.data?.totalPages ?? 0);
    const totalElements = query.data?.totalElements ?? 0;

    const toggle = (item: any) => {
        const key = `${item.id}-${item.rev}`;
        setExpanded((prev) => ({...prev, [key]: !prev[key]}));
    };

    if (query.isPending) {
        return (
            <View style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 32}}>
                <ActivityIndicator size="large"/> <Text style={{color: '#666'}}>Carregando...</Text>
            </View>
        );
    }

    if (query.isError) {
        return (
            <View style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 32}}>
                <Text style={{color: '#B00020'}}>Erro ao carregar a auditoria de {titulo.toLowerCase()}.</Text>
            </View>
        );
    }

    if (items.length === 0) {
        return (
            <View style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 32}}>
                <Text style={{color: '#888'}}>Nenhum registro encontrado.</Text>
            </View>
        );
    }

    return (
        <View style={{}}>
            <FlatList
                data={items}
                keyExtractor={(item) => `${item.id}-${item.rev}`}
                renderItem={({item}) => {
                    const key = `${item.id}-${item.rev}`;
                    const isOpen = Boolean(expanded[key]);
                    return (
                        <View style={{borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, marginBottom: 8, overflow: 'hidden'}}>
                            <Pressable onPress={() => toggle(item)} style={{flexDirection: 'row', alignItems: 'center', padding: 10}}>
                                <Text style={{width: 24, color: '#2a5a88', fontWeight: '700'}}>
                                    {isOpen ? '▼' : '▶'}
                                </Text>
                                <View style={{flex: 1}}>
                                    <Text style={{fontSize: 14, fontWeight: '700'}}>Id {item.id ?? '-'} · Rev {item.rev ?? '-'}</Text>
                                    <Text style={{fontSize: 12, color: '#666'}}>{formatData(item.data)}</Text>
                                    <Text style={{fontSize: 12, color: '#666'}}>{item.usuario ?? '-'} · {item.acao ?? '-'}</Text>
                                </View>
                            </Pressable>
                            {isOpen && (
                                <View style={{borderTopWidth: 1, borderTopColor: '#eee', padding: 10}}>
                                    {item.campos.length === 0 ? (
                                        <Text style={{color: '#888'}}>Nenhum campo.</Text>
                                    ) : (
                                        item.campos.map((campo) => (
                                            <View key={campo.nome} style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2}}>
                                                <Text style={{fontSize: 12, fontWeight: '600', flex: 1}}>{campo.nome}</Text>
                                                <Text style={{fontSize: 12, color: '#333', flex: 1, textAlign: 'right'}}>
                                                    {formatValor(campo.valor)}
                                                </Text>
                                            </View>
                                        ))
                                    )}
                                </View>
                            )}
                        </View>
                    );
                }}
            />
        </View>
    );
}

const formatData = (data: number | string | null): string => {
    if (data === null || data === undefined) return '-';
    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return String(data);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(date.getDate())}/${p(date.getMonth() + 1)}/${date.getFullYear()} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
};

const formatValor = (valor: unknown): string => {
    if (valor === null || valor === undefined) return '-';
    if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não';
    return String(valor);
};

export default function AuditoriaScreen() {
    return (
        <View style={{flex: 1, padding: 12}}>
            <Text style={{fontSize: 20, fontWeight: '700', marginBottom: 8}}>Auditoria</Text>
            <ScrollView>
                <Tabs
                    tabs={AUDITORIA_GRUPOS.map((grupo) => ({
                        key: grupo.key,
                        label: grupo.label,
                        content: <AuditGroup grupo={grupo} />,
                    }))}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 12},
    title: {fontSize: 20, fontWeight: '700', marginBottom: 8},
    center: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 32},
    muted: {color: '#888', fontStyle: 'italic'},
    error: {color: '#B00020'},
});
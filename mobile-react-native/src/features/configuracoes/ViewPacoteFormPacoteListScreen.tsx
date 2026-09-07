import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, TextInput, Button, ScrollView, StyleSheet, Alert, FlatList, TouchableOpacity} from 'react-native';
import {ModuleTabs} from '../ModuleTabs';

const ACaoDeCampanha = [
    {id: 1, descricao: 'Telemarketing Ativo', tipoCanal: {descricao: 'Telefone'}},
    {id: 2, descricao: 'Telemarketing Receptivo', tipoCanal: {descricao: 'Telefone'}},
    {id: 3, descricao: 'E-mail Marketing', tipoCanal: {descricao: 'E-mail'}},
    {id: 4, descricao: 'WhatsApp', tipoCanal: {descricao: 'WhatsApp'}},
    {id: 5, descricao: 'SMS', tipoCanal: {descricao: 'SMS'}},
];

const TIPOS_FILTRO_LIGACAO = [
    {id: 0, descricao: 'Selecione'},
    {id: 6, descricao: 'Ligação nunca feita'},
    {id: 1, descricao: 'Resultado ligação'},
    {id: 2, descricao: 'Quantidade ligação'},
    {id: 3, descricao: 'Estar no período ligação'},
    {id: 5, descricao: 'Fora do período ligação'},
    {id: 4, descricao: 'Somente no período ligação'},
];

const OPERACOES = [
    {value: 'EQ', label: 'Igual'},
    {value: 'NE', label: 'Diferente'},
    {value: 'GT', label: 'Maior que'},
    {value: 'LT', label: 'Menor que'},
    {value: 'GE', label: 'Maior ou igual'},
    {value: 'LE', label: 'Menor ou igual'},
    {value: 'LIKE', label: 'Contém'},
    {value: 'BETWEEN', label: 'Entre'},
    {value: 'IN', label: 'Na lista'},
];

const TIPO_FILTRO_ACADEMICO = [
    {id: 0, descricao: 'Selecione'},
    {id: 1, descricao: 'Status Oferecimento'},
    {id: 2, descricao: 'Aluno'},
    {id: 3, descricao: 'Não aluno'},
    {id: 4, descricao: 'Matriculado no período'},
    {id: 5, descricao: 'Matriculado somente no período'},
    {id: 6, descricao: 'Matriculado fora do período'},
    {id: 7, descricao: 'Matriculado'},
    {id: 8, descricao: 'Não Matriculado'},
];

interface FiltroAcaoItem {
    key: string;
    id?: number;
    descricao?: string;
    tipoAcao?: {descricao: string};
    contratante?: {pessoaFisica: {nome: string}};
}

interface FiltroCampoItem {
    key: string;
    campo?: {id: number; rotulo: string; tipo: string};
    operacao?: string;
    valor?: string;
    data?: string;
    data2?: string;
    valorCidade?: string;
    valorCampoInformacao?: string;
}

interface FiltroLigacaoItem {
    key: string;
    tipoFiltro?: number;
    resultadoContato?: {descricao: string};
    operacao?: string;
    data?: string;
    data2?: string;
    quantidade?: number;
    quantidade2?: number;
}

interface FiltroAcademicoItem {
    key: string;
    tipoFiltro?: number;
    curriculo?: {sucinto: string; curso: {nome: string}};
    componenteCurricular?: {descricao: string};
    status?: string;
    operacao?: string;
    data?: string;
    data2?: string;
}

export default function ViewPacoteFormPacoteListScreen() {
    const [descricao, setDescricao] = useState('');
    const [acaoCampanhaId, setAcaoCampanhaId] = useState<number | ''>('');
    const [unidadeId, setUnidadeId] = useState<number | ''>('');
    const [numeroProspectos, setNumeroProspectos] = useState<number | ''>('');

    const [filtrosAcao, setFiltrosAcao] = useState<FiltroAcaoItem[]>([]);
    const [filtrosCampo, setFiltrosCampo] = useState<FiltroCampoItem[]>([]);
    const [filtrosLigacao, setFiltrosLigacao] = useState<FiltroLigacaoItem[]>([]);
    const [filtrosAcademico, setFiltrosAcademico] = useState<FiltroAcademicoItem[]>([]);

    const [direcionamento, setDirecionamento] = useState('');
    const [coordenadorId, setCoordenadorId] = useState<number | ''>('');
    const [coordenadorNome, setCoordenadorNome] = useState('');
    const [usuarios, setUsuarios] = useState<{id: number; login: string; nome?: string}[]>([]);

    const [acoesCampanha, setAcoesCampanha] = useState<any[]>([]);
    const [unidades, setUnidades] = useState<any[]>([]);
    const [campos, setCampos] = useState<any[]>([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/comercial/acao');
                if (response.ok) {
                    const data = await response.json();
                    setAcoesCampanha(Array.isArray(data) ? data : []);
                }
            } catch (e) {
                console.error('Erro ao carregar ações:', e);
            }

            try {
                const response = await fetch('http://localhost:8080/api/basico/unidade');
                if (response.ok) {
                    const data = await response.json();
                    setUnidades(Array.isArray(data) ? data : []);
                }
            } catch (e) {
                console.error('Erro ao carregar unidades:', e);
            }

            try {
                const response = await fetch('http://localhost:8080/api/comercial/campo');
                if (response.ok) {
                    const data = await response.json();
                    setCampos(Array.isArray(data) ? data : []);
                }
            } catch (e) {
                console.error('Erro ao carregar campos:', e);
            }

            setCarregando(false);
        };

        carregarDados();
    }, []);

    const handleSave = async () => {
        if (!acaoCampanhaId) {
            Alert.alert('Erro', 'Selecione uma Ação de Campanha');
            return;
        }
        if (!unidadeId) {
            Alert.alert('Erro', 'Selecione uma Unidade');
            return;
        }
        if (!numeroProspectos || Number(numeroProspectos) <= 0) {
            Alert.alert('Erro', 'Informe a quantidade de prospectos (maior que zero)');
            return;
        }

        try {
            const payload = {
                descricao,
                acaoDeCampanhaId: Number(acaoCampanhaId),
                unidadeId: Number(unidadeId),
                numeroProspectos: Number(numeroProspectos),
                filtrosAcao,
                filtrosCampo,
                filtrosLigacao,
                filtrosAcademico,
                operacional: {
                    direcionamento,
                    coordenadorId: coordenadorId ? Number(coordenadorId) : null,
                    coordenadorNome,
                    usuarios,
                },
            };

            const response = await fetch('http://localhost:8080/api/central/pacotes', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                Alert.alert('Sucesso', 'Pacote salvo com sucesso!');
            } else {
                Alert.alert('Erro', 'Erro ao salvar pacote');
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Erro', 'Erro ao salvar pacote');
        }
    };

    const addFiltroAcao = useCallback(() => {
        const acao = acoesCampanha.find(a => Number(a.id) === Number(acaoCampanhaId));
        if (acao) {
            setFiltrosAcao([...filtrosAcao, {key: `acao-${Date.now()}`, id: acao.id, descricao: acao.descricao, tipoAcao: acao.tipoAcao, contratante: acao.contratante}]);
        }
    }, [filtrosAcao, acaoCampanhaId, acoesCampanha]);

    const removeFiltroAcao = useCallback((key: string) => {
        setFiltrosAcao(filtrosAcao.filter(f => f.key !== key));
    }, [filtrosAcao]);

    const addFiltroCampo = useCallback((campoId: number) => {
        const campo = campos.find(c => Number(c.id) === campoId);
        if (campo) {
            setFiltrosCampo([...filtrosCampo, {key: `campo-${Date.now()}`, campo: {id: campo.id, rotulo: campo.rotulo, tipo: campo.tipo}, operacao: 'EQ', valor: ''}]);
        }
    }, [filtrosCampo, campos]);

    const removeFiltroCampo = useCallback((key: string) => {
        setFiltrosCampo(filtrosCampo.filter(f => f.key !== key));
    }, [filtrosCampo]);

    const addFiltroLigacao = useCallback(() => {
        setFiltrosLigacao([...filtrosLigacao, {key: `ligacao-${Date.now()}`, tipoFiltro: 0}]);
    }, [filtrosLigacao]);

    const removeFiltroLigacao = useCallback((key: string) => {
        setFiltrosLigacao(filtrosLigacao.filter(f => f.key !== key));
    }, [filtrosLigacao]);

    const addFiltroAcademico = useCallback(() => {
        setFiltrosAcademico([...filtrosAcademico, {key: `academico-${Date.now()}`, tipoFiltro: 0}]);
    }, [filtrosAcademico]);

    const removeFiltroAcademico = useCallback((key: string) => {
        setFiltrosAcademico(filtrosAcademico.filter(f => f.key !== key));
    }, [filtrosAcademico]);

    const addUsuario = useCallback((usuario: any) => {
        const existe = usuarios.some(u => u.id === usuario.id);
        if (!existe) {
            setUsuarios([...usuarios, {id: usuario.id, login: usuario.login, nome: usuario.nome}]);
        }
    }, [usuarios]);

    const removeUsuario = useCallback((id: number) => {
        setUsuarios(usuarios.filter(u => u.id !== id));
    }, [usuarios]);

    if (carregando) {
        return (
            <View style={styles.container}>
                <Text style={styles.loading}>Carregando...</Text>
            </View>
        );
    }

    return (
        <ModuleTabs
            tabs={[
                {
                    key: 'informacoes',
                    label: 'Informações',
                    content: (
                        <ScrollView style={styles.container}>
                            <Text style={styles.label}>Descrição</Text>
                            <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} placeholder="Descrição do pacote" />

                            <Text style={styles.label}>Ação de Campanha *</Text>
                            <TextInput
                                style={styles.input}
                                value={acoesCampanha.find(a => Number(a.id) === Number(acaoCampanhaId))?.descricao ?? ''}
                                editable={false}
                                onFocus={() => Alert.alert('Selecione a Ação', 'Funcionalidade de seleção a ser implementada')}
                            />

                            <Text style={styles.label}>Unidade *</Text>
                            <TextInput
                                style={styles.input}
                                value={unidades.find(u => Number(u.id) === Number(unidadeId))?.sucinto ?? unidades.find(u => Number(u.id) === Number(unidadeId))?.nomeFantasia ?? ''}
                                editable={false}
                                onFocus={() => Alert.alert('Selecione a Unidade', 'Funcionalidade de seleção a ser implementada')}
                            />

                            <Text style={styles.label}>Quantidade de Prospectos *</Text>
                            <TextInput style={styles.input} value={String(numeroProspectos)} onChangeText={setNumeroProspectos} keyboardType="numeric" placeholder="Quantidade" />
                        </ScrollView>
                    )
                },
                {
                    key: 'filtros',
                    label: 'Filtros',
                    masterDetail: {
                        label: 'Filtros',
                        source: '/api/central/pacotes/filtros',
                        valueKey: 'id',
                        searchKeys: ['tipo', 'descricao'],
                        columns: [
                            {key: 'tipo', label: 'Tipo'},
                            {key: 'descricao', label: 'Descrição'},
                        ],
                    },
                },
                {
                    key: 'operacional',
                    label: 'Operacional',
                    content: (
                        <ScrollView style={styles.container}>
                            <Text style={styles.label}>Direcionamento *</Text>
                            <TextInput style={styles.input} value={direcionamento} onChangeText={setDirecionamento} placeholder="INTERNO" />

                            <Text style={styles.label}>Coordenador</Text>
                            <TextInput style={styles.input} value={coordenadorNome} onChangeText={setCoordenadorNome} placeholder="Nome do coordenador" />

                            <Text style={styles.label}>Equipe (Operadores)</Text>
                            <TextInput
                                style={styles.input}
                                value=""
                                placeholder="Buscar usuário para adicionar"
                                onFocus={() => Alert.alert('Adicionar Operador', 'Funcionalidade de busca a ser implementada')}
                            />

                            {usuarios.length > 0 && (
                                <View style={{marginTop: 10}}>
                                    <Text style={styles.label}>Operadores Adicionados</Text>
                                    <FlatList
                                        data={usuarios}
                                        keyExtractor={item => String(item.id)}
                                        renderItem={({item}) => (
                                            <View style={styles.usuarioRow}>
                                                <Text>{item.nome ?? item.login}</Text>
                                                <TouchableOpacity onPress={() => removeUsuario(item.id)}>
                                                    <Text style={styles.removeBtn}>Remover</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    />
                                </View>
                            )}
                        </ScrollView>
                    )
                },
            ]}
        />
    );
}

const styles = StyleSheet.create({
    container: {padding: 15, flex: 1},
    label: {fontWeight: 'bold', marginTop: 15, marginBottom: 5},
    input: {borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 4, marginBottom: 10, backgroundColor: '#fff'},
    loading: {textAlign: 'center', marginTop: 50, color: '#888'},
    usuarioRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee'},
    removeBtn: {color: 'red', fontWeight: 'bold'},
});
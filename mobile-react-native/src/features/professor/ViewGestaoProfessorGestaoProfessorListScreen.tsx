import React, {useEffect, useRef, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {useAuth} from '../auth/auth';
import {api} from '../../shared/services/api';
import {can, isAdmin} from '../../shared/services/permissions';
import {Tabs} from '../../Tabs';
import {ModuleList} from '../../shared/components/ModuleListScreen';
import {BorderRadius, Colors, Spacing, Typography} from '../../shared/styles/theme';

const OUTCOME = 'view/gestaoProfessor/gestaoProfessor';

type Turma = {
    id: number;
    professor: string;
    grupo: string;
    curso: string;
    componenteCurricular: string;
    status: string;
    oferecimentoId?: number;
};

type Ocorrencia = { id: number; data: string; ativo: boolean };

type Presenca = { id: number; ocorrenciaId: number; data: string; presenca: string };

type Aluno = { matriculaId: number; nome: string; ativo: boolean; presencas: Presenca[] };

type Caderno = { turma: Turma; ocorrencias: Ocorrencia[]; alunos: Aluno[] };

type GrauNota = {
    id: number;
    nome: string;
    descricao: string;
    numeroNota: number | null;
    qtdeNota: number;
    peso: number | null;
};

type GrauConceito = {
    id: number;
    nome: string;
    descricao: string;
    conceito: string;
    ordem: number;
    qtdeNota: number;
};

type NotaValor = { id: number; nome: string; valor: number | null };

type NotaAluno = {
    id: number;
    matriculaId: number;
    aluno: string;
    grauNotaId: number | null;
    grauConceitoId: number | null;
    nota: number | null;
    notaConceitoId: number | null;
    notas: NotaValor[];
};

type Notas = {
    turma: Turma;
    tipoGrau: string;
    notasParciais: number;
    mediaSemExame: number | null;
    mediaFinal: number | null;
    notaMaxima: number | null;
    recuperacao: boolean;
    manual: boolean;
    manualAluno: boolean;
    pesoDistinto: boolean;
    frequenciaMinima: number | null;
    grauNotas: GrauNota[];
    grauConceitos: GrauConceito[];
    avaliacoes: NotaAluno[];
};

type Registro = { id: number | null; ocorrenciaId: number; data: string; descricao: string };

type OcorrenciaAula = { id: number; data: string; aulaCoringa: boolean; aulaPresencial: boolean };

type AulaItem = { id: number; nome: string; descricao: string; ocorrenciaComponenteCurricularId: number };

type AulaAnexoItem = { id: number; aulaId: number; nome: string; anexo: string; tipo: string };

type AnexoForm = { nome: string; anexo: string; tipo: string };

type AbaKey = 'caderno' | 'notas' | 'registro' | 'aula';

const ABAS_TITULOS: Record<AbaKey, string> = {
    caderno: 'Presenças',
    notas: 'Notas',
    registro: 'Registro de aula',
    aula: 'Aulas',
};

const PRESENCAS: Record<string, { titulo: string; cor: string }> = {
    n: {titulo: 'Sem Registro', cor: '#000000'},
    p: {titulo: 'Presente', cor: '#32CD32'},
    m: {titulo: 'Meia Presença', cor: '#FFD700'},
    a: {titulo: 'Ausente', cor: '#FF0000'},
    t: {titulo: 'Atestado', cor: '#0000CD'},
    c: {titulo: 'Cancelado', cor: '#FFA500'},
    v: {titulo: 'Troca de turma', cor: '#8000FF'},
    r: {titulo: 'Prorrogado', cor: '#61210B'},
    i: {titulo: 'Desistente', cor: '#C71585'},
    d: {titulo: 'Atrasado', cor: '#808080'},
};

const PROXIMA: Record<string, string> = {n: 'p', p: 'm', m: 'a', a: 't', t: 'n', d: 'n'};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function parseData(s: string): Date {
    const [d, m, y] = s.split('/').map(Number);
    return new Date(y, m - 1, d);
}

function groupAvaliacoes(notas: Notas): { matriculaId: number; nome: string; avaliacoes: NotaAluno[] }[] {
    const mapa = new Map<number, { matriculaId: number; nome: string; avaliacoes: NotaAluno[] }>();
    for (const ava of notas.avaliacoes) {
        const grupo = mapa.get(ava.matriculaId);
        if (grupo) {
            grupo.avaliacoes.push(ava);
        } else {
            mapa.set(ava.matriculaId, {matriculaId: ava.matriculaId, nome: ava.aluno, avaliacoes: [ava]});
        }
    }
    return [...mapa.values()];
}

const apiError = (error: unknown) =>
    (error as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? (error as Error)?.message
        ?? 'erro desconhecido';

function Aviso({tipo, texto}: { tipo: 'erro' | 'sucesso'; texto: string }) {
    if (!texto) return null;
    return (
        <View style={[styles.aviso, tipo === 'erro' ? styles.avisoErro : styles.avisoSucesso]}>
            <Text style={tipo === 'erro' ? styles.avisoErroTexto : styles.avisoSucessoTexto}>{texto}</Text>
        </View>
    );
}

function InfoTurma({turma}: { turma: Turma }) {
    const linhas: [string, string][] = [
        ['Turma', String(turma.id)],
        ['Componente', turma.componenteCurricular],
        ['Grupo', turma.grupo],
        ['Curso', turma.curso],
        ['Status', turma.status],
        ['Professor', turma.professor],
    ];
    return (
        <View style={styles.infoCard}>
            {linhas.map(([rotulo, valor]) => (
                <View key={rotulo} style={styles.infoLinha}>
                    <Text style={styles.infoRotulo}>{rotulo}: </Text>
                    <Text style={styles.infoValor}>{valor}</Text>
                </View>
            ))}
        </View>
        {modalInformacoes && turmaModal && (
            <Modal
                visible={modalInformacoes}
                onRequestClose={() => { setModalInformacoes(false); setTurmaModal(null); }}
                animationType="slide"
                transparent={false}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Informações da Turma {turmaModal.id}</Text>
                        <Text style={styles.modalText}>Professor: {turmaModal.professor}</Text>
                        <Text style={styles.modalText}>Grupo: {turmaModal.grupo}</Text>
                        <Text style={styles.modalText}>Curso: {turmaModal.curso}</Text>
                        <Text style={styles.modalText}>Componente: {turmaModal.componenteCurricular}</Text>
                        <Text style={styles.modalText}>Status: {turmaModal.status}</Text>
                        <Pressable
                            style={styles.modalCloseBtn}
                            onPress={() => { setModalInformacoes(false); setTurmaModal(null); }}
                        >
                            <Text style={styles.modalCloseBtnText}>Fechar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        )}
    </ScrollView>
);
}

function AbasOcultas({abas, ativa, turmaId, onSelect, onClose}: {
    abas: AbaKey[];
    ativa: AbaKey | null;
    turmaId: number | null;
    onSelect: (aba: AbaKey) => void;
    onClose: (aba: AbaKey) => void;
}) {
    if (abas.length === 0) return null;
    return (
        <View style={styles.abasContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.abasRow}>
                {abas.map((aba) => {
                    const selecionada = aba === ativa;
                    return (
                        <Pressable
                            key={aba}
                            style={[styles.aba, selecionada && styles.abaAtiva]}
                            onPress={() => onSelect(aba)}
                        >
                            <Text style={[styles.abaTexto, selecionada && styles.abaTextoAtivo]}>
                                {ABAS_TITULOS[aba]}{turmaId !== null ? ` · Turma ${turmaId}` : ''}
                            </Text>
                            <Pressable
                                style={styles.abaFechar}
                                onPress={() => onClose(aba)}
                                accessibilityLabel={`Fechar ${ABAS_TITULOS[aba]}`}
                            >
                                <Text style={styles.abaFecharTexto}>✕</Text>
                            </Pressable>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
}

function PresencasTab({caderno, tipoLista, setTipoLista, onAlternar, onSalvar, salvando, podeSalvar}: {
    caderno: Caderno;
    tipoLista: '0' | '1' | '2';
    setTipoLista: (v: '0' | '1' | '2') => void;
    onAlternar: (aluno: Aluno, presenca: Presenca) => void;
    onSalvar: () => void;
    salvando: boolean;
    podeSalvar: boolean;
}) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const alunos = caderno.alunos.filter((a) => (tipoLista === '0' ? true : tipoLista === '1' ? a.ativo : !a.ativo));
    return (
        <View>
            <InfoTurma turma={caderno.turma} />
            <View style={styles.legenda}>
                {Object.entries(PRESENCAS).map(([k, v]) => (
                    <View key={k} style={styles.legendaItem}>
                        <View style={[styles.dot, {backgroundColor: v.cor}]} />
                        <Text style={styles.legendaTexto}>{v.titulo}</Text>
                    </View>
                ))}
            </View>
            <View style={styles.filtroRow}>
                {([['0', 'Todos'], ['1', 'Ativos'], ['2', 'Inativos']] as const).map(([valor, rotulo]) => (
                    <Pressable
                        key={valor}
                        style={[styles.filtroBtn, tipoLista === valor && styles.filtroBtnAtivo]}
                        onPress={() => setTipoLista(valor)}
                    >
                        <Text style={[styles.filtroBtnTexto, tipoLista === valor && styles.filtroBtnTextoAtivo]}>{rotulo}</Text>
                    </Pressable>
                ))}
            </View>
            {alunos.length === 0 ? (
                <Text style={styles.vazio}>Nenhum aluno para a lista selecionada.</Text>
            ) : (
                alunos.map((aluno) => (
                    <View key={aluno.matriculaId} style={styles.alunoCard}>
                        <Text style={styles.alunoNome}>{aluno.nome}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.presencasRow}>
                                {caderno.ocorrencias.map((col) => {
                                    const p = aluno.presencas.find((x) => x.ocorrenciaId === col.id);
                                    const desc = p ? PRESENCAS[p.presenca] : null;
                                    const bloqueado = p ? parseData(p.data) > hoje : true;
                                    return (
                                        <View key={col.id} style={styles.presencaCelula}>
                                            <Text style={styles.presencaData}>{col.data}</Text>
                                            {p && desc ? (
                                                <Pressable
                                                    style={[styles.presencaDot, {backgroundColor: desc.cor}]}
                                                    disabled={bloqueado}
                                                    onPress={() => onAlternar(aluno, p)}
                                                    accessibilityLabel={`${desc.titulo} - ${col.data}`}
                                                />
                                            ) : (
                                                <View style={[styles.presencaDot, styles.presencaDotVazio]} />
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </View>
                ))
            )}
            {podeSalvar && (
                <Pressable style={[styles.salvarBtn, salvando && styles.btnDesabilitado]} onPress={onSalvar} disabled={salvando}>
                    <Text style={styles.salvarBtnTexto}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
                </Pressable>
            )}
        </View>
    );
}

function NotasTab({notas, onChangeAvaliacao, onChangeValor, onSalvar, salvando, podeSalvar}: {
    notas: Notas;
    onChangeAvaliacao: (avaId: number, campo: 'nota' | 'notaConceitoId', valor: number | null) => void;
    onChangeValor: (avaId: number, notaId: number, valor: number | null) => void;
    onSalvar: () => void;
    salvando: boolean;
    podeSalvar: boolean;
}) {
    const grupos = groupAvaliacoes(notas);
    return (
        <View>
            <InfoTurma turma={notas.turma} />
            <View style={styles.infoCard}>
                <View style={styles.infoLinha}>
                    <Text style={styles.infoRotulo}>Média aprovação sem exame: </Text>
                    <Text style={styles.infoValor}>{notas.mediaSemExame ?? '-'}</Text>
                </View>
                {notas.recuperacao && (
                    <View style={styles.infoLinha}>
                        <Text style={styles.infoRotulo}>Média aprovação com exame: </Text>
                        <Text style={styles.infoValor}>{notas.mediaFinal ?? '-'}</Text>
                    </View>
                )}
                <View style={styles.infoLinha}>
                    <Text style={styles.infoRotulo}>Nota máxima: </Text>
                    <Text style={styles.infoValor}>{notas.notaMaxima ?? '-'}</Text>
                </View>
            </View>
            {grupos.length === 0 ? (
                <Text style={styles.vazio}>Nenhuma nota cadastrada.</Text>
            ) : (
                grupos.map((grupo) => (
                    <View key={grupo.matriculaId} style={styles.alunoCard}>
                        <Text style={styles.alunoNome}>{grupo.nome}</Text>
                        {grupo.avaliacoes.map((ava) => (
                            <View key={ava.id} style={styles.notaBloco}>
                                {notas.tipoGrau === 'n' ? (
                                    <>
                                        <Text style={styles.notaRotulo}>
                                            {notas.grauNotas.find((g) => g.id === ava.grauNotaId)?.nome ?? `Avaliação #${ava.id}`}
                                            {ava.nota !== null && ava.nota !== undefined ? ` (${ava.nota})` : ''}
                                        </Text>
                                        <TextInput
                                            style={styles.input}
                                            keyboardType="numeric"
                                            value={ava.nota === null || ava.nota === undefined ? '' : String(ava.nota)}
                                            onChangeText={(t) => onChangeAvaliacao(ava.id, 'nota', t.trim() === '' ? null : Number(t.replace(',', '.')))}
                                            placeholder="Nota"
                                        />
                                        {ava.notas.map((n) => (
                                            <View key={n.id} style={styles.notaParcialLinha}>
                                                <Text style={styles.notaParcialRotulo}>{n.nome}</Text>
                                                <TextInput
                                                    style={[styles.input, styles.inputPequeno]}
                                                    keyboardType="numeric"
                                                    value={n.valor === null || n.valor === undefined ? '' : String(n.valor)}
                                                    onChangeText={(t) => onChangeValor(ava.id, n.id, t.trim() === '' ? null : Number(t.replace(',', '.')))}
                                                    placeholder="0,0"
                                                />
                                            </View>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.notaRotulo}>
                                            {notas.grauConceitos.find((g) => g.id === ava.grauConceitoId)?.nome ?? `Avaliação #${ava.id}`}
                                        </Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <View style={styles.conceitoRow}>
                                                {notas.grauConceitos.map((c) => {
                                                    const sel = ava.notaConceitoId === c.id;
                                                    return (
                                                        <Pressable
                                                            key={c.id}
                                                            style={[styles.conceitoBtn, sel && styles.conceitoBtnAtivo]}
                                                            onPress={() => onChangeAvaliacao(ava.id, 'notaConceitoId', sel ? null : c.id)}
                                                        >
                                                            <Text style={[styles.conceitoBtnTexto, sel && styles.conceitoBtnTextoAtivo]}>
                                                                {c.conceito}
                                                            </Text>
                                                        </Pressable>
                                                    );
                                                })}
                                            </View>
                                        </ScrollView>
                                    </>
                                )}
                            </View>
                        ))}
                    </View>
                ))
            )}
            {podeSalvar && (
                <Pressable style={[styles.salvarBtn, salvando && styles.btnDesabilitado]} onPress={onSalvar} disabled={salvando}>
                    <Text style={styles.salvarBtnTexto}>{salvando ? 'Salvando...' : 'Alterar'}</Text>
                </Pressable>
            )}
        </View>
    );
}

function RegistroTab({registrosEdit, onChangeDescricao, onSalvar, salvando, podeSalvar}: {
    registrosEdit: Registro[];
    onChangeDescricao: (index: number, descricao: string) => void;
    onSalvar: () => void;
    salvando: boolean;
    podeSalvar: boolean;
}) {
    return (
        <View>
            {registrosEdit.length === 0 ? (
                <Text style={styles.vazio}>Nenhuma aula registrada.</Text>
            ) : (
                registrosEdit.map((r, idx) => (
                    <View key={`${r.ocorrenciaId}-${idx}`} style={styles.alunoCard}>
                        <Text style={styles.registroData}>{r.data}</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            multiline
                            numberOfLines={4}
                            value={r.descricao}
                            onChangeText={(t) => onChangeDescricao(idx, t)}
                            placeholder="Descrição da aula"
                        />
                    </View>
                ))
            )}
            {podeSalvar && (
                <Pressable style={[styles.salvarBtn, salvando && styles.btnDesabilitado]} onPress={onSalvar} disabled={salvando}>
                    <Text style={styles.salvarBtnTexto}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
                </Pressable>
            )}
        </View>
    );
}

function AulasTab({ocorrencias, ocorrenciaSel, onSelectOcorrencia, aulas, onEditar, onExcluir, form, setFormCampo, onAddAnexo, onChangeAnexo, onRemoveAnexo, onSalvar, onLimpar, salvando}: {
    ocorrencias: OcorrenciaAula[];
    ocorrenciaSel: number | null;
    onSelectOcorrencia: (id: number) => void;
    aulas: AulaItem[];
    onEditar: (aula: AulaItem) => void;
    onExcluir: (aula: AulaItem) => void;
    form: { id: number | null; nome: string; descricao: string; anexos: AnexoForm[] };
    setFormCampo: (campo: 'nome' | 'descricao', valor: string) => void;
    onAddAnexo: () => void;
    onChangeAnexo: (index: number, campo: 'nome' | 'anexo' | 'tipo', valor: string) => void;
    onRemoveAnexo: (index: number) => void;
    onSalvar: () => void;
    onLimpar: () => void;
    salvando: boolean;
}) {
    return (
        <View>
            <Text style={styles.secaoTitulo}>Ocorrência</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.conceitoRow}>
                    {ocorrencias.map((o) => (
                        <Pressable
                            key={o.id}
                            style={[styles.conceitoBtn, ocorrenciaSel === o.id && styles.conceitoBtnAtivo]}
                            onPress={() => onSelectOcorrencia(o.id)}
                        >
                            <Text style={[styles.conceitoBtnTexto, ocorrenciaSel === o.id && styles.conceitoBtnTextoAtivo]}>
                                {o.data}{o.aulaCoringa ? ' · extra' : ''}{!o.aulaPresencial ? ' · remota' : ''}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
            {ocorrencias.length === 0 && <Text style={styles.vazio}>Nenhuma ocorrência encontrada para esta turma.</Text>}
            {ocorrenciaSel !== null && (
                <View>
                    <Text style={styles.secaoTitulo}>Aulas da ocorrência</Text>
                    {aulas.length === 0 ? (
                        <Text style={styles.vazio}>Nenhuma aula cadastrada.</Text>
                    ) : (
                        aulas.map((aula) => (
                            <View key={aula.id} style={styles.alunoCard}>
                                <Text style={styles.alunoNome}>{aula.nome}</Text>
                                {aula.descricao ? <Text style={styles.aulaDescricao}>{aula.descricao}</Text> : null}
                                <View style={styles.botoesRow}>
                                    <Pressable style={styles.secBtn} onPress={() => onEditar(aula)}>
                                        <Text style={styles.secBtnTexto}>Editar</Text>
                                    </Pressable>
                                    <Pressable style={[styles.secBtn, styles.dangerBtn]} onPress={() => onExcluir(aula)}>
                                        <Text style={[styles.secBtnTexto, styles.dangerBtnTexto]}>Excluir</Text>
                                    </Pressable>
                                </View>
                            </View>
                        ))
                    )}
                    <Text style={styles.secaoTitulo}>{form.id ? 'Editar aula' : 'Nova aula'}</Text>
                    <Text style={styles.campoRotulo}>Nome</Text>
                    <TextInput
                        style={styles.input}
                        value={form.nome}
                        onChangeText={(t) => setFormCampo('nome', t)}
                        placeholder="Nome da aula"
                    />
                    <Text style={styles.campoRotulo}>Descrição</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        multiline
                        numberOfLines={3}
                        value={form.descricao}
                        onChangeText={(t) => setFormCampo('descricao', t)}
                        placeholder="Descrição / conteúdo da aula"
                    />
                    <Text style={styles.campoRotulo}>Anexos</Text>
                    {form.anexos.map((a, idx) => (
                        <View key={idx} style={styles.alunoCard}>
                            <TextInput
                                style={styles.input}
                                value={a.nome}
                                onChangeText={(t) => onChangeAnexo(idx, 'nome', t)}
                                placeholder="Nome do anexo"
                            />
                            <TextInput
                                style={styles.input}
                                value={a.anexo}
                                onChangeText={(t) => onChangeAnexo(idx, 'anexo', t)}
                                placeholder="URL / caminho do arquivo"
                            />
                            <TextInput
                                style={styles.input}
                                value={a.tipo}
                                onChangeText={(t) => onChangeAnexo(idx, 'tipo', t)}
                                placeholder="Tipo"
                            />
                            <Pressable style={[styles.secBtn, styles.dangerBtn]} onPress={() => onRemoveAnexo(idx)}>
                                <Text style={[styles.secBtnTexto, styles.dangerBtnTexto]}>Remover anexo</Text>
                            </Pressable>
                        </View>
                    ))}
                    <Pressable style={styles.secBtn} onPress={onAddAnexo}>
                        <Text style={styles.secBtnTexto}>+ Adicionar anexo</Text>
                    </Pressable>
                    <View style={styles.botoesRow}>
                        <Pressable style={[styles.salvarBtn, styles.salvarBtnFlex, salvando && styles.btnDesabilitado]} onPress={onSalvar} disabled={salvando}>
                            <Text style={styles.salvarBtnTexto}>{salvando ? 'Salvando...' : 'Salvar aula'}</Text>
                        </Pressable>
                        <Pressable style={[styles.secBtn, styles.secBtnFlex]} onPress={onLimpar}>
                            <Text style={styles.secBtnTexto}>Limpar</Text>
                        </Pressable>
                    </View>
                </View>
            )}
        </View>
    );
}

function GestaoTurmas({professorId, souProfessor}: { professorId: number | null; souProfessor: boolean }) {
    const {session} = useAuth();
    const admin = isAdmin(session);

    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [carregandoTurmas, setCarregandoTurmas] = useState(false);
    const [aviso, setAviso] = useState<{ tipo: 'erro' | 'sucesso'; texto: string }>({tipo: 'sucesso', texto: ''});

    const [abasAbertas, setAbasAbertas] = useState<AbaKey[]>([]);
    const [abaAtiva, setAbaAtiva] = useState<AbaKey | null>(null);
    const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null);
    const [infoTurma, setInfoTurma] = useState<Turma | null>(null);
    const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);
    const [modalInformacoes, setModalInformacoes] = useState(false);
    const [turmaModal, setTurmaModal] = useState<Turma | null>(null);
    const [infoTurma, setInfoTurma] = useState<Turma | null>(null);
    const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);

    const [caderno, setCaderno] = useState<Caderno | null>(null);
    const [notas, setNotas] = useState<Notas | null>(null);
    const [registrosEdit, setRegistrosEdit] = useState<Registro[]>([]);

    const [ocorrenciasAula, setOcorrenciasAula] = useState<OcorrenciaAula[]>([]);
    const [ocorrenciaAulaSel, setOcorrenciaAulaSel] = useState<number | null>(null);
    const [aulasDaOcorrencia, setAulasDaOcorrencia] = useState<AulaItem[]>([]);
    const [aulaForm, setAulaForm] = useState<{ id: number | null; nome: string; descricao: string; anexos: AnexoForm[] }>({
        id: null,
        nome: '',
        descricao: '',
        anexos: [],
    });

    const [tipoLista, setTipoLista] = useState<'0' | '1' | '2'>('1');
    const [salvando, setSalvando] = useState(false);
    const [salvandoAula, setSalvandoAula] = useState(false);
    const cadernoOriginal = useRef<Caderno | null>(null);

    const notificar = (tipo: 'erro' | 'sucesso', texto: string) => setAviso({tipo, texto});

    const podeSalvarCaderno = can(session, 'CREATE', OUTCOME);
    const podeSalvarNotas = can(session, 'UPDATE', OUTCOME);
    const podeSalvarRegistro = can(session, 'CREATE', OUTCOME);

    function abrirAba(aba: AbaKey) {
        setAbaAtiva(aba);
        setAbasAbertas((prev) => (prev.includes(aba) ? prev : [...prev, aba]));
        setCarregandoDetalhe(true);
    }

    function fecharAba(aba: AbaKey) {
        const restantes = abasAbertas.filter((a) => a !== aba);
        setAbasAbertas(restantes);
        if (abaAtiva === aba) {
            setAbaAtiva(restantes.length > 0 ? restantes[restantes.length - 1] : null);
        }
    }

    function abrirInformacoes(turma: Turma) {
        setTurmaModal(turma);
        setModalInformacoes(true);
    }

    async function buscarTurmas(pid: number | null) {
        setAviso({tipo: 'sucesso', texto: ''});
        setCarregandoTurmas(true);
        setAbaAtiva(null);
        setAbasAbertas([]);
        try {
            const {data} = await api.get<Turma[]>('/api/professor/gestao-professor/turmas', {
                params: pid !== null ? {professorId: pid} : undefined,
            });
            setTurmas(data ?? []);
            notificar('sucesso', (data ?? []).length === 0 ? 'Nenhuma turma encontrada.' : `${(data ?? []).length} turma(s) encontrada(s).`);
        } catch (e) {
            notificar('erro', `Erro ao carregar as turmas: ${apiError(e)}`);
        } finally {
            setCarregandoTurmas(false);
        }
    }

    useEffect(() => {
        if (souProfessor && professorId !== null) {
            buscarTurmas(professorId);
        } else if (admin) {
            buscarTurmas(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [souProfessor, professorId]);

    // Libera o "carregando" da aba assim que chegam dados ou avisos (sucesso/erro).
    useEffect(() => {
        setCarregandoDetalhe(false);
    }, [caderno, notas, registrosEdit, aulasDaOcorrencia, ocorrenciasAula, aviso]);

    async function abrirCaderno(turma: Turma) {
        abrirAba('caderno');
        setTurmaSelecionada(turma);
        setAviso({tipo: 'sucesso', texto: ''});
        try {
            const {data} = await api.get<Caderno>(`/api/professor/gestao-professor/turmas/${turma.id}/caderno`);
            setCaderno(data);
            cadernoOriginal.current = clone(data);
            setTipoLista('1');
        } catch (e) {
            notificar('erro', `Erro ao carregar o caderno de chamada: ${apiError(e)}`);
        }
    }

    async function abrirNotas(turma: Turma) {
        abrirAba('notas');
        setTurmaSelecionada(turma);
        setAviso({tipo: 'sucesso', texto: ''});
        try {
            const {data} = await api.get<Notas>(`/api/professor/gestao-professor/turmas/${turma.id}/notas`);
            setNotas(data);
        } catch (e) {
            notificar('erro', `Erro ao carregar as notas: ${apiError(e)}`);
        }
    }

    async function abrirRegistro(turma: Turma) {
        abrirAba('registro');
        setTurmaSelecionada(turma);
        setAviso({tipo: 'sucesso', texto: ''});
        try {
            const {data} = await api.get<Registro[]>(`/api/professor/gestao-professor/turmas/${turma.id}/registros`);
            setRegistrosEdit(clone(data ?? []));
        } catch (e) {
            notificar('erro', `Erro ao carregar os registros de aula: ${apiError(e)}`);
        }
    }

    async function abrirAula(turma: Turma) {
        abrirAba('aula');
        setTurmaSelecionada(turma);
        setAviso({tipo: 'sucesso', texto: ''});
        setOcorrenciaAulaSel(null);
        setAulaForm({id: null, nome: '', descricao: '', anexos: []});
        try {
            const {data} = await api.get<OcorrenciaAula[]>('/api/professor/aula/ocorrencias', {
                params: {oferecimentoId: turma.id},
            });
            setOcorrenciasAula(data ?? []);
            if ((data ?? []).length === 0) notificar('erro', 'Nenhuma ocorrência encontrada para esta turma.');
        } catch (e) {
            notificar('erro', `Erro ao carregar as ocorrências da turma: ${apiError(e)}`);
        }
    }

    async function selecionarOcorrenciaAula(ocorrenciaId: number) {
        setOcorrenciaAulaSel(ocorrenciaId);
        setAulaForm({id: null, nome: '', descricao: '', anexos: []});
        try {
            const {data} = await api.get<AulaItem[]>('/api/professor/aula/por-ocorrencia', {params: {ocorrenciaId}});
            setAulasDaOcorrencia(data ?? []);
        } catch (e) {
            notificar('erro', `Erro ao carregar as aulas da ocorrência: ${apiError(e)}`);
        }
    }

    function alternarPresenca(aluno: Aluno, presenca: Presenca) {
        if (!caderno) return;
        const proxima = PROXIMA[presenca.presenca];
        if (!proxima) return;
        setCaderno({
            ...caderno,
            alunos: caderno.alunos.map((a) =>
                a.matriculaId === aluno.matriculaId
                    ? {
                        ...a,
                        presencas: a.presencas.map((p) =>
                            p.ocorrenciaId === presenca.ocorrenciaId ? {...p, presenca: proxima} : p,
                        ),
                    }
                    : a,
            ),
        });
    }

    async function salvarChamada() {
        if (!caderno || !turmaSelecionada) return;
        const orig = cadernoOriginal.current;
        const alteradas: { id: number; matriculaId: number; ocorrenciaId: number; presenca: string }[] = [];
        for (const aluno of caderno.alunos) {
            for (const p of aluno.presencas) {
                const anterior = orig?.alunos.find((a) => a.matriculaId === aluno.matriculaId)?.presencas.find(
                    (x) => x.ocorrenciaId === p.ocorrenciaId,
                )?.presenca;
                if (anterior !== p.presenca) {
                    alteradas.push({id: p.id, matriculaId: aluno.matriculaId, ocorrenciaId: p.ocorrenciaId, presenca: p.presenca});
                }
            }
        }
        if (alteradas.length === 0) {
            notificar('erro', 'Nenhuma presença foi alterada.');
            return;
        }
        setSalvando(true);
        try {
            await api.post(`/api/professor/gestao-professor/turmas/${turmaSelecionada.id}/caderno/salvar`, {
                usuarioId: session?.idUsuario ?? null,
                presencas: alteradas,
            });
            notificar('sucesso', 'Chamada salva com sucesso.');
            await abrirCaderno(turmaSelecionada);
        } catch (e) {
            notificar('erro', `Erro ao salvar a chamada: ${apiError(e)}`);
        } finally {
            setSalvando(false);
        }
    }

    function atualizarNotaAvaliacao(avaId: number, campo: 'nota' | 'notaConceitoId', valor: number | null) {
        if (!notas) return;
        setNotas({
            ...notas,
            avaliacoes: notas.avaliacoes.map((a) => (a.id === avaId ? {...a, [campo]: valor} : a)),
        });
    }

    function atualizarNotaValor(avaId: number, notaId: number, valor: number | null) {
        if (!notas) return;
        setNotas({
            ...notas,
            avaliacoes: notas.avaliacoes.map((a) =>
                a.id === avaId
                    ? {...a, notas: a.notas.map((n) => (n.id === notaId ? {...n, valor} : n))}
                    : a,
            ),
        });
    }

    async function salvarNotas() {
        if (!notas || !turmaSelecionada) return;
        setSalvando(true);
        try {
            await api.post(`/api/professor/gestao-professor/turmas/${turmaSelecionada.id}/notas/salvar`, {
                avaliacoes: notas.avaliacoes.map((a) => ({
                    id: a.id,
                    nota: a.nota,
                    notaConceitoId: a.notaConceitoId,
                    notas: a.notas.map((n) => ({id: n.id, valor: n.valor})),
                })),
            });
            notificar('sucesso', 'Notas alteradas com sucesso.');
        } catch (e) {
            notificar('erro', `Erro ao salvar as notas: ${apiError(e)}`);
        } finally {
            setSalvando(false);
        }
    }

    async function salvarRegistros() {
        if (!turmaSelecionada) return;
        setSalvando(true);
        try {
            await api.post(`/api/professor/gestao-professor/turmas/${turmaSelecionada.id}/registros/salvar`, {
                registros: registrosEdit,
            });
            notificar('sucesso', 'Aula registrada com sucesso.');
        } catch (e) {
            notificar('erro', `Erro ao salvar os registros de aula: ${apiError(e)}`);
        } finally {
            setSalvando(false);
        }
    }

    function editarAula(aula: AulaItem) {
        setAulaForm({id: aula.id, nome: aula.nome, descricao: aula.descricao, anexos: []});
    }

    function excluirAula(aula: AulaItem) {
        Alert.alert('Excluir aula', `Excluir a aula "${aula.nome}"?`, [
            {text: 'Cancelar', style: 'cancel'},
            {
                text: 'Excluir',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.delete(`/api/professor/aula/${aula.id}`);
                        setAulasDaOcorrencia((prev) => prev.filter((a) => a.id !== aula.id));
                        if (aulaForm.id === aula.id) setAulaForm({id: null, nome: '', descricao: '', anexos: []});
                        notificar('sucesso', 'Aula excluída com sucesso.');
                    } catch (e) {
                        notificar('erro', `Erro ao excluir a aula: ${apiError(e)}`);
                    }
                },
            },
        ]);
    }

    async function salvarAula() {
        if (!aulaForm.nome.trim() || !ocorrenciaAulaSel) {
            notificar('erro', 'Informe o nome da aula.');
            return;
        }
        setSalvandoAula(true);
        try {
            const payload = {
                nome: aulaForm.nome,
                descricao: aulaForm.descricao,
                ocorrenciaComponenteCurricularId: ocorrenciaAulaSel,
            };
            let aulaId: number;
            if (aulaForm.id) {
                const {data} = await api.put<AulaItem>(`/api/professor/aula/${aulaForm.id}`, payload);
                aulaId = data.id;
            } else {
                const {data} = await api.post<AulaItem>('/api/professor/aula', payload);
                aulaId = data.id;
            }
            for (const a of aulaForm.anexos) {
                if (!a.nome.trim()) continue;
                await api.post('/api/professor/aula-anexo', {aulaId, nome: a.nome, anexo: a.anexo, tipo: a.tipo});
            }
            notificar('sucesso', 'Aula salva com sucesso.');
            await selecionarOcorrenciaAula(ocorrenciaAulaSel);
        } catch (e) {
            notificar('erro', `Erro ao salvar a aula: ${apiError(e)}`);
        } finally {
            setSalvandoAula(false);
        }
    }

    function abrirInformacoes(turma: Turma) {
        setInfoTurma(turma);
    }

    if (!souProfessor && !admin) {
        return (
            <View style={styles.page}>
                <Text style={styles.title}>Gestão do Professor</Text>
                <Text style={styles.vazio}>Nenhum professor vinculado ao usuário.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.page}>
                <View style={styles.headerRow}>
                <Text style={styles.title}>Turmas</Text>
                <Pressable
                    style={[styles.recarregarBtn, carregandoTurmas && styles.btnDesabilitado]}
                    onPress={() => buscarTurmas(souProfessor && professorId !== null ? professorId : null)}
                    disabled={carregandoTurmas}
                >
                    <Text style={styles.recarregarBtnTexto}>{carregandoTurmas ? 'Buscando...' : 'Recarregar'}</Text>
                </Pressable>
            </View>
            <Aviso tipo={aviso.tipo} texto={aviso.texto} />
            {carregandoTurmas && turmas.length === 0 ? (
                <ActivityIndicator style={styles.loader} />
            ) : turmas.length === 0 ? (
                <Text style={styles.vazio}>Nenhum registro.</Text>
            ) : (
                turmas.map((t) => (
                    <View key={t.id} style={styles.turmaCard}>
                        <View style={styles.turmaHeader}>
                            <Text style={styles.turmaTitulo}>Turma #{t.id}</Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusTexto}>{t.status}</Text>
                            </View>
                        </View>
                        <Text style={styles.turmaLinha}>Professor: {t.professor}</Text>
                        <Text style={styles.turmaLinha}>Grupo: {t.grupo}</Text>
                        <Text style={styles.turmaLinha}>Curso: {t.curso}</Text>
                        <Text style={styles.turmaLinha}>Componente: {t.componenteCurricular}</Text>
                        <View style={styles.botoesRow}>
                            {(t.status === 'EM_ANDAMENTO' || t.status === 'FINALIZADA') && (
                                <>
                                    <Pressable style={styles.acaoBtn} onPress={() => abrirCaderno(t)}>
                                        <Text style={styles.acaoBtnTexto}>Presenças</Text>
                                    </Pressable>
                                    <Pressable style={styles.acaoBtn} onPress={() => abrirNotas(t)}>
                                        <Text style={styles.acaoBtnTexto}>Notas</Text>
                                    </Pressable>
                                    <Pressable style={styles.acaoBtn} onPress={() => abrirRegistro(t)}>
                                        <Text style={styles.acaoBtnTexto}>Registro</Text>
                                    </Pressable>
                                    <Pressable style={styles.acaoBtn} onPress={() => abrirAula(t)}>
                                        <Text style={styles.acaoBtnTexto}>Aulas</Text>
                                    </Pressable>
                                </>
                            )}
                            <Pressable style={[styles.acaoBtn, styles.acaoBtnInfo]} onPress={() => abrirInformacoes(t)}>
                                <Text style={styles.acaoBtnTexto}>Informações</Text>
                            </Pressable>
                        </View>
                    </View>
                ))
            )}
            <AbasOcultas
                abas={abasAbertas}
                ativa={abaAtiva}
                turmaId={turmaSelecionada?.id ?? null}
                onSelect={setAbaAtiva}
                onClose={fecharAba}
            />
            {abaAtiva === 'caderno' && caderno && (
                <View style={styles.detalheCard}>
                    <Text style={styles.detalheTitulo}>Presenças</Text>
                    <PresencasTab
                        caderno={caderno}
                        tipoLista={tipoLista}
                        setTipoLista={setTipoLista}
                        onAlternar={alternarPresenca}
                        onSalvar={salvarChamada}
                        salvando={salvando}
                        podeSalvar={podeSalvarCaderno}
                    />
                </View>
            )}
            {abaAtiva === 'notas' && notas && (
                <View style={styles.detalheCard}>
                    <Text style={styles.detalheTitulo}>Notas</Text>
                    <NotasTab
                        notas={notas}
                        onChangeAvaliacao={atualizarNotaAvaliacao}
                        onChangeValor={atualizarNotaValor}
                        onSalvar={salvarNotas}
                        salvando={salvando}
                        podeSalvar={podeSalvarNotas}
                    />
                </View>
            )}
            {abaAtiva === 'registro' && turmaSelecionada && (
                <View style={styles.detalheCard}>
                    <Text style={styles.detalheTitulo}>Registro de aula</Text>
                    <InfoTurma turma={turmaSelecionada} />
                    <RegistroTab
                        registrosEdit={registrosEdit}
                        onChangeDescricao={(idx, descricao) =>
                            setRegistrosEdit((prev) => prev.map((x, i) => (i === idx ? {...x, descricao} : x)))
                        }
                        onSalvar={salvarRegistros}
                        salvando={salvando}
                        podeSalvar={podeSalvarRegistro}
                    />
                </View>
            )}
            {abaAtiva === 'aula' && turmaSelecionada && (
                <View style={styles.detalheCard}>
                    <Text style={styles.detalheTitulo}>Aulas</Text>
                    <InfoTurma turma={turmaSelecionada} />
                    <AulasTab
                        ocorrencias={ocorrenciasAula}
                        ocorrenciaSel={ocorrenciaAulaSel}
                        onSelectOcorrencia={selecionarOcorrenciaAula}
                        aulas={aulasDaOcorrencia}
                        onEditar={editarAula}
                        onExcluir={excluirAula}
                        form={aulaForm}
                        setFormCampo={(campo, valor) => setAulaForm((f) => ({...f, [campo]: valor}))}
                        onAddAnexo={() => setAulaForm((f) => ({...f, anexos: [...f.anexos, {nome: '', anexo: '', tipo: ''}]}))}
                        onChangeAnexo={(index, campo, valor) =>
                            setAulaForm((f) => ({
                                ...f,
                                anexos: f.anexos.map((x, i) => (i === index ? {...x, [campo]: valor} : x)),
                            }))
                        }
                        onRemoveAnexo={(index) =>
                            setAulaForm((f) => ({...f, anexos: f.anexos.filter((_, i) => i !== index)}))
                        }
                        onSalvar={salvarAula}
                        onLimpar={() => setAulaForm({id: null, nome: '', descricao: '', anexos: []})}
                        salvando={salvandoAula}
                    />
                </View>
            )}
        </View>
    );
}

export default function ViewGestaoProfessorGestaoProfessorListScreen() {
    const {session} = useAuth();
    const username = session?.username;

    const identidadeQuery = useQuery({
        queryKey: ['gestao-professor-identidade', username],
        queryFn: async () =>
            (
                await api.get<{ souProfessor: boolean; professorId: number | null }>('/api/professor/gestao-professor/identidade', {
                    params: {username},
                })
            ).data,
        enabled: !!username,
    });

    const souProfessor = identidadeQuery.data?.souProfessor === true && !!identidadeQuery.data?.professorId;
    const professorId = identidadeQuery.data?.professorId ?? null;

    if (identidadeQuery.isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
            </View>
        );
    }

    if (identidadeQuery.isError) {
        return (
            <View style={styles.center}>
                <Text style={styles.erro}>Erro ao carregar os dados do professor.</Text>
            </View>
        );
    }

    const tabs = [
        {key: 'gestao', label: 'Gestão', content: <GestaoTurmas professorId={professorId} souProfessor={souProfessor} />},
        ...(souProfessor
            ? [{
                key: 'disponibilidade',
                label: 'Disponibilidade do Professor',
                content: <ModuleList path="/api/view/disponibilidadeProfessor/listDisponibilidadeProfessor" />,
            }]
            : []),
    ];

    return (
        <View style={styles.pageFlex}>
            <Tabs tabs={tabs} />
        </View>
    );
}

const styles = StyleSheet.create({
    pageFlex: {flex: 1, backgroundColor: Colors.bgPrimary},
    page: {flex: 1, backgroundColor: Colors.bgPrimary, padding: Spacing.lg},
    center: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24},
    erro: {color: Colors.error, fontSize: Typography.sizes.lg, textAlign: 'center'},
    loader: {marginVertical: Spacing.xl},
    headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md},
    title: {fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold, color: Colors.textPrimary},
    recarregarBtn: {backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md},
    recarregarBtnTexto: {color: Colors.textWhite, fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold},
    btnDesabilitado: {opacity: 0.5},
    aviso: {borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md},
    avisoErro: {backgroundColor: Colors.errorBg, borderWidth: 1, borderColor: Colors.error},
    avisoSucesso: {backgroundColor: Colors.successBg, borderWidth: 1, borderColor: Colors.success},
    avisoErroTexto: {color: Colors.error, fontSize: Typography.sizes.base},
    avisoSucessoTexto: {color: Colors.success, fontSize: Typography.sizes.base},
    vazio: {color: Colors.textLight, fontStyle: 'italic', textAlign: 'center', marginVertical: Spacing.lg, fontSize: Typography.sizes.base},
    scroll: {paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl},
    turmaCard: {backgroundColor: Colors.bgSecondary, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.borderLight, padding: Spacing.md, marginBottom: Spacing.md},
    turmaHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs},
    turmaTitulo: {fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.textPrimary},
    statusBadge: {backgroundColor: Colors.primary + '15', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs},
    statusTexto: {fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold, color: Colors.primary},
    turmaLinha: {fontSize: Typography.sizes.base, color: Colors.textSecondary, marginTop: 2},
    botoesRow: {flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.sm, gap: Spacing.sm},
    acaoBtn: {backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm},
    acaoBtnInfo: {backgroundColor: Colors.goldBg},
    acaoBtnTexto: {color: Colors.textWhite, fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold},
    abasContainer: {marginVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight},
    abasRow: {flexDirection: 'row', gap: Spacing.sm, paddingVertical: Spacing.xs},
    aba: {flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.borderLight, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm},
    abaAtiva: {backgroundColor: Colors.primary, borderColor: Colors.primary},
    abaTexto: {fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, color: Colors.textSecondary},
    abaTextoAtivo: {color: Colors.textWhite},
    abaFechar: {width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.15)'},
    abaFecharTexto: {color: Colors.textWhite, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold},
    detalheCard: {backgroundColor: Colors.bgSecondary, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.borderLight, padding: Spacing.md, marginBottom: Spacing.xl},
    detalheTitulo: {fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.textPrimary, marginBottom: Spacing.md},
    secaoTitulo: {fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.textPrimary, marginTop: Spacing.md, marginBottom: Spacing.sm},
    infoCard: {backgroundColor: Colors.bgPrimary, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.borderLight, padding: Spacing.md, marginBottom: Spacing.md},
    infoLinha: {flexDirection: 'row', flexWrap: 'wrap', marginBottom: 2},
    infoRotulo: {fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold, color: Colors.textSecondary},
    infoValor: {fontSize: Typography.sizes.base, color: Colors.textPrimary, flexShrink: 1},
    legenda: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, backgroundColor: Colors.bgPrimary, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.borderLight, padding: Spacing.sm, marginBottom: Spacing.md},
    legendaItem: {flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: Spacing.sm},
    dot: {width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(0,0,0,0.25)'},
    legendaTexto: {fontSize: Typography.sizes.xs, color: Colors.textSecondary},
    filtroRow: {flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md},
    filtroBtn: {borderWidth: 1, borderColor: Colors.borderLight, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.bgPrimary},
    filtroBtnAtivo: {backgroundColor: Colors.primary, borderColor: Colors.primary},
    filtroBtnTexto: {fontSize: Typography.sizes.base, color: Colors.textSecondary, fontWeight: Typography.weights.semibold},
    filtroBtnTextoAtivo: {color: Colors.textWhite},
    alunoCard: {backgroundColor: Colors.bgPrimary, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.borderLight, padding: Spacing.md, marginBottom: Spacing.md},
    alunoNome: {fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.textPrimary, marginBottom: Spacing.sm},
    aulaDescricao: {fontSize: Typography.sizes.base, color: Colors.textSecondary, marginBottom: Spacing.sm},
    presencasRow: {flexDirection: 'row', gap: Spacing.md},
    presencaCelula: {alignItems: 'center', gap: 4, minWidth: 64},
    presencaData: {fontSize: Typography.sizes.xs, color: Colors.textMuted},
    presencaDot: {width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.25)'},
    presencaDotVazio: {backgroundColor: 'transparent', borderStyle: 'dashed'},
    salvarBtn: {backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingVertical: Spacing.md, alignItems: 'center', marginTop: Spacing.sm},
    salvarBtnFlex: {flex: 1},
    salvarBtnTexto: {color: Colors.textWhite, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold},
    input: {borderWidth: 1, borderColor: Colors.formInputBorder, borderRadius: BorderRadius.lg, padding: Spacing.md, fontSize: Typography.sizes.lg, color: Colors.textPrimary, backgroundColor: Colors.bgSecondary, marginBottom: Spacing.sm},
    inputPequeno: {flex: 1},
    textArea: {minHeight: 90, textAlignVertical: 'top'},
    campoRotulo: {fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.sm},
    notaBloco: {borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing.sm, marginTop: Spacing.sm},
    notaRotulo: {fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, color: Colors.textSecondary, marginBottom: Spacing.xs},
    notaParcialLinha: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xs},
    notaParcialRotulo: {flex: 2, fontSize: Typography.sizes.sm, color: Colors.textMuted},
    conceitoRow: {flexDirection: 'row', gap: Spacing.sm, paddingVertical: Spacing.xs},
    conceitoBtn: {borderWidth: 1, borderColor: Colors.borderLight, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.bgPrimary},
    conceitoBtnAtivo: {backgroundColor: Colors.primary, borderColor: Colors.primary},
    conceitoBtnTexto: {fontSize: Typography.sizes.base, color: Colors.textSecondary, fontWeight: Typography.weights.semibold},
    conceitoBtnTextoAtivo: {color: Colors.textWhite},
    registroData: {fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold, color: Colors.primary, marginBottom: Spacing.xs},
    secBtn: {borderWidth: 1, borderColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginTop: Spacing.sm, alignItems: 'center'},
    secBtnFlex: {flex: 1, marginLeft: Spacing.sm},
    secBtnTexto: {color: Colors.primary, fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold},
    dangerBtn: {borderColor: Colors.error},
    dangerBtnTexto: {color: Colors.error},
    modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Spacing.lg},
    modalContent: {backgroundColor: Colors.bgPrimary, borderRadius: BorderRadius.xl, padding: Spacing.lg, width: '100%', maxWidth: 400, maxHeight: '80%'},
    modalTitle: {fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.textPrimary, marginBottom: Spacing.md, textAlign: 'center'},
    modalText: {fontSize: Typography.sizes.base, color: Colors.textSecondary, marginBottom: Spacing.xs},
    modalCloseBtn: {backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingVertical: Spacing.md, alignItems: 'center', marginTop: Spacing.md},
    modalCloseBtnText: {color: Colors.textWhite, fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold},
});

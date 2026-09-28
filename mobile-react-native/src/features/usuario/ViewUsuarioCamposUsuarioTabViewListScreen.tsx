import React, {useState} from 'react';
import {ScrollView, StyleSheet, Text, View, Pressable} from 'react-native';
import {MasterDetail} from '../MasterDetail';
import {PerfilCombo} from '../shared/components/PerfilCombo';
import {AgendaCombo} from '../shared/components/AgendaCombo';
import {Colors, Spacing, BorderRadius, Typography, Shadows} from '../theme';
import type {ApiItem} from '../types';
import type {AutoCompleteOption} from '../shared/components/AutoComplete';
import {
    TURNO_TRABALHO_SOURCE, TURNO_TRABALHO_COLUMNS, TURNO_TRABALHO_SEARCH,
    PERFIL_SOURCE, PERFIL_COLUMNS, PERFIL_SEARCH,
    AGENDA_SOURCE, AGENDA_COLUMNS, AGENDA_SEARCH,
    UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH,
} from '../masterDetailSources';

/**
 * CamposUsuarioTabView — espelha `camposUsuarioTabView.xhtml`
 * Abas: Pessoal | Endereço | Documentos | Trabalho | Acessos (Unidade/Perfil/Agenda)
 */
export default function ViewUsuarioCamposUsuarioTabViewListScreen(){
    const [active,setActive]=useState<'pessoal'|'endereco'|'documentos'|'trabalho'|'acessos'>('pessoal');
    const [acessoSub,setAcessoSub]=useState<'unidade'|'perfil'|'agenda'>('unidade');
    const [turnos,setTurnos]=useState<ApiItem[]>([]);
    const [perfis,setPerfis]=useState<ApiItem[]>([]);
    const [agendas,setAgendas]=useState<ApiItem[]>([]);
    const [unidades,setUnidades]=useState<ApiItem[]>([]);
    const [perfilSelected,setPerfilSelected]=useState<AutoCompleteOption | null>(null);
    const [agendaSelected,setAgendaSelected]=useState<AutoCompleteOption | null>(null);

    const tabs: Array<{key: typeof active; label:string}> = [
        {key:'pessoal', label:'Pessoal'},
        {key:'endereco', label:'Endereço'},
        {key:'documentos', label:'Documentos'},
        {key:'trabalho', label:'Trabalho'},
        {key:'acessos', label:'Acessos'},
    ];

    return (
        <View style={s.container}>
            <View style={s.header}>
                <Text style={s.headerTitle}>Usuário — camposUsuarioTabView</Text>
                <Text style={s.headerSub}>TabView incluído em formUsuario.xhtml via ui:include</Text>
            </View>
            <View style={s.tabsRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:6, paddingHorizontal:8}}>
                    {tabs.map(t=>(
                        <Pressable key={t.key} onPress={()=>setActive(t.key)} style={[s.tab, active===t.key && s.tabActive]}>
                            <Text style={[s.tabText, active===t.key && s.tabTextActive]}>{t.label}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={s.content} contentContainerStyle={{padding:16, paddingBottom:40, gap:12}}>
                <View style={s.notice}>
                    <Text style={s.noticeText}>Este é o <Text style={s.bold}>tabView</Text> de <Text style={s.mono}>camposUsuarioTabView.xhtml</Text>. A tela completa com salvamento está em <Text style={s.bold}>ViewUsuarioFormUsuario</Text>.</Text>
                </View>

                {active==='pessoal' && (
                    <View style={s.card}>
                        <Text style={s.sectionTitle}>Pessoal</Text>
                        <View style={s.infoBox}>
                            <Text style={s.infoText}>CPF (inputMask 999.999.999-99) · RG · Nome* · E-mail* · Nome Social* · Data Nascimento* (calendar) · Nome Pai · Nome Mãe* · Contato* (Tel OU Cel) · Referência 1/2 · Gênero · Etnia · Escolaridade* · Estado Civil*</Text>
                        </View>
                        <Text style={s.hint}>→ Implementação completa em ViewUsuarioFormUsuario (aba Pessoal).</Text>
                    </View>
                )}

                {active==='endereco' && (
                    <View style={s.card}>
                        <Text style={s.sectionTitle}>Endereço</Text>
                        <View style={s.infoBox}><Text style={s.infoText}>CEP (99.999-999) + Busca ViaCEP · Cidade (autoComplete) · Bairro (autoComplete) · Logradouro (autoComplete) · Número* · Complemento</Text></View>
                        <Text style={s.hint}>→ Botões Busca / Ajuste / Novo do logradouroController no XHTML mapeados para EnderecoCampos no app.</Text>
                    </View>
                )}

                {active==='documentos' && (
                    <View style={s.card}>
                        <Text style={s.sectionTitle}>Documentos</Text>
                        <View style={s.infoBox}>
                            <Text style={s.infoText}>Qtd filhos {'<'}14 · CTPS* · Série* · PIS* · Data Emissão RG · Órgão Emissor · Título Eleitor · Zona · Seção · Carteira Reservista</Text>
                            <Text style={[s.infoText,{marginTop:8}]}>Arquivos: Foto 3x4* · CTPS pág.1/2* · Contrato* · Certidão Nasc.* · Vacinação* · Comprov. Residência* · CPF* · RG frente/verso · Título · Reservista</Text>
                        </View>
                    </View>
                )}

                {active==='trabalho' && (
                    <View style={s.card}>
                        <Text style={s.sectionTitle}>Trabalho</Text>
                        <View style={s.infoBox}><Text style={s.infoText}>Ativo (se edição) · Função* · Data Admissão · Mensalista/Horista · Modelo de Turno · Turnos de Trabalho · Observação</Text></View>
                        <MasterDetail label="Turnos de Trabalho" source={TURNO_TRABALHO_SOURCE} valueKey="id" searchKeys={TURNO_TRABALHO_SEARCH} columns={TURNO_TRABALHO_COLUMNS} items={turnos} onChange={setTurnos}/>
                    </View>
                )}

                {active==='acessos' && (
                    <View style={s.card}>
                        <Text style={s.sectionTitle}>Acessos</Text>
                        <View style={s.subTabs}>
                            {(['unidade','perfil','agenda'] as const).map(k=>(
                                <Pressable key={k} onPress={()=>setAcessoSub(k)} style={[s.subTab, acessoSub===k && s.subTabActive]}>
                                    <Text style={[s.subTabText, acessoSub===k && s.subTabTextActive]}>{k==='unidade'?'Unidade':k==='perfil'?'Perfil':'Agenda'}</Text>
                                </Pressable>
                            ))}
                        </View>
                        {acessoSub==='unidade' && <MasterDetail label="Unidade" source={UNIDADE_SOURCE} valueKey="id" searchKeys={UNIDADE_SEARCH} columns={UNIDADE_COLUMNS} items={unidades} onChange={setUnidades}/>}
                        {acessoSub==='perfil' && (
                            <View style={{gap: 12}}>
                                <PerfilCombo
                                    label="Perfil"
                                    value={perfilSelected}
                                    onChange={setPerfilSelected}
                                    onAdd={(opt) => {
                                        if (opt) {
                                            setPerfis([...perfis, {id: opt.id, descricao: opt.label} as ApiItem]);
                                            setPerfilSelected(null);
                                        }
                                    }}
                                />
                                <MasterDetail label="Perfis Selecionados" source={PERFIL_SOURCE} valueKey="id" searchKeys={PERFIL_SEARCH} columns={PERFIL_COLUMNS} items={perfis} onChange={setPerfis}/>
                            </View>
                        )}
                        {acessoSub==='agenda' && (
                            <View style={{gap: 12}}>
                                <AgendaCombo
                                    label="Agenda"
                                    value={agendaSelected}
                                    onChange={setAgendaSelected}
                                    onAdd={(opt) => {
                                        if (opt) {
                                            setAgendas([...agendas, {id: opt.id, descricao: opt.label} as ApiItem]);
                                            setAgendaSelected(null);
                                        }
                                    }}
                                />
                                <MasterDetail label="Agendas Selecionadas" source={AGENDA_SOURCE} valueKey="id" searchKeys={AGENDA_SEARCH} columns={AGENDA_COLUMNS} items={agendas} onChange={setAgendas}/>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const s=StyleSheet.create({
    container:{flex:1, backgroundColor:Colors.bgPrimary},
    header:{padding:Spacing.lg, backgroundColor:Colors.bgSecondary, borderBottomWidth:1, borderBottomColor:Colors.borderLight},
    headerTitle:{fontSize:Typography.sizes.xl, fontWeight:Typography.weights.bold, color:Colors.textPrimary},
    headerSub:{fontSize:Typography.sizes.sm, color:Colors.textMuted, marginTop:2},
    tabsRow:{flexDirection:'row', backgroundColor:Colors.bgSecondary, borderBottomWidth:1, borderBottomColor:Colors.borderLight, paddingVertical:6},
    tab:{paddingVertical:8, paddingHorizontal:14, borderRadius:BorderRadius.lg, backgroundColor:Colors.bgPrimary, borderWidth:1, borderColor:Colors.borderLight},
    tabActive:{backgroundColor:Colors.primary, borderColor:Colors.primary},
    tabText:{fontSize:12, fontWeight:Typography.weights.semibold, color:Colors.textSecondary},
    tabTextActive:{color:Colors.textWhite},
    content:{flex:1},
    notice:{backgroundColor:'#fffbe6', borderWidth:1, borderColor:'#f0d98a', borderRadius:BorderRadius.md, padding:10},
    noticeText:{fontSize:11, color:'#6a5d00', lineHeight:16},
    bold:{fontWeight:Typography.weights.bold},
    mono:{fontFamily:Platform.OS==='ios'?'Menlo':'monospace', fontSize:10},
    card:{backgroundColor:Colors.bgSecondary, borderRadius:BorderRadius.lg, padding:Spacing.lg, gap:10, ...Shadows.small},
    sectionTitle:{fontSize:13, fontWeight:Typography.weights.bold, color:Colors.textPrimary, textTransform:'uppercase', letterSpacing:0.5},
    infoBox:{backgroundColor:'#f7f7f7', borderWidth:1, borderColor:Colors.borderLight, borderRadius:BorderRadius.md, padding:10},
    infoText:{fontSize:12, color:Colors.textSecondary, lineHeight:16},
    hint:{fontSize:11, color:Colors.textLight, fontStyle:'italic'},
    subTabs:{flexDirection:'row', gap:6},
    subTab:{flex:1, paddingVertical:8, borderRadius:BorderRadius.md, backgroundColor:Colors.bgPrimary, borderWidth:1, borderColor:Colors.borderLight, alignItems:'center'},
    subTabActive:{backgroundColor:Colors.primary, borderColor:Colors.primary},
    subTabText:{fontSize:12, fontWeight:Typography.weights.bold, color:Colors.textSecondary},
    subTabTextActive:{color:Colors.textWhite},
});

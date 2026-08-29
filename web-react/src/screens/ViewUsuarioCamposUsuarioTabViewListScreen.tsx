import {useState} from 'react';
import {PermissionGate} from '../permissions';
import {Tabs} from '../Tabs';
import {MasterDetail} from '../MasterDetail';
import {BooleanField} from '../BooleanField';
import {EnderecoCampos} from '../EnderecoForm';
import type {Endereco} from '../EnderecoForm';
import type {ApiItem} from '../types';
import {
    TURNO_TRABALHO_SOURCE, TURNO_TRABALHO_COLUMNS, TURNO_TRABALHO_SEARCH,
    PERFIL_SOURCE, PERFIL_COLUMNS, PERFIL_SEARCH,
    AGENDA_SOURCE, AGENDA_COLUMNS, AGENDA_SEARCH,
    UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH,
} from '../masterDetailSources';

/**
 * ViewUsuarioCamposUsuarioTabView — espelha fielmente `camposUsuarioTabView.xhtml`
 * Abas: Pessoal | Endereço | Documentos | Trabalho | Acessos (Unidade / Perfil / Agenda)
 * Este componente é usado como `ui:include` dentro de `formUsuario.xhtml`.
 * Aqui exposto como tela isolada para pré-visualização e edição rápida.
 */
export default function ViewUsuarioCamposUsuarioTabViewListScreen(){
    const [turnosTrabalho,setTurnosTrabalho]=useState<ApiItem[]>([]);
    const [perfis,setPerfis]=useState<ApiItem[]>([]);
    const [agendas,setAgendas]=useState<ApiItem[]>([]);
    const [unidades,setUnidades]=useState<ApiItem[]>([]);
    const [unidadeDefault,setUnidadeDefault]=useState('');
    const [enderecos,setEnderecos]=useState<Endereco[]>([]);
    const [agendaPerm,setAgendaPerm]=useState({agendar:false,alterar:false,fechar:false,iniciar:false,atender:false});
    const [acessoSub,setAcessoSub]=useState<'unidade'|'perfil'|'agenda'>('unidade');

    // — Pessoal (resumo dos campos do XHTML) —
    const pessoal = (
        <div className="form-grid" style={{fontSize:13, color:'#333'}}>
            <div style={{gridColumn:'1 / -1', background:'#f7f7f7', border:'1px solid #e6e6e6', borderRadius:6, padding:12}}>
                <div style={{fontWeight:700, marginBottom:6}}>Pessoal — campos do tab `pessoal` em camposUsuarioTabView.xhtml</div>
                <div style={{display:'grid', gridTemplateColumns:'180px 1fr', gap:'6px 12px', fontSize:12}}>
                    <span style={{color:'#666'}}>CPF</span><span>999.999.999-99 (inputMask, validaCPF)</span>
                    <span style={{color:'#666'}}>RG</span><span>inputText + validaRg</span>
                    <span style={{color:'#666'}}>Nome *</span><span>inputLarge 600px, validateLength 3-255</span>
                    <span style={{color:'#666'}}>E-mail *</span><span>inputLarge 600px</span>
                    <span style={{color:'#666'}}>Nome Social *</span><span>inputLarge 600px</span>
                    <span style={{color:'#666'}}>Data Nascimento *</span><span>p:calendar dd/MM/yyyy + validaIdadeAdulto</span>
                    <span style={{color:'#666'}}>Nome Pai</span><span>inputLarge</span>
                    <span style={{color:'#666'}}>Nome Mãe *</span><span>inputLarge</span>
                    <span style={{color:'#666'}}>Contato *</span><span>Telefone (99-99999999) OU Celular (99-999999999)</span>
                    <span style={{color:'#666'}}>Referência 1 *</span><span>Nome + Tel/Cel (OU)</span>
                    <span style={{color:'#666'}}>Referência 2</span><span>Nome 2 + Tel/Cel 2 (OU)</span>
                    <span style={{color:'#666'}}>Gênero / Etnia</span><span>po:inputSelecioneUm</span>
                    <span style={{color:'#666'}}>Escolaridade * / Estado Civil *</span><span>po:inputSelecioneUm (required)</span>
                </div>
                <div style={{marginTop:10, fontSize:11, color:'#888'}}>→ Veja a implementação completa em <b>ViewUsuarioFormUsuario</b> (Cadastro de Usuário).</div>
            </div>
        </div>
    );

    const endereco = (
        <div className="form-grid">
            <div style={{gridColumn:'1 / -1'}}>
                <div style={{fontSize:12, color:'#666', marginBottom:8}}>CEP com busca ViaCEP + Cidade / Bairro / Logradouro (autoComplete) + Número + Complemento — conforme aba <code>endereco</code>.</div>
                <EnderecoCampos value={enderecos} onChange={setEnderecos}/>
            </div>
        </div>
    );

    const documentos = (
        <div className="form-grid">
            <div style={{gridColumn:'1 / -1', background:'#f7f7f7', border:'1px solid #e6e6e6', borderRadius:6, padding:12, fontSize:12, color:'#333'}}>
                <div style={{fontWeight:700, marginBottom:6}}>Documentos — aba `documentos`</div>
                <div>Qtd. filhos &lt; 14 · CTPS* · Série* · PIS* · Data Emissão RG · Órgão Emissor · Título Eleitor · Zona · Seção · Carteira Reservista (se homem)</div>
                <div style={{marginTop:8, color:'#666'}}>Arquivos: Foto 3x4* · CTPS pág.1/2* · Contrato* · Certidão Nasc. filhos* · Vacinação filhos* · Comprov. Residência* · CPF* · RG frente/verso · Título · Reservista (homem)</div>
                <div style={{marginTop:8, fontSize:11, color:'#888'}}>Upload via <code>p:fileUpload</code> nos dialogs <code>dialogFoto, dialogCtps1/2, dialogContrato…</code> — implementado com <code>Base64FileUpload</code> em ViewUsuarioFormUsuario.</div>
            </div>
        </div>
    );

    const trabalho = (
        <div className="form-grid">
            <label className="form-field"><span className="form-label">Ativo</span><BooleanField value={true} onChange={()=>{}} /></label>
            <label className="form-field"><span className="form-label">Função *</span><select className="form-input form-select"><option>-- Selecione --</option></select></label>
            <label className="form-field"><span className="form-label">Data Admissão</span><input className="form-input" type="date" /></label>
            <label className="form-field">
                <span className="form-label">Regime</span>
                <div style={{display:'flex',gap:12,gridColumn:'span 3'}}><label style={{display:'flex',gap:6,fontSize:13}}><input type="radio" name="mensalista" defaultChecked/> Mensalista</label><label style={{display:'flex',gap:6,fontSize:13}}><input type="radio" name="mensalista"/> Horista</label></div>
            </label>
            <div style={{gridColumn:'1 / -1'}}>
                <MasterDetail label="Turnos de Trabalho" source={TURNO_TRABALHO_SOURCE} valueKey="id" searchKeys={TURNO_TRABALHO_SEARCH} columns={TURNO_TRABALHO_COLUMNS} items={turnosTrabalho} onChange={setTurnosTrabalho}/>
            </div>
            <label className="form-field"><span className="form-label">Observação</span><textarea className="form-input" rows={3} style={{minHeight:80, gridColumn:'span 3'}} placeholder="Observações" /></label>
        </div>
    );

    const acessos = (
        <div>
            <div style={{display:'flex',gap:6,marginBottom:12,borderBottom:'1px solid #e6e6e6',paddingBottom:8}}>
                {(['unidade','perfil','agenda'] as const).map(k=>(
                    <button key={k} type="button" onClick={()=>setAcessoSub(k)} className={acessoSub===k?'btnblue':'btnyellow'} style={{padding:'6px 14px',fontSize:13,borderRadius:6,border:'none',cursor:'pointer'}}>
                        {k==='unidade'?'Unidade':k==='perfil'?'Perfil':'Agenda'}
                    </button>
                ))}
            </div>
            {acessoSub==='unidade' && (
                <div className="form-grid">
                    <div style={{gridColumn:'1 / -1'}}><MasterDetail label="Unidade" source={UNIDADE_SOURCE} valueKey="id" searchKeys={UNIDADE_SEARCH} columns={UNIDADE_COLUMNS} items={unidades} onChange={setUnidades}/></div>
                    <label className="form-field"><span className="form-label">Unidade Padrão *</span>
                        <select className="form-input form-select" value={unidadeDefault} onChange={e=>setUnidadeDefault(e.target.value)}>
                            <option value="">-- Selecione --</option>{unidades.map(u=> <option key={String((u as any).id)} value={String((u as any).id)}>{(u as any).sucinto??String((u as any).id)}</option>)}
                        </select></label>
                </div>
            )}
            {acessoSub==='perfil' && <MasterDetail label="Perfil" source={PERFIL_SOURCE} valueKey="id" searchKeys={PERFIL_SEARCH} columns={PERFIL_COLUMNS} items={perfis} onChange={setPerfis}/>}
            {acessoSub==='agenda' && (
                <div>
                    <MasterDetail label="Agenda" source={AGENDA_SOURCE} valueKey="id" searchKeys={AGENDA_SEARCH} columns={AGENDA_COLUMNS} items={agendas} onChange={setAgendas}/>
                    <div style={{marginTop:14, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px,1fr))', gap:10}}>
                        <label className="form-field"><span className="form-label">Agendar</span><BooleanField value={agendaPerm.agendar} onChange={v=>setAgendaPerm(p=>({...p,agendar:v}))}/></label>
                        <label className="form-field"><span className="form-label">Alterar</span><BooleanField value={agendaPerm.alterar} onChange={v=>setAgendaPerm(p=>({...p,alterar:v}))}/></label>
                        <label className="form-field"><span className="form-label">Fechar</span><BooleanField value={agendaPerm.fechar} onChange={v=>setAgendaPerm(p=>({...p,fechar:v}))}/></label>
                        <label className="form-field"><span className="form-label">Iniciar</span><BooleanField value={agendaPerm.iniciar} onChange={v=>setAgendaPerm(p=>({...p,iniciar:v}))}/></label>
                        <label className="form-field"><span className="form-label">Atender</span><BooleanField value={agendaPerm.atender} onChange={v=>setAgendaPerm(p=>({...p,atender:v}))}/></label>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="page-header">
                    <div className="page-header-breadcrumb">
                        <nav className="breadcrumb" aria-label="Breadcrumb">
                            <div className="breadcrumb-group"><span className="breadcrumb-item breadcrumb-current">Usuário — camposUsuarioTabView</span></div>
                        </nav>
                    </div>
                </div>
                <div style={{maxWidth:980, margin:'0 auto', padding:'0 16px 24px'}}>
                    <div style={{background:'#fffbe6', border:'1px solid #f0d98a', borderRadius:6, padding:'10px 12px', fontSize:12, color:'#6a5d00', marginBottom:12}}>
                        Este é o <b>tabView</b> incluído em <code>formUsuario.xhtml</code> via <code>&lt;ui:include src="#&#123;usuarioController.camposTabView&#125;"&gt;</code>.
                        A implementação completa com salvamento está em <b>ViewUsuarioFormUsuario</b>.
                    </div>
                    <div className="div_form" style={{padding:16}}>
                        <Tabs tabs={[
                            {key:'pessoal', label:'Pessoal', content:pessoal},
                            {key:'endereco', label:'Endereço', content:endereco},
                            {key:'documentos', label:'Documentos', content:documentos},
                            {key:'trabalho', label:'Trabalho', content:trabalho},
                            {key:'acessos', label:'Acessos', content:acessos},
                        ]} initial="pessoal" />
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}

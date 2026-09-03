import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

const COLOR_COLUMNS = [
    'corPrimaria',
    'corSecundaria',
    'corBarra',
    'corFundo',
    'corTexto',
    'corTextoSelecionado',
    'corTextoNaoSelecionado',
    'corBorda',
    'corDestaque',
    'corEmail',
    'espessuraBorda',
    'corBordaPrimaria',
    'corBordaSecundaria',
];

const themePreview = (values: Record<string, unknown>) => {
    const color = (key: string, fallback: string) => {
        const value = values[key];
        return typeof value === 'string' && value.trim() ? value.trim() : fallback;
    };
    const primaria = color('corPrimaria', '#0868b3');
    const secundaria = color('corSecundaria', '#3baae3');
    const barra = color('corBarra', '#88c0ff');
    const fundo = color('corFundo', '#ffffff');
    const texto = color('corTexto', '#222222');
    const textoSelecionado = color('corTextoSelecionado', '#ffffff');
    const textoNaoSelecionado = color('corTextoNaoSelecionado', '#cccccc');
    const borda = color('corBorda', '#c0c0c0');
    const destaque = color('corDestaque', '#3baae3');
    const espessuraBorda = color('espessuraBorda', '3px');
    const corBordaPrimaria = color('corBordaPrimaria', '#c2aa3c');
    const corBordaSecundaria = color('corBordaSecundaria', '#3baae3');
    const logoPos = color('posicaoLogo', 'left');
    const barraPos = color('loginPosicao', 'center');
    const imagemFundo = color('imagemFundo', '');
    const bannerCabecalho = color('bannerCabecalho', '');
    const bannerRodape = color('bannerRodape', '');
    return (
        <div className="tema-preview" style={{backgroundColor: fundo, color: texto, borderColor: borda, borderWidth: espessuraBorda, borderStyle: 'solid', backgroundImage: imagemFundo ? `url(${imagemFundo})` : 'none', backgroundRepeat: 'repeat-x', backgroundSize: 'cover'}}>
            <div className="tema-preview-banner" style={{height: '40px', backgroundImage: bannerCabecalho ? `url(${bannerCabecalho})` : 'none', backgroundRepeat: 'repeat-x', backgroundSize: 'cover', borderBottom: `${espessuraBorda} solid ${corBordaPrimaria}`}}></div>
            <div className="tema-preview-topbar"
                 style={{backgroundColor: barra, color: texto, justifyContent: barraPos, borderBottom: `${espessuraBorda} solid ${corBordaPrimaria}`}}>
                <span className="tema-preview-logo" style={{backgroundColor: primaria, color: '#ffffff'}}>O</span>
                <span className="tema-preview-title">Olímpio</span>
            </div>
            <div className="tema-preview-body">
                <div className="tema-preview-sidebar" style={{
                    backgroundColor: primaria,
                    color: textoSelecionado,
                    textAlign: logoPos as 'left' | 'right' | 'center',
                    borderRight: `${espessuraBorda} solid ${corBordaPrimaria}`
                }}>
                    <span style={{color: textoSelecionado}}>Início (selecionado)</span>
                    <span style={{color: textoNaoSelecionado}}>Configurações</span>
                    <span style={{color: textoNaoSelecionado}}>Temas</span>
                </div>
                <div className="tema-preview-content" style={{backgroundColor: fundo, color: texto}}>
                    <p>Exemplo de conteúdo com a cor de destaque no botão.</p>
                    <button type="button" className="tema-preview-btn"
                            style={{backgroundColor: destaque, color: '#ffffff', border: `${espessuraBorda} solid ${corBordaSecundaria}`}}>
                        Salvar
                    </button>
                    <p style={{color: secundaria, marginTop: 8}}>Cor secundária: {secundaria}</p>
                    <p style={{color: corBordaPrimaria, marginTop: 4}}>Borda primária: {corBordaPrimaria} ({espessuraBorda})</p>
                    <p style={{color: corBordaSecundaria, marginTop: 4}}>Borda secundária: {corBordaSecundaria} ({espessuraBorda})</p>
                </div>
            </div>
            <div className="tema-preview-banner" style={{height: '30px', backgroundImage: bannerRodape ? `url(${bannerRodape})` : 'none', backgroundRepeat: 'repeat-x', backgroundSize: 'cover', borderTop: `${espessuraBorda} solid ${corBordaPrimaria}`}}></div>
        </div>
    );
};

export default function ViewTemaListTemasListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Temas</h1>
                <DataTable
                    path="/api/login/temas"
                    module="login"
                    colorColumns={COLOR_COLUMNS}
                    preview={themePreview}
                />
            </main>
        </PermissionGate>
    );
}

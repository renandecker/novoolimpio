import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';

const COLOR_COLUMNS = [
  'corPrimaria',
  'corSecundaria',
  'corBarra',
  'corFundo',
  'corTexto',
  'corBorda',
  'corDestaque',
  'corEmail',
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
  const borda = color('corBorda', '#c0c0c0');
  const destaque = color('corDestaque', '#3baae3');
  const logoPos = color('posicaoLogo', 'left');
  const barraPos = color('loginPosicao', 'center');
  return (
    <div className="tema-preview" style={{ backgroundColor: fundo, color: texto, borderColor: borda }}>
      <div className="tema-preview-topbar" style={{ backgroundColor: barra, color: texto, justifyContent: barraPos }}>
        <span className="tema-preview-logo" style={{ backgroundColor: primaria, color: '#ffffff' }}>O</span>
        <span className="tema-preview-title">Olímpio</span>
      </div>
        <div className="tema-preview-body">
        <div className="tema-preview-sidebar" style={{ backgroundColor: primaria, color: '#ffffff', textAlign: logoPos as 'left' | 'right' | 'center' }}>
          <span>Início</span>
          <span>Configurações</span>
          <span>Temas</span>
        </div>
        <div className="tema-preview-content">
          <p>Exemplo de conteúdo com a cor de destaque no botão.</p>
          <button type="button" className="tema-preview-btn" style={{ backgroundColor: destaque, color: '#ffffff' }}>
            Salvar
          </button>
          <p style={{ color: secundaria, marginTop: 8 }}>Cor secundária: {secundaria}</p>
        </div>
      </div>
    </div>
  );
};

export default function ViewTemaListTemasListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>List Temas</h1>
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

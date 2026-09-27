import {useNavigate, useSearchParams} from 'react-router-dom';
import {PermissionGate} from '../../../shared/services/permissions';
import {MetaDinamicaEditor} from './MetaDinamicaEditor';
import {num} from './metaDinamica';

export default function ViewMetaFormMetaDinamicaListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="page-header">
                    <div className="page-header-breadcrumb">
                        <nav className="breadcrumb" aria-label="Breadcrumb">
                            <div className="breadcrumb-group">
                                <span className="breadcrumb-item breadcrumb-current">Meta Dinâmica — Cadastro</span>
                            </div>
                        </nav>
                    </div>
                </div>
                <div style={{maxWidth: 980, margin: '0 auto', padding: '0 16px 24px'}}>
                    <MetaDinamicaEditor
                        metaId={num(searchParams.get('id'))}
                        indicadorId={num(searchParams.get('indicadorId'))}
                        onVoltar={() => navigate('/view/meta/listMetaDinamica')}
                        onNovaMeta={() => navigate('/view/meta/formMetaDinamica')}
                    />
                </div>
            </main>
        </PermissionGate>
    );
}

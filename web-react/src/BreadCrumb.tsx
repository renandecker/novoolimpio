import {Link} from 'react-router-dom';
import {useAuth} from './auth';
import {useCurrentModule} from './useCurrentModule';

export default function BreadCrumb() {
    const {session} = useAuth();
    const {module, ancestors} = useCurrentModule();
    if (!module) return null;

    const defaultPath = session?.defaultOutcome || '/meus-dados';

    return (
        <nav className="breadcrumb" aria-label="Trilha de navegação">
            <Link className="breadcrumb-item" to={defaultPath}>Início</Link>
            {ancestors.map((ancestor) => (
                <span className="breadcrumb-group" key={ancestor.id}>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-item breadcrumb-plain">{ancestor.rotulo}</span>
        </span>
            ))}
            <span className="breadcrumb-group">
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{module.rotulo}</span>
      </span>
        </nav>
    );
}

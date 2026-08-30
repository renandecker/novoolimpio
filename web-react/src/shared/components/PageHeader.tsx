import BreadCrumb from './BreadCrumb';
import HelpOverlay from './HelpOverlay';

export default function PageHeader() {
    return (
        <div className="page-header">
            <div className="page-header-breadcrumb">
                <BreadCrumb/>
            </div>
            <div className="page-header-actions">
                <HelpOverlay/>
            </div>
        </div>
    );
}

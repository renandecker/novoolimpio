import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function DefaultListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Default</h1>
                <DataTable path="/api/default"/>
            </main>
        </PermissionGate>
    );
}
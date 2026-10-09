import {DataTable} from './DataTable';
import type {DataTableColumn, ComboSource, DataTableRowAction} from './DataTable';
import {MasterDetail} from './MasterDetail';
import type {MasterDetailColumn} from './MasterDetail';
import {UnidadeCombo} from './UnidadeCombo';
import type {AutoCompleteOption} from './AutoComplete';
import {Tabs} from './Tabs';
import type {TabItem} from './Tabs';
import {useState} from 'react';
import type {ReactNode} from 'react';
import type {ApiItem} from '../types/index';

export interface ModuleTabMasterDetail {
    label: string;
    source: string;
    valueKey?: string;
    searchKeys?: string[];
    columns?: MasterDetailColumn[];
}

export interface ModuleTabUnidadeCombo {
    label?: string;
    value: AutoCompleteOption | null;
    onChange: (option: AutoCompleteOption | null) => void;
}

export interface ModuleTabItem {
    key: string;
    label: string;
    path?: string;
    params?: Record<string, unknown>;
    columns?: DataTableColumn[];
    combos?: Record<string, ComboSource>;
    empty?: string;
    maxMainColumns?: number;
    editNavigateTo?: string;
    createNavigateTo?: string;
    masterDetail?: ModuleTabMasterDetail;
    unidadeCombo?: ModuleTabUnidadeCombo;
    extraRowActions?: DataTableRowAction[];
    onActivate?: () => void;
    render?: () => ReactNode;
}

function MasterDetailTab({config}: { config: ModuleTabMasterDetail }) {
    const [items, setItems] = useState<ApiItem[]>([]);
    return (
        <MasterDetail
            label={config.label}
            source={config.source}
            valueKey={config.valueKey}
            searchKeys={config.searchKeys}
            columns={config.columns}
            items={items}
            onChange={setItems}
        />
    );
}

function UnidadeComboTab({config}: { config: ModuleTabUnidadeCombo }) {
    return (
        <UnidadeCombo
            label={config.label ?? 'Unidade'}
            value={config.value}
            onChange={config.onChange}
        />
    );
}

export function ModuleTabs({tabs, initial}: { tabs: ModuleTabItem[]; initial?: string }) {
    const items: TabItem[] = tabs.map((tab) => ({
        key: tab.key,
        label: tab.label,
content: tab.render ? (
                tab.render()
            ) : tab.masterDetail ? (
                <MasterDetailTab config={tab.masterDetail}/>
            ) : tab.unidadeCombo ? (
                <UnidadeComboTab config={tab.unidadeCombo}/>
            ) : tab.path ? (
                <DataTable
                    path={tab.path}
                    params={tab.params}
                    columns={tab.columns}
                    combos={tab.combos}
                    maxMainColumns={tab.maxMainColumns}
                    editNavigateTo={tab.editNavigateTo}
                    createNavigateTo={tab.createNavigateTo}
                    extraRowActions={tab.extraRowActions}
                />
            ) : (
            <p className="master-detail-empty">{tab.empty ?? 'Sem conteúdo nesta aba.'}</p>
        ),
    }));

    return <Tabs tabs={items} initial={initial} onChange={(key) => tabs.find(t => t.key === key)?.onActivate?.()}/>;
}

import {DataTable} from './DataTable';
import type {DataTableColumn} from './DataTable';
import {MasterDetail} from './MasterDetail';
import type {MasterDetailColumn} from './MasterDetail';
import {Tabs} from './Tabs';
import type {TabItem} from './Tabs';
import {useState} from 'react';
import type {ApiItem} from './types';

export interface ModuleTabMasterDetail {
    label: string;
    source: string;
    valueKey?: string;
    searchKeys?: string[];
    columns?: MasterDetailColumn[];
}

export interface ModuleTabItem {
    key: string;
    label: string;
    path?: string;
    params?: Record<string, unknown>;
    columns?: DataTableColumn[];
    empty?: string;
    maxMainColumns?: number;
    editNavigateTo?: string;
    createNavigateTo?: string;
    masterDetail?: ModuleTabMasterDetail;
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

export function ModuleTabs({tabs, initial}: { tabs: ModuleTabItem[]; initial?: string }) {
    const items: TabItem[] = tabs.map((tab) => ({
        key: tab.key,
        label: tab.label,
        content: tab.masterDetail ? (
            <MasterDetailTab config={tab.masterDetail}/>
        ) : tab.path ? (
            <DataTable
                path={tab.path}
                params={tab.params}
                columns={tab.columns}
                maxMainColumns={tab.maxMainColumns}
                editNavigateTo={tab.editNavigateTo}
                createNavigateTo={tab.createNavigateTo}
            />
        ) : (
            <p className="master-detail-empty">{tab.empty ?? 'Sem conteúdo nesta aba.'}</p>
        ),
    }));

    return <Tabs tabs={items} initial={initial}/>;
}

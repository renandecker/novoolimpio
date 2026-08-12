import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ModuleList } from './ModuleListScreen';
import { MasterDetail } from './MasterDetail';
import type { MasterDetailColumn } from './MasterDetail';
import { Tabs } from './Tabs';
import type { TabItem } from './Tabs';
import type { ApiItem } from './types';

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
  empty?: string;
  masterDetail?: ModuleTabMasterDetail;
}

function MasterDetailTab({ config }: { config: ModuleTabMasterDetail }) {
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

export function ModuleTabs({ tabs, initial }: { tabs: ModuleTabItem[]; initial?: string }) {
  const items: TabItem[] = tabs.map((tab) => ({
    key: tab.key,
    label: tab.label,
    content: tab.masterDetail ? (
      <MasterDetailTab config={tab.masterDetail} />
    ) : tab.path ? (
      <ModuleList path={tab.path} />
    ) : (
      <View style={styles.emptyBox}>
        <Text style={styles.empty}>{tab.empty ?? 'Sem conteúdo nesta aba.'}</Text>
      </View>
    ),
  }));

  return <Tabs tabs={items} initial={initial} />;
}

const styles = StyleSheet.create({
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 32 },
  empty: { color: '#888', fontStyle: 'italic', textAlign: 'center' },
});

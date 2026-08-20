import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import type {ReactNode} from 'react';

export interface TabItem<T extends string = string> {
    key: T;
    label: string;
    content: ReactNode;
}

interface TabsProps<T extends string = string> {
    tabs: TabItem<T>[];
    initial?: T;
}

export function Tabs<T extends string = string>({tabs, initial}: TabsProps<T>) {
    const [active, setActive] = useState<T>(initial ? ? tabs[0]?.key);

    const current = tabs.find((tab) => tab.key === active) ? ? tabs[0];

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
                <View style={styles.tabsRow}>
                    {tabs.map((tab) => {
                        const isActive = tab.key === current?.key;
                        return (
                            <Pressable
                                key={tab.key}
                                style={[styles.tab, isActive && styles.tabActive]}
                                onPress={() => setActive(tab.key)}
                            >
                                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>
            <View style={styles.content}>{current?.content}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1},
    tabsScroll: {flexGrow: 0, borderBottomWidth: 1, borderBottomColor: '#e0e0e0'},
    tabsRow: {flexDirection: 'row', paddingHorizontal: 4},
    tab: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {borderBottomColor: '#2a5a88'},
    tabLabel: {fontSize: 13, color: '#666666', fontWeight: '600'},
    tabLabelActive: {color: '#2a5a88'},
    content: {flex: 1, paddingTop: 10},
});

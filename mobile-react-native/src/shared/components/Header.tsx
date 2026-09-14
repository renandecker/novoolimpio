import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {UserMenu} from './UserMenu';
import {FavoritosButton} from '../../features/favoritos/FavoritosButton';

interface HeaderProps {
    title?: string;
    showBack?: boolean;
    onBack?: () => void;
    style?: any;
}

export function Header({title, showBack = false, onBack, style}: HeaderProps) {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.left}>
                {showBack && (
                    <View style={styles.backButton} onTouchStart={onBack}>
                        <Text style={styles.backText}>←</Text>
                    </View>
                )}
                {title && <Text style={styles.title}>{title}</Text>}
            </View>
            <View style={styles.right}>
                <FavoritosButton />
                <UserMenu />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#2a5a88',
        borderBottomWidth: 1,
        borderBottomColor: '#1e3a5f',
        height: 64,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 4,
    },
    backText: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
});
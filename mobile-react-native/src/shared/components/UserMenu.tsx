import React, {useRef, useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Modal,
    Alert,
    Platform,
    PermissionsAndroid,
} from 'react-native';
import {useAuth} from '../../features/auth/auth';
import {PhotoUploadModal} from './PhotoUploadModal';
import {useNavigation} from '@react-navigation/native';
import {removerPushToken} from '../../features/notificacoes/PushNotificationService';

interface UserMenuProps {
    style?: any;
}

export function UserMenu({style}: UserMenuProps) {
    const {session, signOut, refreshSession} = useAuth();
    const navigation = useNavigation();
    const [open, setOpen] = useState(false);
    const [photoModalVisible, setPhotoModalVisible] = useState(false);
    const containerRef = useRef<View>(null);

    const handlePhotoUpdate = (fotoUrl: string) => {
        if (!session) return;
        refreshSession({
            ...session,
            foto: fotoUrl,
        });
    };

    const handleLogout = async () => {
        setOpen(false);
        if (session?.idUsuario) {
            await removerPushToken(session.idUsuario);
        }
        signOut();
        navigation.reset({
            index: 0,
            routes: [{name: 'login'}],
        });
    };

    useEffect(() => {
        const handleBackButton = () => {
            if (open) {
                setOpen(false);
                return true;
            }
            return false;
        };

        if (Platform.OS === 'android') {
            const subscription = require('react-native').BackHandler.addEventListener('hardwareBackPress', handleBackButton);
            return () => subscription.remove();
        }
    }, [open]);

    if (!session) return null;

    const displayName = session.nome || session.username || 'Usuário';
    const avatarInitial = (session.nome || session.username || '?').charAt(0).toUpperCase();
    const hasFoto = !!session.foto;

    return (
        <>
            <TouchableOpacity
                ref={containerRef}
                style={[styles.container, style]}
                onPress={() => setOpen(!open)}
                activeOpacity={0.8}
            >
                <View style={styles.avatarWrapper}>
                    {hasFoto ? (
                        <Image source={{uri: session.foto}} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{avatarInitial}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
            </TouchableOpacity>

            <Modal
                visible={open}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setOpen(false)}
            >
                <View style={styles.overlay} onTouchStart={() => setOpen(false)}>
                    <View style={styles.dropdown} onTouchStart={e => e.stopPropagation()}>
                        <View style={styles.header}>
                            <View style={styles.photoWrapper}>
                                {hasFoto ? (
                                    <Image source={{uri: session.foto}} style={styles.photoLarge} />
                                ) : (
                                    <View style={styles.photoLargePlaceholder}>
                                        <Text style={styles.photoLargeText}>{avatarInitial}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.details}>
                                <Text style={styles.nameDisplay}>{displayName}</Text>
                                <Text style={styles.field}><Text style={styles.fieldLabel}>E-mail: </Text>{session.email || 'Não informado'}</Text>
                                <Text style={styles.field}><Text style={styles.fieldLabel}>CPF: </Text>{session.cpf || 'Não informado'}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.action} onPress={() => { setOpen(false); navigation.navigate('view/relatorios/listTabela'); }}>
                            <Text style={styles.actionIcon}>📊</Text>
                            <Text style={styles.actionLabel}>Relatórios</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.action} onPress={() => { setOpen(false); navigation.navigate('view/favoritoUsuario/listFavoritoUsuario'); }}>
                            <Text style={styles.actionIcon}>⭐</Text>
                            <Text style={styles.actionLabel}>Favoritos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.action} onPress={() => { setOpen(false); navigation.navigate('view/alterarSenha/alterarSenha'); }}>
                            <Text style={styles.actionIcon}>🔑</Text>
                            <Text style={styles.actionLabel}>Trocar senha</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.action} onPress={() => { setOpen(false); navigation.navigate('meus-dados'); }}>
                            <Text style={styles.actionIcon}>👤</Text>
                            <Text style={styles.actionLabel}>Meus dados</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.action} onPress={() => { setOpen(false); setPhotoModalVisible(true); }}>
                            <Text style={styles.actionIcon}>📷</Text>
                            <Text style={styles.actionLabel}>Alterar foto</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.action, styles.actionLogout]} onPress={handleLogout}>
                            <Text style={styles.actionIcon}>🚪</Text>
                            <Text style={[styles.actionLabel, styles.actionLabelLogout]}>Deslogar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <PhotoUploadModal
                visible={photoModalVisible}
                onClose={() => setPhotoModalVisible(false)}
                onPhotoUpdate={handlePhotoUpdate}
                currentFoto={session.foto}
                username={session.username}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    avatarWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#c2aa3c',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#2a5a88',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Georgia',
    },
    name: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        maxWidth: 140,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-start',
        paddingTop: 60,
        paddingRight: 16,
    },
    dropdown: {
        width: 280,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        padding: 14,
        backgroundColor: '#f8f8f8',
        gap: 12,
        alignItems: 'center',
    },
    photoWrapper: {
        flexShrink: 0,
    },
    photoLarge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    photoLargePlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#2a5a88',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#c2aa3c',
    },
    photoLargeText: {
        color: '#e8d27a',
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'Georgia',
    },
    details: {
        flex: 1,
        minWidth: 0,
    },
    nameDisplay: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    field: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    fieldLabel: {
        color: '#999',
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 16,
    },
    action: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    actionIcon: {
        fontSize: 20,
        width: 24,
        textAlign: 'center',
    },
    actionLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    actionLogout: {
        borderBottomWidth: 0,
    },
    actionLabelLogout: {
        color: '#a61b29',
    },
});
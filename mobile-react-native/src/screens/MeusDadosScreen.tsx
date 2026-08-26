import React, {useEffect, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableWithoutFeedback,
    TouchableOpacity,
    useNavigation
} from 'react-native';
import {useAuth} from '../auth';
import {useQuery} from '@tanstack/react-query';
import {listarFavoritos} from '../favoritos';
import {moduleIcon} from '../moduleIcons';
import {api} from '../api';
import {useRoute} from '@react-navigation/native';
import {PhotoUploadModal} from '../PhotoUploadModal';

type MeusDados = {
    username: string;
    nome: string;
    nomeSocial: string;
    cpf: string;
    rg: string;
    dataNascimento: string;
    email: string;
    telefone: string;
    celular: string;
    foto: string;
    nomePai: string;
    nomeMae: string;
    nomeReferencia: string;
    telefoneReferencia: string;
    facebook: string;
    twitter: string;
    telefoneComercial: string;
    genero: string;
    etnia: string;
    escolaridade: string;
    estadoCivil: string;
};

export default function MeusDadosScreen({navigation}: { navigation: any }) {
    const {session, refreshSession} = useAuth();
    const {navigate} = useNavigation();
    const {params} = useRoute();
    const [dados, setDados] = useState<MeusDados>({});
    const [favoritos, setFavoritos] = useState([]);
    const [busy, setBusy] = useState(true);
    const [photoModalVisible, setPhotoModalVisible] = useState(false);

    const handlePhotoUpdate = (fotoUrl: string) => {
        setDados(prev => ({...prev, foto: fotoUrl}));
        if (session) {
            refreshSession({
                ...session,
                foto: fotoUrl,
            });
        }
    };

    const favoritosQuery = useQuery({
        queryKey: ['favoritos', 'usuarioLogado'],
        queryFn: listarFavoritos,
        enabled: false,
    });

    useEffect(() => {
        if (favoritosQuery.data) {
            setFavoritos(favoritosQuery.data);
        }
    }, [favoritosQuery.data]);

    useEffect(() => {
        let active = true;
        alunoApi
            .perfil()
            .then((perfil) => {
                if (!active) return;
                setDados((prev) => ({
                    username: perfil.username || prev.username,
                    nome: perfil.nome || prev.nome,
                    nomeSocial: perfil.nomeSocial || '',
                    cpf: perfil.cpf || '',
                    rg: perfil.rg || '',
                    dataNascimento: perfil.dataNascimento || '',
                    email: perfil.email || prev.email,
                    telefone: perfil.telefone || '',
                    celular: perfil.celular || '',
                    foto: perfil.foto || prev.foto,
                    nomePai: perfil.nomePai || '',
                    nomeMae: perfil.nomeMae || '',
                    nomeReferencia: perfil.nomeReferencia || '',
                    telefoneReferencia: perfil.telefoneReferencia || '',
                    facebook: perfil.facebook || '',
                    twitter: perfil.twitter || '',
                    telefoneComercial: perfil.telefoneComercial || '',
                    genero: perfil.genero || '',
                    etnia: perfil.etnia || '',
                    escolaridade: perfil.escolaridade || '',
                    estadoCivil: perfil.estadoCivil || '',
                }));
            })
            .catch(() => {
                /* mantém os dados da sessão quando o perfil não está disponível */
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, []);

    if (busy) {
        return (
            <View style={styles.center}>
                <ActivityIndicator/>
            </View>
        );
    }

    const nomeExibido = dados.nome || dados.username || 'Usuário';
    const inicial = (dados.nome || dados.username || '?').charAt(0).toUpperCase();

    const rows: [string, string][] = [
        ['Usuário', dados.username || 'Não informado'],
        ['CPF', dados.cpf || 'Não informado'],
        ['RG', dados.rg || 'Não informado'],
        ['Data de nascimento', formatarData(dados.dataNascimento)],
        ['Gênero', dados.genero || 'Não informado'],
        ['Etnia', dados.etnia || 'Não informado'],
        ['Estado civil', dados.estadoCivil || 'Não informado'],
        ['Escolaridade', dados.escolaridade || 'Não informado'],
        ['E-mail', dados.email || 'Não informado'],
        ['Telefone', dados.telefone || 'Não informado'],
        ['Celular', dados.celular || 'Não informado'],
        ['Telefone comercial', dados.telefoneComercial || 'Não informado'],
        ['Nome do pai', dados.nomePai || 'Não informado'],
        ['Nome da mãe', dados.nomeMae || 'Não informado'],
        ['Contato de referência', dados.nomeReferencia || 'Não informado'],
        ['Telefone do contato', dados.telefoneReferencia || 'Não informado'],
        ...(dados.facebook ? [['Facebook', dados.facebook] as [string, string]] : []),
        ...(dados.twitter ? [['Twitter', dados.twitter] as [string, string]] : []),
    ];

    const navigateTo = (key: string) => {
        navigate(key as never);
    };

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Meus dados</Text>

            <View style={styles.favoritesSection}>
                <Text style={styles.favoritesTitle}>Favoritos</Text>
                {favoritos.length === 0 ? (
                    <Text style={styles.favoritesEmpty}>Nenhum favorito cadastrado.</Text>
                ) : (
                    <FlatList
                        data={favoritos}
                        keyExtractor={(item) => item.outcome}
                        renderItem={({item}) => (
                            <TouchableWithoutFeedback style={styles.favoriteItem}
                                                      onPress={() => navigateTo(normalizeOutcome(item.outcome))}>
                                <View style={styles.favoriteItemContent}>
                                    <Text style={styles.favoriteItemIcon}>{moduleIcon(item.nome, item.icon)}</Text>
                                    <Text style={styles.favoriteItemNome}>{item.nome}</Text>
                                    <Pressable style={styles.favoriteRemove} onPress={(e) => {
                                        e.stopPropagation();
                                        api.delete('/api/basico/favorito-usuario', {params: {outcome: item.outcome}});
                                        favoritosQuery.refetch();
                                    }}>
                                        <Text style={styles.favoriteRemoveIcon}>✕</Text>
                                    </Pressable>
                                </View>
                            </TouchableWithoutFeedback>
                        )}
                    />
                )}
            </View>

            <View style={styles.card}>
                <View style={styles.photoWrap}>
                    {dados.foto ? (
                        <Image source={{uri: dados.foto}} style={styles.photo}/>
                    ) : (
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{inicial}</Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.editPhotoBtn} onPress={() => setPhotoModalVisible(true)}>
                        <Text style={styles.editPhotoBtnText}>✎</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.nome}>{nomeExibido}</Text>
                {dados.nomeSocial ? <Text style={styles.social}>{dados.nomeSocial}</Text> : null}

                <View style={styles.grid}>
                    {rows.map(([label, value]) => (
                        <View style={styles.item} key={label}>
                            <Text style={styles.itemLabel}>{label}</Text>
                            <Text style={styles.itemValue}>{value}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
        <PhotoUploadModal
            visible={photoModalVisible}
            onClose={() => setPhotoModalVisible(false)}
            onPhotoUpdate={handlePhotoUpdate}
            currentFoto={dados.foto}
            username={session?.username}
        />
    );
}

const styles = StyleSheet.create({
    page: {flex: 1},
    content: {padding: 16},
    center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    title: {fontSize: 22, fontWeight: 'bold', color: '#2b2b2b', marginBottom: 16},
    card: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center'
    },
    photoWrap: {marginBottom: 12, position: 'relative'},
    photo: {width: 88, height: 88, borderRadius: 44},
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#2a5a88',
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarText: {color: '#ffffff', fontSize: 32, fontWeight: '700'},
    editPhotoBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#2a5a88',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    editPhotoBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    nome: {fontSize: 18, fontWeight: '700', color: '#2b2b2b'},
    social: {fontSize: 13, color: '#888', marginTop: 2},
    grid: {width: '100%', marginTop: 16},
    item: {borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 10},
    itemLabel: {fontSize: 12, color: '#888', textTransform: 'uppercase'},
    itemValue: {fontSize: 15, color: '#2b2b2b', marginTop: 2},
    favoritesSection: {
        marginBottom: 20,
    },
    favoritesTitle: {fontSize: 18, fontWeight: '600', color: '#2a5a88', marginBottom: 8},
    favoritesEmpty: {color: '#888', fontSize: 14, marginBottom: 8},
    favoriteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0'
    },
    favoriteItemIcon: {fontSize: 18, width: 26, textAlign: 'center'},
    favoriteItemNome: {fontSize: 14, color: '#1d2025', flex: 1},
    favoriteRemove: {
        paddingLeft: 16,
        color: '#e74c3c',
        fontSize: 12,
    },
    favoriteRemoveIcon: {fontSize: 12, color: '#e74c3c'},
    favoriteItemContent: {flexDirection: 'row', alignItems: 'center', gap: 10},
});
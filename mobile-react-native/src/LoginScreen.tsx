import {useState} from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import {useAuth} from './auth';
import {Colors, Spacing, BorderRadius, Typography, Shadows, Layout} from './theme';

export default function LoginScreen() {
    const {signIn, ready} = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [bootstrap, setBootstrap] = useState(false);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function submit() {
        setBusy(true);
        setError('');
        try {
            await signIn(username, password, bootstrap);
        } catch (e: any) {
            setError(e.response?.data?.error || 'Não foi possível entrar.');
        } finally {
            setBusy(false);
        }
    }

    if (!ready) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={Colors.gold} size="large"/>
            </View>
        );
    }

    return (
        <View style={styles.page}>
            <View style={styles.topbar}>
                <Text style={styles.topbarText}>Olímpio</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.box}>
                    <View style={styles.logo}>
                        <View style={styles.logoBadge}>
                            <Text style={styles.logoBadgeText}>O</Text>
                        </View>
                        <Text style={styles.logoText}>Olímpio</Text>
                    </View>
                    <Text style={styles.label}>Usuário</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite seu usuário"
                        placeholderTextColor={Colors.textPlaceholder}
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={username}
                        onChangeText={setUsername}
                    />
                    <Text style={styles.label}>Senha</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite sua senha"
                        placeholderTextColor={Colors.textPlaceholder}
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                    <Pressable
                        style={({pressed}) => [styles.button, pressed && styles.buttonPressed, busy && styles.buttonDisabled]}
                        onPress={submit}
                        disabled={busy}
                    >
                        <Text style={styles.buttonText}>
                            {busy ? 'Aguarde...' : bootstrap ? 'Criar e entrar' : 'Entrar'}
                        </Text>
                    </Pressable>
                    {error ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}
                    <Pressable
                        style={styles.toggle}
                        onPress={() => {
                            setBootstrap(!bootstrap);
                            setError('');
                        }}
                    >
                        <Text style={styles.toggleText}>
                            {bootstrap ? 'Já tenho acesso' : 'Criar primeiro acesso'}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
            <View style={styles.bottombar}/>
        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: Colors.headerEnd,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.headerEnd,
    },
    topbar: {
        height: Layout.headerHeight + Spacing.lg,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.headerMid,
        borderBottomWidth: 3,
        borderBottomColor: Colors.gold,
        ...Shadows.medium,
    },
    topbarText: {
        color: Colors.textGold,
        fontSize: Typography.sizes.xxxl,
        fontWeight: Typography.weights.bold,
        letterSpacing: 1,
        fontFamily: Typography.fontFamilySerif,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    box: {
        backgroundColor: Colors.bgPrimary,
        borderRadius: BorderRadius.xxl,
        paddingHorizontal: Spacing.sm,
        paddingBottom: Spacing.xl,
        ...Shadows.large,
    },
    logo: {
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
        alignItems: 'center',
        gap: Spacing.xs,
    },
    logoBadge: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: Colors.headerMid,
        borderWidth: 3,
        borderColor: Colors.gold,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoBadgeText: {
        color: Colors.textGold,
        fontSize: 30,
        fontWeight: Typography.weights.bold,
        fontFamily: Typography.fontFamilySerif,
    },
    logoText: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.title,
        fontWeight: Typography.weights.bold,
        letterSpacing: 1,
    },
    label: {
        color: Colors.textMuted,
        fontWeight: Typography.weights.bold,
        fontSize: Typography.sizes.lg,
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
        marginLeft: Spacing.md,
    },
    input: {
        width: '90%',
        alignSelf: 'center',
        padding: Spacing.md,
        fontSize: Typography.sizes.lg,
        color: Colors.textPrimary,
        backgroundColor: Colors.bgSecondary,
        borderWidth: 1,
        borderColor: Colors.borderMedium,
        borderRadius: BorderRadius.md,
        ...Shadows.small,
    },
    button: {
        marginTop: Spacing.xl,
        width: '90%',
        alignSelf: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        ...Shadows.small,
    },
    buttonPressed: {
        backgroundColor: Colors.primaryDark,
    },
    buttonDisabled: {
        backgroundColor: Colors.borderLight,
    },
    buttonText: {
        color: Colors.textWhite,
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
    },
    errorBox: {
        marginTop: Spacing.md,
        marginHorizontal: '5%',
        padding: Spacing.md,
        backgroundColor: Colors.errorBg,
        borderWidth: 1,
        borderColor: Colors.errorBorder,
        borderRadius: BorderRadius.md,
    },
    errorText: {
        color: Colors.error,
        fontSize: Typography.sizes.base,
        textAlign: 'center',
    },
    toggle: {
        marginTop: Spacing.md,
        alignItems: 'center',
        padding: Spacing.xs,
    },
    toggleText: {
        color: Colors.primary,
        fontSize: Typography.sizes.base,
        textDecorationLine: 'underline',
    },
    bottombar: {
        height: Layout.footerHeight + Spacing.sm,
        backgroundColor: '#121417',
        borderTopWidth: 3,
        borderTopColor: Colors.gold,
    },
});
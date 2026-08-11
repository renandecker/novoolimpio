import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from './auth';

export default function LoginScreen() {
  const { signIn, ready } = useAuth();
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
        <ActivityIndicator />
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
            placeholderTextColor="#9a9a9a"
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
          />
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor="#9a9a9a"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
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
      <View style={styles.bottombar} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#1a1d22',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1d22',
  },
  topbar: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#24272e',
    borderBottomWidth: 3,
    borderBottomColor: '#c2aa3c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
  topbarText: {
    color: '#e8d27a',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  box: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingBottom: 20,
    shadowColor: '#323232',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 12,
  },
  logo: {
    marginTop: 10,
    marginBottom: 6,
    alignItems: 'center',
    gap: 4,
  },
  logoBadge: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#24272e',
    borderWidth: 3,
    borderColor: '#c2aa3c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeText: {
    color: '#e8d27a',
    fontSize: 30,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  logoText: {
    color: '#616161',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
  label: {
    color: '#616161',
    fontWeight: '700',
    fontSize: 15,
    marginTop: 8,
    marginBottom: 2,
    marginLeft: 12,
  },
  input: {
    width: '90%',
    alignSelf: 'center',
    padding: 10,
    fontSize: 15,
    color: '#2b2b2b',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c9c9c9',
    borderRadius: 4,
    shadowColor: '#323232',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 2,
  },
  button: {
    marginTop: 20,
    width: '90%',
    alignSelf: 'center',
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#2a5a88',
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: '#1c3d5e',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    textShadowColor: '#555',
    textShadowOffset: { width: -1, height: -1 },
    textShadowRadius: 0,
  },
  errorBox: {
    marginTop: 12,
    marginHorizontal: '5%',
    padding: 8,
    backgroundColor: '#fdecea',
    borderWidth: 1,
    borderColor: '#f5c6cb',
    borderRadius: 4,
  },
  errorText: {
    color: '#a61b29',
    fontSize: 13,
    textAlign: 'center',
  },
  toggle: {
    marginTop: 12,
    alignItems: 'center',
    padding: 4,
  },
  toggleText: {
    color: '#2a5a88',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  bottombar: {
    height: 40,
    backgroundColor: '#121417',
    borderTopWidth: 3,
    borderTopColor: '#c2aa3c',
  },
});

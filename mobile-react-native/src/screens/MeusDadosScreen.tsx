import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth';
import { alunoApi, formatarData } from '../aluno';

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
};

export default function MeusDadosScreen() {
  const { session } = useAuth();
  const [dados, setDados] = useState<MeusDados>({
    username: session?.username || '',
    nome: '',
    nomeSocial: '',
    cpf: '',
    rg: '',
    dataNascimento: '',
    email: '',
    telefone: '',
    celular: '',
    foto: '',
  });
  const [busy, setBusy] = useState(true);

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
          cpf: perfil.cpf || prev.cpf,
          rg: perfil.rg || '',
          dataNascimento: perfil.dataNascimento || '',
          email: perfil.email || prev.email,
          telefone: perfil.telefone || '',
          celular: perfil.celular || '',
          foto: perfil.foto || prev.foto,
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
        <ActivityIndicator />
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
    ['E-mail', dados.email || 'Não informado'],
    ['Telefone', dados.telefone || 'Não informado'],
    ['Celular', dados.celular || 'Não informado'],
  ];

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Meus dados</Text>

      <View style={styles.card}>
        <View style={styles.photoWrap}>
          {dados.foto ? (
            <Image source={{ uri: dados.foto }} style={styles.photo} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{inicial}</Text>
            </View>
          )}
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
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2b2b2b', marginBottom: 16 },
  card: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, padding: 20, alignItems: 'center' },
  photoWrap: { marginBottom: 12 },
  photo: { width: 88, height: 88, borderRadius: 44 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#2a5a88', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#ffffff', fontSize: 32, fontWeight: '700' },
  nome: { fontSize: 18, fontWeight: '700', color: '#2b2b2b' },
  social: { fontSize: 13, color: '#888', marginTop: 2 },
  grid: { width: '100%', marginTop: 16 },
  item: { borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 10 },
  itemLabel: { fontSize: 12, color: '#888', textTransform: 'uppercase' },
  itemValue: { fontSize: 15, color: '#2b2b2b', marginTop: 2 },
});

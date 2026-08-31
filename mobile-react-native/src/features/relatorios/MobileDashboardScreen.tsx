import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { Users, DollarSign, ShoppingBag, Search, Bell } from 'lucide-react-native';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function MobileDashboardScreen() {
  const [data] = useState({
    receita: '45.200',
    receitaTrend: '45,20%',
    novosClientes: '+1.230',
    vendas: '340',
    vendasTrend: '-0,05%'
  });

  const chartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [{ data: [4000, 3000, 5000, 2780, 1890, 2390] }]
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={18} color="#9ca3af" style={styles.searchIcon} />
          <TextInput placeholder="Buscar..." placeholderTextColor="#9ca3af" style={styles.searchInput} />
        </View>
        <TouchableOpacity style={styles.bellButton}>
          <Bell size={20} color="#6b7280" />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Visão Geral</Text>
        <Text style={styles.subtitle}>Acompanhe as métricas principais do seu negócio.</Text>
      </View>

      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <View>
            <Text style={styles.cardTitle}>Receita</Text>
            <Text style={styles.cardValue}>R$ {data.receita}</Text>
            <Text style={styles.positiveText}>↑ {data.receitaTrend}</Text>
          </View>
          <View style={[styles.iconBox, styles.blueBg]}>
            <DollarSign size={22} color="#2563eb" />
          </View>
        </View>

        <View style={styles.card}>
          <View>
            <Text style={styles.cardTitle}>Novos Clientes</Text>
            <Text style={styles.cardValue}>{data.novosClientes}</Text>
            <Text style={styles.positiveText}>↑ {data.novosClientes}</Text>
          </View>
          <View style={[styles.iconBox, styles.blueBg]}>
            <Users size={22} color="#2563eb" />
          </View>
        </View>

        <View style={styles.card}>
          <View>
            <Text style={styles.cardTitle}>Vendas Mensais</Text>
            <Text style={styles.cardValue}>{data.vendas}</Text>
            <Text style={styles.negativeText}>↓ {data.vendasTrend}</Text>
          </View>
          <View style={[styles.iconBox, styles.orangeBg]}>
            <ShoppingBag size={22} color="#ea580c" />
          </View>
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Sales Chart</Text>
        <BarChart
          data={chartData}
          width={screenWidth - 48}
          height={220}
          yAxisLabel="R$ "
          chartConfig={{
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
            style: { borderRadius: 16 }
          }}
          style={{ marginVertical: 8, borderRadius: 12 }}
        />
      </View>

      <View style={styles.tableCard}>
        <Text style={styles.chartTitle}>Clientes Recentes</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, {flex: 2}]}>Cliente</Text>
          <Text style={[styles.tableHeaderText, {flex: 2}]}>Email</Text>
          <Text style={[styles.tableHeaderText, {flex: 1}]}>Status</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, {flex: 2, fontWeight: 'bold'}]}>Marrin Cerne</Text>
          <Text style={[styles.tableCell, {flex: 2}]}>commama@gmail.com</Text>
          <View style={[styles.statusBadge, styles.successBadge]}><Text style={styles.successText}>Pago</Text></View>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, {flex: 2, fontWeight: 'bold'}]}>Adam Maxtin</Text>
          <Text style={[styles.tableCell, {flex: 2}]}>manmama@gmail.com</Text>
          <View style={[styles.statusBadge, styles.warningBadge]}><Text style={styles.warningText}>Pendente</Text></View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 20 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, marginRight: 12, height: 44 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1f2937' },
  bellButton: { width: 44, height: 44, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  badge: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, backgroundColor: '#2563eb', borderRadius: 4 },
  titleContainer: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  cardsContainer: { gap: 16, marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  cardValue: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', marginTop: 4 },
  positiveText: { fontSize: 12, fontWeight: '600', color: '#059669', marginTop: 6 },
  negativeText: { fontSize: 12, fontWeight: '600', color: '#e11d48', marginTop: 6 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  blueBg: { backgroundColor: '#eff6ff' },
  orangeBg: { backgroundColor: '#fff7ed' },
  chartCard: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 20, elevation: 2 },
  chartTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
  tableCard: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 30, elevation: 2 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 8, marginBottom: 8 },
  tableHeaderText: { fontSize: 11, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  tableCell: { fontSize: 13, color: '#334155' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  successBadge: { backgroundColor: '#ecfdf5' },
  successText: { color: '#059669', fontSize: 11, fontWeight: '600' },
  warningBadge: { backgroundColor: '#fffbeb' },
  warningText: { color: '#d97706', fontSize: 11, fontWeight: '600' }
});

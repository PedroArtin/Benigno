// screens/Estatisticas.js - COM DADOS REAIS DO FIREBASE
import React, { useEffect, useState } from 'react';
import { fontes, cores } from '../components/Global';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { auth } from '../firebase/firebaseconfig';
import { buscarEstatisticasDoacao } from '../services/projetosService';

export default function Estatisticas() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [estatisticas, setEstatisticas] = useState(null);
  const [animatedData, setAnimatedData] = useState([]);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('⚠️ Usuário não autenticado');
        setLoading(false);
        return;
      }

      console.log('📊 Carregando estatísticas...');
      const stats = await buscarEstatisticasDoacao(user.uid);
      
      if (!stats) {
        console.log('⚠️ Nenhuma estatística retornada');
        setLoading(false);
        return;
      }
      
      setEstatisticas(stats);

      // Preparar dados para o gráfico de barras
      const cores_barras = ['#ff9800', '#90ab63', '#f57c00'];
      const barData = Object.entries(stats.doacoesPorMes || {}).map(([label, value], index) => ({
        value,
        label,
        frontColor: cores_barras[index % cores_barras.length],
      }));

      // Iniciar animação
      setAnimatedData(barData.map(item => ({ ...item, value: 0 })));

      let step = 0;
      const totalSteps = 30;
      const interval = setInterval(() => {
        if (step >= totalSteps) {
          clearInterval(interval);
          return;
        }
        step++;
        setAnimatedData(
          barData.map(item => ({
            ...item,
            value: Math.min(item.value, Math.floor((item.value / totalSteps) * step)),
          }))
        );
      }, 25);

    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarEstatisticas();
  };

  const preparePieData = () => {
    if (!estatisticas?.doacoesPorCategoria) return [];

    const categoryColors = {
      'direitos-humanos': '#7B1FA2',
      'combate-a-fome': '#E53935',
      'educacao': '#1E88E5',
      'saude': '#43A047',
      'crianca-e-adolescentes': '#FBC02D',
      'defesa-dos-animais': '#8D6E63',
      'meio-ambiente': '#26A69A',
      'melhor-idade': '#FB8C00',
    };

    const categoryLabels = {
      'direitos-humanos': 'Direitos Humanos',
      'combate-a-fome': 'Combate à Fome',
      'educacao': 'Educação',
      'saude': 'Saúde',
      'crianca-e-adolescentes': 'Crianças e Adolescentes',
      'defesa-dos-animais': 'Defesa dos Animais',
      'meio-ambiente': 'Meio Ambiente',
      'melhor-idade': 'Apoio à Melhor Idade',
    };

    return Object.entries(estatisticas.doacoesPorCategoria).map(([categoria, value]) => ({
      value,
      color: categoryColors[categoria] || '#999',
      text: categoryLabels[categoria] || categoria,
    }));
  };

  const getMesComMaisDoacoes = () => {
    if (!estatisticas?.doacoesPorMes) return 'N/A';
    
    const entries = Object.entries(estatisticas.doacoesPorMes);
    if (entries.length === 0) return 'N/A';
    
    const maxEntry = entries.reduce((max, item) => {
      return item[1] > max[1] ? item : max;
    }, entries[0]);
    
    return maxEntry[1] > 0 ? maxEntry[0] : 'N/A';
  };

  // Loading state
  if (loading) {
    return (
      <View style={[style.scrollContainer, { justifyContent: 'center', flex: 1 }]}>
        <ActivityIndicator size="large" color={cores.verdeEscuro} />
        <Text style={{ ...fontes.montserrat, marginTop: 10, textAlign: 'center' }}>
          Carregando estatísticas...
        </Text>
      </View>
    );
  }

  // Empty state - sem doações
  if (!estatisticas || estatisticas.totalDoacoes === 0) {
    return (
      <ScrollView 
        contentContainerStyle={style.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={style.ctntituloEstatisticas}>
          <Text style={style.tituloEstatisticas}>Veja as estatísticas das suas doações</Text>
          <Text style={style.textoEstatisticas}>
            Você ainda não fez nenhuma doação. Comece a doar para ver suas estatísticas aqui!
          </Text>
          <View style={style.linha}/>
        </View>
        
        <View style={style.emptyStateContainer}>
          <Text style={{ fontSize: 80 }}>📊</Text>
          <Text style={style.emptyTitle}>Nenhuma doação ainda</Text>
          <Text style={style.emptySubtitle}>
            Suas estatísticas aparecerão aqui após sua primeira doação
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Dados para os gráficos
  const pieData = preparePieData();
  const totalPieValue = pieData.reduce((acc, item) => acc + item.value, 0);
  const maxBarValue = Math.max(...animatedData.map(item => item.value), 10);

  return (
    <ScrollView 
      contentContainerStyle={style.scrollContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={style.ctntituloEstatisticas}>
        <Text style={style.tituloEstatisticas}>Veja as estatísticas das suas doações</Text>
        <Text style={style.textoEstatisticas}>
          Veja informações sobre as suas doações e como você ajudou pessoas:
        </Text>
        <View style={style.linha}/>
      </View>

      {/* Gráfico de Barras - Doações por Mês */}
      <View style={style.containerGrafico}>
        <Text style={style.tituloGrafico}>Estatísticas de cada mês</Text>
        <BarChart
          height={100}
          width={310}
          backgroundColor={cores.brancoTexto}
          barWidth={20}
          barBorderRadius={3}
          data={animatedData}
          yAxisThickness={0}
          xAxisThickness={0}
          yAxisTextStyle={{ color: "#999" }}
          yAxisLabelTextStyle={{ color: "#999", fontFamily: "Montserrat_500Medium" }}
          xAxisLabelTextStyle={{ color: "#999", fontFamily: "Montserrat_500Medium", fontSize: 10 }}
          spacing={16}
          maxValue={maxBarValue}
          noOfSections={4}
          initialSpacing={10}
          isAnimated
        />
      </View>

      {/* Cards de Resumo */}
      <View style={style.sessaoGrafico}>
        <View style={style.containerSessaoGrafico}>
          <Text style={style.textoSessaoGrafico}>
            Você fez um total de {estatisticas.totalDoacoes} doações esse ano
          </Text>
          <Image source={require("../assets/wave-1.png")} style={style.imagem} />
        </View>

        <View style={style.containerSessaoGrafico}>
          <Text style={style.textoSessaoGrafico}>
            O mês que você mais fez doações foi em {getMesComMaisDoacoes()}
          </Text>
          <Image source={require("../assets/wave-1.png")} style={style.imagem} />
        </View>
      </View>

      {/* Gráfico de Pizza - Distribuição por Categoria */}
      {pieData.length > 0 && (
        <View style={[style.containerGrafico, { marginTop: 30, alignItems: 'center' }]}>
          <Text style={style.tituloGrafico}>Distribuição por categoria</Text>
          <View style={style.containerPie}>
            <PieChart
              data={pieData}
              donut
              radius={70}
              innerRadius={45}
              strokeColor="#fff"
              strokeWidth={0}
            />
          </View>

          <View style={style.legendaContainer}>
            {pieData.map((item, index) => {
              const percent = totalPieValue > 0 ? ((item.value / totalPieValue) * 100).toFixed(1) : 0;
              return (
                <View key={index} style={style.legendaItem}>
                  <View style={[style.legendaCor, { backgroundColor: item.color }]} />
                  <Text style={[style.legendaTexto, { width: 90 }]} numberOfLines={1} ellipsizeMode="tail">
                    {item.text}
                  </Text>
                  <View style={style.progressBar}>
                    <View style={[style.progressFill, { width: `${percent}%`, backgroundColor: item.color }]} />
                  </View>
                  <Text style={style.percentText}>{percent}%</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const style = StyleSheet.create({
  scrollContainer: {
    paddingTop: 20,
    alignItems: "center",
    backgroundColor: cores.fundoBranco,
    flexGrow: 1,
  },
  ctntituloEstatisticas: {
    width: "100%",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  tituloEstatisticas: {
    ...fontes.merriweatherBold,
    fontSize: 24,
    marginBottom: 10,
    color: cores.verdeEscuro,
  },
  textoEstatisticas: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
    lineHeight: 20,
  },
  linha: {
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  containerGrafico: {
    width: "92%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    padding: 15,
    backgroundColor: cores.brancoTexto,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessaoGrafico: {
    justifyContent: "space-between",
    flexDirection: "row",
    width: "92%",
  },
  containerSessaoGrafico: {
    width: "48%",
    height: 120,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: cores.brancoTexto,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 15,
    overflow: "hidden",
  },
  textoSessaoGrafico: {
    margin: 12,
    fontSize: 14,
    color: '#333',
    ...fontes.montserratMedium,
    textAlign: 'center',
  },
  imagem: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 40,
    resizeMode: "cover",
  },
  tituloGrafico: {
    ...fontes.montserratBold,
    fontSize: 16,
    marginBottom: 15,
    color: cores.verdeEscuro,
  },
  containerPie: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    width: 300,
    height: 180,
  },
  legendaContainer: {
    marginTop: 15,
    width: 310,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendaCor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendaTexto: {
    fontSize: 11,
    color: "#333",
    fontFamily: 'Montserrat_500Medium',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#eee',
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentText: {
    width: 40,
    fontSize: 11,
    color: '#333',
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'right',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 60,
  },
  emptyTitle: {
    ...fontes.merriweatherBold,
    fontSize: 20,
    color: cores.verdeEscuro,
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    ...fontes.montserrat,
    fontSize: 14,
    color: cores.placeholder,
    textAlign: 'center',
    lineHeight: 20,
  },
});
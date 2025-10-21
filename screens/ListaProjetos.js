// screens/ListaProjetos.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../components/Global';
import { buscarTodosProjetos } from '../services/projetosService';

export default function ListaProjetos({ navigation }) {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    carregarProjetos();
  }, []);

  const carregarProjetos = async () => {
    try {
      const projetosData = await buscarTodosProjetos();
      setProjetos(projetosData);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarProjetos();
  };

  const calcularProgresso = (atual, meta) => {
    if (meta === 0) return 0;
    return Math.min((atual / meta) * 100, 100);
  };

  const renderProjeto = ({ item }) => {
    const progresso = calcularProgresso(item.arrecadacaoAtual, item.metaArrecadacao);

    return (
      <TouchableOpacity
        style={styles.projetoCard}
        onPress={() => navigation.navigate('DetalhesProjeto', { projetoId: item.id })}
      >
        {/* Imagem */}
        <Image
          source={{ uri: item.imagemUri }}
          style={styles.projetoImagem}
        />

        {/* Badge da Instituição */}
        <View style={styles.badgeInstituicao}>
          <Ionicons name="business" size={14} color="#fff" />
          <Text style={styles.badgeText}>{item.instituicaoNome}</Text>
        </View>

        {/* Conteúdo */}
        <View style={styles.projetoConteudo}>
          <Text style={styles.projetoTitulo} numberOfLines={2}>
            {item.titulo}
          </Text>

          <Text style={styles.projetoDescricao} numberOfLines={3}>
            {item.descricao}
          </Text>

          {/* Progresso */}
          <View style={styles.progressoContainer}>
            <View style={styles.progressoHeader}>
              <Text style={styles.progressoTexto}>
                {item.arrecadacaoAtual} de {item.metaArrecadacao}
              </Text>
              <Text style={styles.progressoPorcentagem}>
                {progresso.toFixed(0)}%
              </Text>
            </View>

            <View style={styles.progressoBar}>
              <View
                style={[
                  styles.progressoFill,
                  { width: `${progresso}%` },
                ]}
              />
            </View>
          </View>

          {/* Botão Ajudar */}
          <TouchableOpacity
            style={styles.ajudarBtn}
            onPress={() => navigation.navigate('DetalhesProjeto', { projetoId: item.id })}
          >
            <Ionicons name="heart-outline" size={20} color="#fff" />
            <Text style={styles.ajudarBtnText}>Quero Ajudar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando projetos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Projetos</Text>
        <Text style={styles.headerSubtitle}>Escolha um projeto para ajudar</Text>
      </View>

      {/* Lista de Projetos */}
      {projetos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={80} color={cores.placeholder} />
          <Text style={styles.emptyText}>Nenhum projeto disponível</Text>
          <Text style={styles.emptySubtext}>
            Novos projetos aparecerão aqui em breve!
          </Text>
        </View>
      ) : (
        <FlatList
          data={projetos}
          renderItem={renderProjeto}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundoBranco,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...fontes.montserrat,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    ...fontes.merriweatherBold,
    fontSize: 28,
    color: cores.verdeEscuro,
  },
  headerSubtitle: {
    ...fontes.montserrat,
    fontSize: 14,
    color: cores.placeholder,
    marginTop: 5,
  },
  lista: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  projetoCard: {
    backgroundColor: cores.brancoTexto,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  projetoImagem: {
    width: '100%',
    height: 200,
    backgroundColor: '#E0E0E0',
  },
  badgeInstituicao: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    ...fontes.montserratMedium,
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
  projetoConteudo: {
    padding: 20,
  },
  projetoTitulo: {
    ...fontes.merriweatherBold,
    fontSize: 20,
    color: cores.verdeEscuro,
    marginBottom: 10,
  },
  projetoDescricao: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  progressoContainer: {
    marginBottom: 15,
  },
  progressoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressoTexto: {
    ...fontes.montserratMedium,
    fontSize: 14,
    color: '#333',
  },
  progressoPorcentagem: {
    ...fontes.montserratBold,
    fontSize: 14,
    color: cores.verdeEscuro,
  },
  progressoBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressoFill: {
    height: '100%',
    backgroundColor: cores.verdeEscuro,
    borderRadius: 4,
  },
  ajudarBtn: {
    flexDirection: 'row',
    backgroundColor: cores.laranjaEscuro,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ajudarBtnText: {
    ...fontes.montserratBold,
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    ...fontes.merriweatherBold,
    fontSize: 20,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    ...fontes.montserrat,
    fontSize: 14,
    color: cores.placeholder,
    marginTop: 10,
    textAlign: 'center',
  },
});
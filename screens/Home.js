// screens/Home.js - COMPLETO COM FAVORITOS, NOTIFICAÇÕES E NAVEGAÇÃO CORRIGIDA
import React, { useState, useEffect } from 'react';
import { fontes, cores } from "../components/Global";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";
import { buscarProjetosAtivos } from '../services/projetosService';
import { useFavoritos } from '../hooks/useFavoritos';
import BotaoFavoritar from '../components/BotaoFavoritar';
import NotificacoesBadge from '../components/NotificacoesBadge';

const { width } = Dimensions.get("window");

export default function Home({ navigation }) {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Hook de favoritos
  const { isFavorito, toggleFavorito, totalFavoritos } = useFavoritos();
  
  const images = [
    require("../assets/banner-1.png"),
    require("../assets/banner-2.png"),
    require("../assets/banner-3.png"),
  ];

  useEffect(() => {
    carregarProjetos();
  }, []);

  const carregarProjetos = async () => {
    try {
      const projetosData = await buscarProjetosAtivos();
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

  const getCategoriaColor = (categoria) => {
    const cores_categorias = {
      'direitos-humanos': cores.direitosh,
      'combate-a-fome': cores.fome,
      'educacao': cores.educacao,
      'saude': cores.saude,
      'crianca-e-adolescentes': cores.criancasAdolescentes,
      'defesa-dos-animais': cores.animais,
      'meio-ambiente': cores.meioAmbiente,
      'melhor-idade': cores.melhorIdade,
    };
    return cores_categorias[categoria] || cores.verdeClaro;
  };

  return (
    <SafeAreaView style={style.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={style.boxTop}>
          <View style={style.header}>
            <View style={style.containerHeader}>
              <View style={style.localizacao}>
                <Ionicons
                  name="location-outline"
                  size={32}
                  color={cores.brancoTexto}
                />
                <View style={{ justifyContent: "center" }}>
                  <Text style={{ color: cores.brancoTexto, ...fontes.montserrat, fontSize: 10 }}>
                    Sua Localização
                  </Text>
                  <Text style={style.textoLocalizacao}>Praia Grande, SP</Text>
                </View>
              </View>
            </View>
            
            {/* Botões de ações - Notificações e Favoritos */}
            <View style={style.headerButtons}>
              <NotificacoesBadge navigation={navigation} />
              <TouchableOpacity 
                style={style.favoritosBtn}
                onPress={() => navigation.navigate('Favoritos')}
              >
                <Ionicons name="heart" size={24} color={cores.brancoTexto} />
                {totalFavoritos > 0 && (
                  <View style={style.favoritosBadge}>
                    <Text style={style.favoritosBadgeText}>
                      {totalFavoritos > 9 ? '9+' : totalFavoritos}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={style.pesquisa}>
            <TextInput style={style.input} placeholder="Pesquisar projetos..." />
          </View>

          <View style={style.ctnCarrossel}>
            <Carousel
              loop
              width={360}
              height={170}
              autoPlay
              data={images}
              autoPlayInterval={4000}
              scrollAnimationDuration={1000}
              onSnapToItem={(index) => setCurrentIndex(index)}
              renderItem={({ item }) => (
                <View style={style.card}>
                  <Image source={item} style={style.image} />
                </View>
              )}
            />

            <View style={style.pagination}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    style.dot,
                    currentIndex === index ? style.dotActive : style.dotInactive,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Seção de Projetos */}
        <View style={style.cntProjetos}>
          <View style={style.ctnTitulo}>
            <Ionicons name="heart-outline" size={24} color={cores.verdeEscuro} />
            <Text style={style.tituloProjetos}>Projetos que Precisam de Você</Text>
          </View>

          {loading ? (
            <Text style={style.loadingText}>Carregando projetos...</Text>
          ) : projetos.length === 0 ? (
            <View style={style.emptyState}>
              <Ionicons name="folder-open-outline" size={60} color={cores.placeholder} />
              <Text style={style.emptyText}>Nenhum projeto disponível</Text>
            </View>
          ) : (
            projetos.map((projeto) => (
              <TouchableOpacity
                key={projeto.id}
                style={style.projetoCard}
                onPress={() => navigation.navigate('DetalhesProjeto', { projeto })}
                activeOpacity={0.9}
              >
                {/* HEADER COM FAVORITAR */}
                <View style={style.projetoHeaderRow}>
                  <View style={style.projetoHeader}>
                    <View
                      style={[
                        style.categoriaBadge,
                        { backgroundColor: getCategoriaColor(projeto.categoria) },
                      ]}
                    >
                      <Ionicons name="pricetag" size={12} color="#fff" />
                    </View>
                    <View style={style.projetoInfo}>
                      <Text style={style.projetoTitulo} numberOfLines={2}>
                        {projeto.titulo}
                      </Text>
                      <View style={style.instituicaoInfo}>
                        <Ionicons name="business" size={14} color={cores.placeholder} />
                        <Text style={style.instituicaoNome}>{projeto.instituicaoNome}</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* BOTÃO FAVORITAR */}
                  <BotaoFavoritar
                    projetoId={projeto.id}
                    projeto={projeto} 
                    isFavorito={isFavorito(projeto.id)}
                    onToggle={toggleFavorito}
                    size={24}
                  />
                </View>

                <Text style={style.projetoNecessidade} numberOfLines={2}>
                  <Text style={{ fontFamily: 'Montserrat_600SemiBold' }}>Precisam de: </Text>
                  {projeto.necessidade}
                </Text>

                <Text style={style.projetoDescricao} numberOfLines={3}>
                  {projeto.descricao}
                </Text>

                <View style={style.projetoFooter}>
                  <View style={style.progressoInfo}>
                    <Ionicons name="gift" size={16} color={cores.laranjaEscuro} />
                    <Text style={style.progressoText}>
                      {projeto.doacoesRecebidas || 0} doações
                    </Text>
                  </View>

                  <TouchableOpacity 
                    style={style.doarBtn}
                    onPress={() => navigation.navigate('DetalhesProjeto', { projeto })}
                  >
                    <Text style={style.doarBtnText}>Doar Agora</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: cores.fundoBranco,
  },
  boxTop: {
    alignItems: "center",
    backgroundColor: cores.laranjaEscuro,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  input: {
    ...fontes.montserrat,
    borderRadius: 15,
    backgroundColor: "#f4f4f4",
    width: 350,
    height: 45,
    paddingHorizontal: 20,
  },
  containerHeader: {
    ...fontes.montserrat,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    width: 350,
    height: 70,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  localizacao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    height: 60,
  },
  textoLocalizacao: {
    ...fontes.montserratMedium,
    color: cores.brancoTexto,
  },
  favoritosBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  favoritosBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: cores.verdeEscuro,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: cores.laranjaEscuro,
  },
  favoritosBadgeText: {
    ...fontes.montserratBold,
    color: '#fff',
    fontSize: 10,
  },
  pesquisa: {
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 24,
  },
  ctnCarrossel: {
    marginTop: 5,
    justifyContent: "center",
    alignItems: "center",
    height: 250,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: cores.verdeMuitoClaro,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    resizeMode: "cover",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  dotInactive: { backgroundColor: "#fff" },
  dotActive: { backgroundColor: cores.verdeMuitoClaro },
  
  // Projetos
  cntProjetos: {
    marginVertical: 20,
    width: 350,
    alignSelf: 'center',
  },
  ctnTitulo: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 20,
  },
  tituloProjetos: {
    ...fontes.merriweather,
    fontSize: 21,
    marginLeft: 10,
  },
  loadingText: {
    ...fontes.montserrat,
    textAlign: 'center',
    color: cores.placeholder,
    marginTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    ...fontes.montserratMedium,
    fontSize: 16,
    color: cores.placeholder,
    marginTop: 10,
  },
  projetoCard: {
    backgroundColor: cores.brancoTexto,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projetoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projetoHeader: {
    flexDirection: 'row',
    flex: 1,
  },
  categoriaBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  projetoInfo: {
    flex: 1,
  },
  projetoTitulo: {
    ...fontes.merriweatherBold,
    fontSize: 16,
    color: cores.verdeEscuro,
    marginBottom: 4,
  },
  instituicaoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instituicaoNome: {
    ...fontes.montserrat,
    fontSize: 12,
    color: cores.placeholder,
    marginLeft: 4,
  },
  projetoNecessidade: {
    ...fontes.montserrat,
    fontSize: 13,
    color: cores.laranjaEscuro,
    marginBottom: 8,
  },
  projetoDescricao: {
    ...fontes.montserrat,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  projetoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  progressoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressoText: {
    ...fontes.montserratMedium,
    fontSize: 12,
    color: cores.laranjaEscuro,
    marginLeft: 5,
  },
  doarBtn: {
    flexDirection: 'row',
    backgroundColor: cores.verdeEscuro,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  doarBtnText: {
    ...fontes.montserratBold,
    color: '#fff',
    fontSize: 12,
    marginRight: 5,
  },
});
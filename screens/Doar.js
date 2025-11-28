// screens/Doar.js
import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Text, ActivityIndicator,
  FlatList, TextInput, Platform, Alert, Linking, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { fontes, cores } from '../components/Global';
import { buscarProjetosAtivos } from '../services/projetosService';
import { useFavoritos } from '../hooks/useFavoritos';
import BotaoFavoritar from '../components/BotaoFavoritar';
import FilterModal from '../components/FilterModal';

// Mapa Config
let MapView, Marker, Circle;
if (Platform.OS !== 'web') {
  ({ default: MapView, Marker, Circle } = require('react-native-maps'));
} else {
  MapView = ({ style }) => <View style={style}><Text>Mapas não disponíveis na web</Text></View>;
  Marker = Circle = () => null;
}

// ==========================================================
// 🧩 MARCADOR
// ==========================================================
const ProjetoMarker = ({ projeto, onSelect, getIcon, getColor, abrirGPS }) => {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setTracksViewChanges(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const icon = getIcon(projeto.categoria);
  const color = getColor(projeto.categoria);

  // Função de clique no pino
  const handlePress = () => {
    // Seleciona o projeto para abrir o card flutuante
    onSelect(projeto);
  };

  return (
    <Marker
      coordinate={{ latitude: projeto.lat, longitude: projeto.lng }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksViewChanges}
      onPress={handlePress}
    >
      <View style={[styles.customMarker, { backgroundColor: color }]}>
        <Ionicons name={icon} size={20} color="#fff" />
      </View>
    </Marker>
  );
};

export default function Doar({ navigation }) {
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  const [projetos, setProjetos] = useState([]);
  const [filteredProjetos, setFilteredProjetos] = useState([]);
  const [loadingProjetos, setLoadingProjetos] = useState(true);

  const [viewMode, setViewMode] = useState('lista');
  const [searchText, setSearchText] = useState('');
  const [raioVisual, setRaioVisual] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);

  const { isFavorito, toggleFavorito, totalFavoritos } = useFavoritos();

  useEffect(() => { obtainingLocation(); carregarProjetos(); }, []);
  useEffect(() => { filtrarPorTexto(); }, [searchText]);

  const obtainingLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync(); if (status !== 'granted') { setLoadingLocation(false); return; }
      let location = await Location.getCurrentPositionAsync({}); setUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 });
    } catch (error) { console.error(error); } finally { setLoadingLocation(false); }
  };

  const carregarProjetos = async () => {
    try {
      setLoadingProjetos(true);
      const data = await buscarProjetosAtivos();

      const fmt = data.map((p, index) => {
        // Lógica de coordenadas
        let lat = p.endereco?.latitude || p.latitude;
        let lng = p.endereco?.longitude || p.longitude;

        // TRUQUE: Adiciona um deslocamento minúsculo aleatório para evitar sobreposição exata
        // Se dois projetos tiverem o mesmo endereço, eles não ficarão um em cima do outro
        if (lat && lng) {
          lat = parseFloat(lat) + (Math.random() - 0.5) * 0.0002;
          lng = parseFloat(lng) + (Math.random() - 0.5) * 0.0002;
        }

        return {
          ...p,
          lat,
          lng,
          materiais: p.materiais || [],
          tagsExtras: p.tagsExtras || [],
          categoria: p.categoria || 'outros'
        };
      });

      setProjetos(fmt);
      setFilteredProjetos(fmt);
    } catch (e) { Alert.alert('Erro', 'Erro ao carregar'); } finally { setLoadingProjetos(false); }
  };

  const filtrarPorTexto = () => {
    if (!searchText.trim() && raioVisual === 0) return; const s = searchText.toLowerCase(); setFilteredProjetos(projetos.filter(p => p.titulo?.toLowerCase().includes(s) || p.materiais.some(m => m.includes(s)) || p.tagsExtras.some(t => t.includes(s)) || p.instituicaoNome?.toLowerCase().includes(s) || p.categoria?.toLowerCase().includes(s)));
  };

  const aplicarFiltros = (filters) => {
    let res = [...projetos]; if (filters.categoria) res = res.filter(p => p.categoria === filters.categoria); if (filters.modalidade) res = res.filter(p => p.modalidade === filters.modalidade); if (filters.materiais?.length) res = res.filter(p => p.materiais.some(m => filters.materiais.includes(m)));
    if (filters.distancia && userLocation) { setRaioVisual(filters.distancia); setViewMode('mapa'); res = res.filter(p => p.lat && p.lng && calcularDistancia(userLocation.latitude, userLocation.longitude, p.lat, p.lng) <= filters.distancia); } else { setRaioVisual(0); }
    setFilteredProjetos(res); setShowFilters(false);
  };

  const calcularDistancia = (lat1, lon1, lat2, lon2) => { const R = 6371; const dLat = (lat2 - lat1) * (Math.PI / 180); const dLon = (lon2 - lon1) * (Math.PI / 180); const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))); };

  // ===============================================
  // 🗺️ GPS INTELIGENTE (Prioriza Endereço Escrito)
  // ===============================================
  const abrirNoMaps = (projeto) => {
    let query = '';

    // 1. Prioridade: Endereço completo (Rua, Numero, Cidade)
    if (projeto.endereco && projeto.endereco.rua) {
      const end = projeto.endereco;
      query = `${end.rua}, ${end.numero || ''}, ${end.bairro || ''}, ${end.cidade || ''} - ${end.estado || ''}`;
    }
    // 2. Fallback: Coordenadas (Se não tiver endereço cadastrado)
    else if (projeto.lat && projeto.lng) {
      query = `${projeto.lat},${projeto.lng}`;
    }

    if (!query) return;

    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(query)}`,
      android: `geo:0,0?q=${encodeURIComponent(query)}`
    });
    Linking.openURL(url);
  };

  const getCategoriaIcon = (c) => { const i = { 'direitos-humanos': 'people', 'combate-a-fome': 'restaurant', 'educacao': 'school', 'saude': 'medical', 'crianca-e-adolescentes': 'happy', 'defesa-dos-animais': 'paw', 'meio-ambiente': 'leaf', 'melhor-idade': 'heart' }; return i[c] || 'grid'; };
  const getCategoriaColor = (c) => { const co = { 'direitos-humanos': cores.direitosh || '#E91E63', 'combate-a-fome': cores.fome || '#FF5722', 'educacao': cores.educacao || '#2196F3', 'saude': cores.saude || '#4CAF50', 'crianca-e-adolescentes': '#9C27B0', 'defesa-dos-animais': '#795548', 'meio-ambiente': '#8BC34A', 'melhor-idade': '#FF9800' }; return co[c] || cores.verdeEscuro; };

  // CARD RENDERER
  const renderCardContent = (item, isMapOverlay = false) => {
    const categoriaIcon = getCategoriaIcon(item.categoria);
    const categoriaColor = getCategoriaColor(item.categoria);

    let distanciaTexto = null;
    if (userLocation && item.lat && item.lng) {
      const km = calcularDistancia(userLocation.latitude, userLocation.longitude, item.lat, item.lng);
      distanciaTexto = km < 1 ? `${(km * 1000).toFixed(0)}m` : `${km.toFixed(1)}km`;
    }
    const materiaisExibidos = item.materiais ? item.materiais.slice(0, 2) : [];
    const materiaisRestantes = item.materiais ? item.materiais.length - 2 : 0;

    return (
      <View style={styles.cardInternalContainer}>
        <View style={[styles.iconContainer, { backgroundColor: categoriaColor }]}>
          <Ionicons name={categoriaIcon} size={32} color="#FFF" />
          <Text style={styles.iconCategoriaText}>{item.categoria ? item.categoria.split('-')[0] : 'Geral'}</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flex: 1, paddingRight: 5 }}>
              <Text style={styles.cardTitulo} numberOfLines={1}>{item.titulo}</Text>
              <Text style={styles.doadorNome}>{item.instituicaoNome || 'Instituição'}</Text>
            </View>
            {!isMapOverlay && <BotaoFavoritar projetoId={item.id} isFavorito={isFavorito(item.id)} onToggle={toggleFavorito} projeto={item} size={22} />}
            {isMapOverlay && (<TouchableOpacity onPress={() => setSelectedProject(null)} style={{ padding: 5 }}><Ionicons name="close" size={20} color="#999" /></TouchableOpacity>)}
          </View>

          <View style={styles.tagsContainer}>
            {distanciaTexto && (<View style={styles.tagChip}><Ionicons name="location-sharp" size={10} color="#666" /><Text style={styles.tagText}>{distanciaTexto}</Text></View>)}
            {item.modalidade && (<View style={styles.tagChip}><Ionicons name={item.modalidade === 'retirar_em_casa' ? "car" : "cube"} size={10} color="#666" /><Text style={styles.tagText}>{item.modalidade === 'retirar_em_casa' ? 'Retira' : 'Coleta'}</Text></View>)}
            {materiaisExibidos.map((mat, index) => (<View key={index} style={[styles.tagChip, { backgroundColor: '#e3f2fd' }]}><Text style={[styles.tagText, { color: '#1565c0' }]}>{mat.charAt(0).toUpperCase() + mat.slice(1)}</Text></View>))}
            {item.tagsExtras && item.tagsExtras.length > 0 && (<View style={[styles.tagChip, { backgroundColor: '#fff3e0' }]}><Text style={[styles.tagText, { color: '#e65100' }]}>{item.tagsExtras[0]}</Text></View>)}
          </View>

          <Text style={styles.cardDescricao} numberOfLines={2}>{item.descricao || 'Sem descrição.'}</Text>

          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={[styles.miniBtnOutline, { borderColor: categoriaColor, marginRight: 8 }]}
              onPress={() => abrirNoMaps(item)} // Usa a nova lógica de endereço
            >
              <Ionicons name="map" size={12} color={categoriaColor} />
              <Text style={[styles.miniBtnText, { color: categoriaColor }]}>GPS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.miniDoarBtn, { backgroundColor: categoriaColor }]}
              onPress={() => navigation.navigate('DetalhesProjeto', { projeto: item })}
            >
              <Text style={styles.miniDoarBtnText}>{isMapOverlay ? "Mais Detalhes" : "Acessar"}</Text>
              <Ionicons name="arrow-forward" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderProjetoCard = ({ item }) => (
    <TouchableOpacity style={styles.projetoCard} onPress={() => navigation.navigate('DetalhesProjeto', { projeto: item })} activeOpacity={0.95}>
      {renderCardContent(item, false)}
    </TouchableOpacity>
  );

  if (loadingLocation || loadingProjetos) return (<SafeAreaView style={styles.container}><View style={styles.loadingContainer}><ActivityIndicator size="large" color={cores.verdeEscuro} /><Text style={styles.loadingText}>Carregando...</Text></View></SafeAreaView>);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={cores.placeholder} />
          <TextInput style={styles.searchInput} placeholder="Buscar..." placeholderTextColor={cores.placeholder} value={searchText} onChangeText={setSearchText} />
          {searchText.length > 0 && (<TouchableOpacity onPress={() => setSearchText('')}><Ionicons name="close-circle" size={20} color={cores.placeholder} /></TouchableOpacity>)}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.favoritosBtn} onPress={() => navigation.navigate('Favoritos')}><Ionicons name="heart" size={22} color={cores.laranjaEscuro} />{totalFavoritos > 0 && (<View style={styles.favoritosBadge}><Text style={styles.favoritosBadgeText}>{totalFavoritos > 9 ? '9+' : totalFavoritos}</Text></View>)}</TouchableOpacity>
          <TouchableOpacity style={styles.toggleBtn} onPress={() => setViewMode(viewMode === 'mapa' ? 'lista' : 'mapa')}><Ionicons name={viewMode === 'mapa' ? 'list' : 'map'} size={22} color={cores.verdeEscuro} /></TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilters(true)}><Ionicons name="filter" size={22} color={cores.brancoTexto} /></TouchableOpacity>
        </View>
      </View>

      {searchText.length > 0 && (<View style={styles.resultCounter}><Text style={styles.resultCounterText}>{filteredProjetos.length} resultado(s)</Text></View>)}

      {viewMode === 'mapa' && userLocation ? (
        <View style={{ flex: 1 }}>
          <MapView style={styles.map} initialRegion={userLocation} showsUserLocation={true} onPress={() => setSelectedProject(null)}>
            {raioVisual > 0 && (<Circle key={(userLocation.latitude + raioVisual).toString()} center={userLocation} radius={raioVisual * 1000} strokeWidth={2} strokeColor={cores.verdeEscuro} fillColor="rgba(46, 125, 50, 0.15)" />)}
            {filteredProjetos.map((projeto) => {
              if (!projeto.lat || !projeto.lng) return null;
              return (
                <ProjetoMarker key={projeto.id} projeto={projeto} onSelect={setSelectedProject} getIcon={getCategoriaIcon} getColor={getCategoriaColor} />
              );
            })}
          </MapView>
          {selectedProject && (<View style={styles.floatingCardContainer}>{renderCardContent(selectedProject, true)}</View>)}
        </View>
      ) : (
        <FlatList data={filteredProjetos} renderItem={renderProjetoCard} keyExtractor={(item) => item.id} contentContainerStyle={styles.lista} ListEmptyComponent={<View style={styles.emptyState}><Ionicons name="search-outline" size={60} color={cores.placeholder} /><Text style={styles.emptyText}>Nenhum projeto encontrado</Text></View>} />
      )}
      <FilterModal visible={showFilters} onClose={() => setShowFilters(false)} onApply={aplicarFiltros} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundoBranco },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...fontes.montserrat, fontSize: 14, marginTop: 10, color: '#666' },
  header: { backgroundColor: cores.brancoTexto, paddingHorizontal: 15, paddingVertical: 10, elevation: 3 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 25, paddingHorizontal: 15, height: 45, marginBottom: 10 },
  searchInput: { ...fontes.montserrat, flex: 1, marginLeft: 10, fontSize: 14, color: '#333' },
  headerActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  favoritosBtn: { backgroundColor: cores.fundoBranco, width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  favoritosBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: cores.laranjaEscuro, borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  favoritosBadgeText: { ...fontes.montserratBold, color: '#fff', fontSize: 9 },
  toggleBtn: { backgroundColor: cores.fundoBranco, width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  filterBtn: { flex: 1, backgroundColor: cores.verdeEscuro, height: 45, borderRadius: 25, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  resultCounter: { backgroundColor: cores.laranjaClaro, paddingVertical: 8, paddingHorizontal: 15, alignItems: 'center' },
  resultCounterText: { ...fontes.montserratMedium, fontSize: 12, color: cores.laranjaEscuro },
  map: { flex: 1 },
  customMarker: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 2 } },
  lista: { padding: 15 },
  projetoCard: { backgroundColor: cores.brancoTexto, borderRadius: 15, marginBottom: 15, overflow: 'hidden', elevation: 3, minHeight: 130 },
  cardInternalContainer: { flexDirection: 'row', width: '100%', minHeight: 130 },
  floatingCardContainer: { position: 'absolute', bottom: 20, left: 15, right: 15, backgroundColor: '#fff', borderRadius: 15, elevation: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6, overflow: 'hidden', minHeight: 130 },
  iconContainer: { width: 85, justifyContent: 'center', alignItems: 'center', padding: 5 },
  iconCategoriaText: { color: '#fff', fontSize: 9, fontWeight: 'bold', marginTop: 5, textAlign: 'center', textTransform: 'uppercase' },
  cardContent: { flex: 1, padding: 10, justifyContent: 'space-between' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitulo: { ...fontes.merriweatherBold, fontSize: 15, color: cores.verdeEscuro, marginBottom: 2 },
  doadorNome: { ...fontes.montserrat, fontSize: 11, color: cores.placeholder },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4, marginBottom: 4 },
  tagChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, gap: 3 },
  tagText: { fontSize: 10, color: '#555', fontWeight: '600', fontFamily: 'Montserrat_500Medium' },
  cardDescricao: { ...fontes.montserrat, fontSize: 11, color: '#666', marginBottom: 8, marginTop: 2, lineHeight: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 'auto' },
  miniDoarBtn: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, alignItems: 'center', gap: 4 },
  miniDoarBtnText: { ...fontes.montserratBold, color: '#fff', fontSize: 10 },
  miniBtnOutline: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, alignItems: 'center', gap: 4, borderWidth: 1, backgroundColor: 'transparent' },
  miniBtnText: { ...fontes.montserratBold, fontSize: 10 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { ...fontes.montserrat, fontSize: 16, color: cores.placeholder, marginTop: 15 },
});
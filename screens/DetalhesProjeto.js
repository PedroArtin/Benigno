// screens/DetalhesProjeto.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator,
  Linking, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../components/Global';
import BotaoFavoritar from '../components/BotaoFavoritar';
import FormularioDoacao from '../screens/FormularioDoacao';
import { useFavoritos } from '../hooks/useFavoritos';

export default function DetalhesProjeto({ route, navigation }) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [projeto, setProjeto] = useState(null);
  const { isFavorito, toggleFavorito } = useFavoritos();

  useEffect(() => {
    if (route.params?.projeto) {
      setProjeto(route.params.projeto);
    }
  }, [route.params]);

  const handleQueroAjudar = () => {
    if (!projeto || !projeto.id) return;
    setMostrarFormulario(true);
  };

  const handleDoacaoSucesso = () => {
    setMostrarFormulario(false);
    navigation.goBack();
  };

  // FUNÇÃO GPS ATUALIZADA (PRIORIZA ENDEREÇO)
  const abrirNoMaps = () => {
    if (!projeto) return;
    
    let query = '';

    // 1. Tenta usar o endereço completo (Mais preciso)
    if (projeto.endereco && typeof projeto.endereco === 'object' && projeto.endereco.rua) {
        const end = projeto.endereco;
        query = `${end.rua}, ${end.numero || ''}, ${end.bairro || ''}, ${end.cidade || ''} - ${end.estado || ''}`;
    } 
    // 2. Tenta usar texto antigo
    else if (typeof projeto.endereco === 'string') {
        query = projeto.endereco;
    }
    // 3. Fallback: lat/long
    else if (projeto.lat && projeto.lng) {
        query = `${projeto.lat},${projeto.lng}`;
    }
    // 4. Fallback: formato do banco antigo
    else if (projeto.latitude && projeto.longitude) {
        query = `${projeto.latitude},${projeto.longitude}`;
    }

    if (!query) {
        alert("Localização não disponível.");
        return;
    }

    const url = Platform.select({
        ios: `maps:0,0?q=${encodeURIComponent(query)}`,
        android: `geo:0,0?q=${encodeURIComponent(query)}`
    });
    
    Linking.openURL(url);
  };

  const formatarEndereco = (end) => {
    if (!end) return 'Endereço não informado';
    if (typeof end === 'object') {
        return `${end.rua}, ${end.numero} - ${end.bairro || ''}\n${end.cidade} - ${end.estado}`;
    }
    return end;
  };

  const getCategoriaIcon = (c) => { const i={'direitos-humanos':'people','combate-a-fome':'restaurant','educacao':'school','saude':'medical','crianca-e-adolescentes':'happy','defesa-dos-animais':'paw','meio-ambiente':'leaf','melhor-idade':'heart'}; return i[c]||'heart-outline'; };
  const getCategoriaColor = (c) => { const co={'direitos-humanos':cores.direitosh||'#E91E63','combate-a-fome':cores.fome||'#FF5722','educacao':cores.educacao||'#2196F3','saude':cores.saude||'#4CAF50','crianca-e-adolescentes':'#9C27B0','defesa-dos-animais':'#795548','meio-ambiente':'#8BC34A','melhor-idade':'#FF9800'}; return co[c]||cores.verdeEscuro; };

  if (!projeto) return (<SafeAreaView style={styles.container}><ActivityIndicator size="large" color={cores.verdeEscuro} /></SafeAreaView>);

  const categoriaIcon = getCategoriaIcon(projeto.categoria);
  const categoriaColor = getCategoriaColor(projeto.categoria);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={cores.verdeEscuro} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Projeto</Text>
        <BotaoFavoritar projetoId={projeto.id} isFavorito={isFavorito(projeto.id)} onToggle={toggleFavorito} projeto={projeto} size={24} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.categoryBanner, { backgroundColor: categoriaColor }]}>
          <Ionicons name={categoriaIcon} size={80} color="#FFF" />
        </View>

        <View style={styles.content}>
          <View style={styles.categoryBadge}><Text style={styles.categoryBadgeText}>{projeto.categoria?.toUpperCase() || 'OUTROS'}</Text></View>
          <Text style={styles.title}>{projeto.titulo}</Text>

          <View style={styles.institutionCard}>
            <View style={styles.institutionIcon}><Ionicons name="business" size={24} color={cores.verdeEscuro} /></View>
            <View style={styles.institutionInfo}><Text style={styles.institutionLabel}>Instituição</Text><Text style={styles.institutionName}>{projeto.instituicaoNome || 'Instituição'}</Text></View>
          </View>

          <View style={styles.tagsRow}>
            {projeto.modalidade && (
                <View style={styles.tagBox}><Ionicons name={projeto.modalidade === 'retirar_em_casa' ? 'car' : 'location'} size={18} color={cores.verdeEscuro} /><Text style={styles.tagText}>{projeto.modalidade === 'retirar_em_casa' ? 'Retiram em Casa' : 'Ponto de Coleta'}</Text></View>
            )}
          </View>

          {projeto.materiais && projeto.materiais.length > 0 && (
             <View style={styles.section}>
                <Text style={styles.subHeader}>Materiais Aceitos:</Text>
                <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5}}>
                    {projeto.materiais.map((mat, i) => (<View key={i} style={{backgroundColor: '#e3f2fd', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15}}><Text style={{color: '#1565c0', fontSize: 12, fontWeight: 'bold'}}>{mat.toUpperCase()}</Text></View>))}
                    {projeto.tagsExtras && projeto.tagsExtras.map((tag, i) => (<View key={`extra-${i}`} style={{backgroundColor: '#fff3e0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15}}><Text style={{color: '#e65100', fontSize: 12, fontWeight: 'bold'}}>{tag.toUpperCase()}</Text></View>))}
                </View>
             </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}><Ionicons name="document-text" size={20} color={cores.verdeEscuro} /><Text style={styles.sectionTitle}>Sobre o Projeto</Text></View>
            <Text style={styles.description}>{projeto.descricao || 'Sem descrição disponível.'}</Text>
          </View>

          {projeto.necessidade && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}><Ionicons name="list" size={20} color={cores.verdeEscuro} /><Text style={styles.sectionTitle}>Detalhes do que precisamos</Text></View>
              <Text style={styles.description}>{projeto.necessidade}</Text>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}><Ionicons name="call" size={20} color={cores.verdeEscuro} /><Text style={styles.sectionTitle}>Contato e Localização</Text></View>
            {projeto.telefone && (<View style={styles.contactItem}><Ionicons name="call-outline" size={18} color="#666" /><Text style={styles.contactText}>{projeto.telefone}</Text></View>)}
            {projeto.email && (<View style={styles.contactItem}><Ionicons name="mail-outline" size={18} color="#666" /><Text style={styles.contactText}>{projeto.email}</Text></View>)}
            
            {projeto.endereco && (
              <View style={styles.locationContainer}>
                  <View style={[styles.contactItem, {marginBottom: 0, flex: 1}]}>
                    <Ionicons name="location-outline" size={18} color="#666" />
                    <Text style={styles.contactText}>{formatarEndereco(projeto.endereco)}</Text>
                  </View>
                  <TouchableOpacity style={styles.mapsButton} onPress={abrirNoMaps}>
                      <Ionicons name="map" size={20} color="#fff" />
                      <Text style={styles.mapsButtonText}>Abrir GPS</Text>
                  </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.helpButton} onPress={handleQueroAjudar}>
          <Ionicons name="heart" size={24} color="#fff" />
          <Text style={styles.helpButtonText}>Quero Ajudar</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={mostrarFormulario} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setMostrarFormulario(false)}><Ionicons name="close" size={28} color={cores.verdeEscuro} /></TouchableOpacity>
            <Text style={styles.modalTitle}>Fazer Doação</Text>
            <View style={{ width: 28 }} />
          </View>
          <FormularioDoacao projeto={projeto} onSuccess={handleDoacaoSucesso} onCancel={() => setMostrarFormulario(false)} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundoBranco },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...fontes.montserrat, fontSize: 14, marginTop: 10, color: '#666' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: cores.brancoTexto, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  backButton: { padding: 5 },
  headerTitle: { ...fontes.montserratBold, fontSize: 16, flex: 1, textAlign: 'center' },
  categoryBanner: { height: 180, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: cores.laranjaClaro, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginBottom: 15 },
  categoryBadgeText: { ...fontes.montserratBold, fontSize: 12, color: cores.laranjaEscuro },
  title: { ...fontes.merriweatherBold, fontSize: 24, color: cores.verdeEscuro, marginBottom: 20, lineHeight: 32 },
  institutionCard: { flexDirection: 'row', backgroundColor: cores.verdeClaro, borderRadius: 15, padding: 15, marginBottom: 20 },
  institutionIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: cores.brancoTexto, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  institutionInfo: { flex: 1, justifyContent: 'center' },
  institutionLabel: { ...fontes.montserrat, fontSize: 12, color: '#666', marginBottom: 4 },
  institutionName: { ...fontes.montserratBold, fontSize: 16, color: cores.verdeEscuro },
  tagsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  tagBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f5e9', padding: 10, borderRadius: 8, gap: 8 },
  tagText: { ...fontes.montserratBold, fontSize: 12, color: cores.verdeEscuro },
  subHeader: { ...fontes.montserratBold, fontSize: 14, color: '#666', marginBottom: 5 },
  section: { marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionTitle: { ...fontes.montserratBold, fontSize: 16, color: cores.verdeEscuro },
  description: { ...fontes.montserrat, fontSize: 15, color: '#333', lineHeight: 24 },
  contactItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12, paddingVertical: 4 },
  contactText: { ...fontes.montserrat, fontSize: 14, color: '#666', flex: 1 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  mapsButton: { backgroundColor: cores.verdeEscuro, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 5 },
  mapsButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12, ...fontes.montserrat },
  footer: { padding: 20, paddingBottom: 10, backgroundColor: cores.brancoTexto, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  helpButton: { backgroundColor: cores.verdeEscuro, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 12, gap: 10 },
  helpButtonText: { ...fontes.montserratBold, fontSize: 16, color: '#fff' },
  modalContainer: { flex: 1, backgroundColor: cores.fundoBranco },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: cores.brancoTexto, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalTitle: { ...fontes.montserratBold, fontSize: 18, color: cores.verdeEscuro },
});
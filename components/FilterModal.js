import React, { useState } from 'react';
import { fontes, cores } from "../components/Global";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FilterModal = ({ visible, onClose, onApply }) => {
  
  // --- DADOS ---
  const razoesSociais = [
    { label: 'Direitos Humanos', value: 'direitos-humanos' },
    { label: 'Saúde', value: 'saude' },
    { label: 'Meio Ambiente', value: 'meio-ambiente' },
    { label: 'Fome', value: 'combate-a-fome' },
    { label: 'Crianças e Adolescentes', value: 'crianca-e-adolescentes' },
    { label: 'Melhor Idade', value: 'melhor-idade' },
    { label: 'Educação', value: 'educacao' },
    { label: 'Animais', value: 'defesa-dos-animais' },
  ];

  // NOVAS DISTÂNCIAS ADICIONADAS AQUI
  const distancias = [
    { label: 'Até 2.5km', value: 2.5 },
    { label: 'Até 5km', value: 5 },
    { label: 'Até 10km', value: 10 },
    { label: 'Até 25km', value: 25 },
    { label: 'Mais de 25km', value: 100 }, // Valor alto para pegar tudo num raio grande
  ];

  const materiais = [
    { label: 'Alimentos', value: 'alimentos' },
    { label: 'Roupas', value: 'roupas' },
    { label: 'Brinquedos', value: 'brinquedos' },
    { label: 'Higiene', value: 'higiene' },
    { label: 'Eletrodomésticos', value: 'eletrodomesticos' },
    { label: 'Eletrônicos', value: 'eletronicos' },
    { label: 'Móveis', value: 'moveis' },
    { label: 'Outros', value: 'outros' },
  ];

  const modalidades = [
    { label: 'Retirar em Casa', value: 'retirar_em_casa' },
    { label: 'Levar ao Ponto de Coleta', value: 'ponto_coleta' },
  ];

  // --- ESTADOS ---
  const [selectedRazao, setSelectedRazao] = useState(null);
  const [selectedDistancia, setSelectedDistancia] = useState(null);
  const [selectedModalidade, setSelectedModalidade] = useState(null);
  const [selectedMateriais, setSelectedMateriais] = useState([]);

  // --- LÓGICA ---
  const toggleSingle = (value, current, setFunction) => {
    if (current === value) {
      setFunction(null); 
    } else {
      setFunction(value); 
    }
  };

  const toggleMulti = (value) => {
    if (selectedMateriais.includes(value)) {
      setSelectedMateriais(selectedMateriais.filter(i => i !== value));
    } else {
      setSelectedMateriais([...selectedMateriais, value]);
    }
  };

  const applyFilters = () => {
    const filters = {
      categoria: selectedRazao,
      distancia: selectedDistancia,
      modalidade: selectedModalidade,
      materiais: selectedMateriais,
    };
    onApply(filters);
    onClose();
  };

  const clearFilters = () => {
    setSelectedRazao(null);
    setSelectedDistancia(null);
    setSelectedModalidade(null);
    setSelectedMateriais([]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.cleanBtnText}>Limpar</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Filtros</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            
            {/* RAZÃO SOCIAL */}
            <View style={styles.boxTitulos}>
                <Ionicons name="globe-outline" size={22} color={cores.laranjaEscuro}/>
                <Text style={styles.sectionTitle}>Razão Social</Text>
            </View>
            <View style={styles.optionsContainer}>
              {razoesSociais.map(item => (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.option, selectedRazao === item.value && styles.optionSelected]}
                  onPress={() => toggleSingle(item.value, selectedRazao, setSelectedRazao)}
                >
                  <Text style={[styles.optionText, selectedRazao === item.value && styles.optionTextSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* DISTÂNCIA */}
            <View style={styles.boxTitulos}>
                 <Ionicons name="map-outline" size={22} color={cores.laranjaEscuro}/>
                 <Text style={styles.sectionTitle}>Distância</Text>
            </View>
            <View style={styles.optionsContainer}>
              {distancias.map(item => (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.option, selectedDistancia === item.value && styles.optionSelected]}
                  onPress={() => toggleSingle(item.value, selectedDistancia, setSelectedDistancia)}
                >
                  <Text style={[styles.optionText, selectedDistancia === item.value && styles.optionTextSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* MATERIAIS */}
            <View style={styles.boxTitulos}>
                <Ionicons name="shirt-outline" size={22} color={cores.laranjaEscuro}/>
                <Text style={styles.sectionTitle}>Materiais Aceitos</Text>
            </View>
            <View style={styles.optionsContainer}>
              {materiais.map(item => (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.option, selectedMateriais.includes(item.value) && styles.optionSelected]}
                  onPress={() => toggleMulti(item.value)}
                >
                  <Text style={[styles.optionText, selectedMateriais.includes(item.value) && styles.optionTextSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* MODALIDADE */}
            <View style={styles.boxTitulos}>
                <Ionicons name="car-outline" size={23} color={cores.laranjaEscuro}/>
                <Text style={styles.sectionTitle}>Modalidade da Entrega</Text>
            </View>
            <View style={styles.optionsContainer}>
              {modalidades.map(item => (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.option, selectedModalidade === item.value && styles.optionSelected]}
                  onPress={() => toggleSingle(item.value, selectedModalidade, setSelectedModalidade)}
                >
                  <Text style={[styles.optionText, selectedModalidade === item.value && styles.optionTextSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
            <Text style={styles.applyBtnText}>Aplicar filtros</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', maxHeight: '90%', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 10 },
  headerTitle: { ...fontes.merriweatherBold, fontSize: 18, color: cores.verdeEscuro },
  cleanBtnText: { ...fontes.montserratMedium, fontSize: 14, color: '#666' },
  scroll: { marginBottom: 15 },
  boxTitulos:{ flexDirection: "row", alignItems: "center", marginTop: 15, marginBottom: 8 },
  sectionTitle: { ...fontes.montserratBold, fontSize: 16, marginLeft: 8, color: '#333' },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5 },
  option: { borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, margin: 4, backgroundColor: '#fff' },
  optionSelected: { backgroundColor: cores.laranjaEscuro, borderColor: cores.laranjaEscuro },
  optionText: { ...fontes.montserratMedium, fontSize: 13, color: '#666' },
  optionTextSelected: { color: '#fff', fontWeight: 'bold' },
  applyBtn: { backgroundColor: cores.verdeEscuro, paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 5 },
  applyBtnText: { ...fontes.montserratBold, color: '#fff', fontSize: 16 },
});

export default FilterModal;
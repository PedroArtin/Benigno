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
  const razoesSociais = ['Direitos Humanos', 'Saúde', 'Meio Ambiente', 'Fome', 'Crianças e Adolescentes', 'Melhor Idade', 'Educação', 'Animais'];
  const distancias = ['Até 5km', 'Até 10km', 'Até 20km', 'Mais de 20km'];
  const materiais = ['Alimentos', 'Roupas', 'Brinquedos', 'Higiene', 'Eletrodomésticos', 'Eletrônicos', 'Móveis'];
  const modalidades = ['Retirar em Casa', 'Levar ao Ponto de Coleta'];

  const [selectedRazoes, setSelectedRazoes] = useState([]);
  const [selectedDistancia, setSelectedDistancia] = useState([]);
  const [selectedMateriais, setSelectedMateriais] = useState([]);
  const [selectedModalidades, setSelectedModalidades] = useState([]);

  const toggleSelection = (item, selected, setSelected) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const applyFilters = () => {
    const filters = {
      razoes: selectedRazoes,
      distancia: selectedDistancia,
      materiais: selectedMateriais,
      modalidades: selectedModalidades,
    };
    onApply(filters);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filtros</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll}>
            <View style={styles.boxTitulos}>
                <Ionicons name="globe-outline" size={22} color={cores.laranjaEscuro}/>
                <Text style={styles.sectionTitle}>
                    Razão Social</Text>
            </View>
            <View style={styles.optionsContainer}>
              {razoesSociais.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.option,
                    selectedRazoes.includes(item) && styles.optionSelected,
                  ]}
                  onPress={() =>
                    toggleSelection(item, selectedRazoes, setSelectedRazoes)
                  }>
                  <Text
                    style={[
                      styles.optionText,
                      selectedRazoes.includes(item) &&
                        styles.optionTextSelected,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

              <View style={styles.boxTitulos}>
                 <Ionicons name="map-outline" size={22} color={cores.laranjaEscuro}/>
                 <Text style={styles.sectionTitle}>
                    Distância
                </Text>
              </View>
           
            <View style={styles.optionsContainer}>
              {distancias.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.option,
                    selectedDistancia.includes(item) && styles.optionSelected,
                  ]}
                  onPress={() =>
                    toggleSelection(item, selectedDistancia, setSelectedDistancia)
                  }>
                  <Text
                    style={[
                      styles.optionText,
                      selectedDistancia.includes(item) &&
                        styles.optionTextSelected,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

              <View style={styles.boxTitulos}>
                <Ionicons name="shirt-outline" size={22} color={cores.laranjaEscuro}/>
                <Text style={styles.sectionTitle}>
                Materiais Aceitos</Text>
              </View>
            
            <View style={styles.optionsContainer}>
              {materiais.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.option,
                    selectedMateriais.includes(item) && styles.optionSelected,
                  ]}
                  onPress={() =>
                    toggleSelection(item, selectedMateriais, setSelectedMateriais)
                  }>
                  <Text
                    style={[
                      styles.optionText,
                      selectedMateriais.includes(item) &&
                        styles.optionTextSelected,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

              <View style={styles.boxTitulos}>
                <Ionicons name="car-outline" size={23} color={cores.laranjaEscuro}/>
                <Text style={styles.sectionTitle}>
                Modalidade da Entrega</Text>
              </View>
            
            <View style={styles.optionsContainer}>
              {modalidades.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.option,
                    selectedModalidades.includes(item) && styles.optionSelected,
                  ]}
                  onPress={() =>
                    toggleSelection(item, selectedModalidades, setSelectedModalidades)
                  }>
                  <Text
                    style={[
                      styles.optionText,
                      selectedModalidades.includes(item) &&
                        styles.optionTextSelected,
                    ]}>
                    {item}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  headerTitle: {
    ...fontes.merriweatherBold,
    fontSize: 18,
  },
  closeBtn: {
    fontSize: 22,
    paddingHorizontal: 10,
  },
  scroll: {
    marginBottom: 15,
  },
  boxTitulos:{
    flexDirection: "row",
    marginLeft: 10,
    alignItems: "center",
  },
  sectionTitle: {
    ...fontes.montserratMedium,
    fontWeight: '600',
    marginVertical: 10,
    marginLeft: 10,
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  option: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  optionSelected: {
    backgroundColor: cores.laranjaEscuro,
    borderColor: cores.laranjaEscuro,
  },
  optionText: {
    ...fontes.montserratMedium,
    fontSize: 12,
    color: '#333',
  },
  optionTextSelected: {
    color: '#fff',
  },
  applyBtn: {
    backgroundColor: cores.verdeEscuro,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  applyBtnText: {
    ...fontes.montserratBold,
    color: '#fff',
    fontSize: 16,
  },
});

export default FilterModal;
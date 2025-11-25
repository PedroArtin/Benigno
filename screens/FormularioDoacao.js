// components/FormularioDoacao.js - CORRIGIDO
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fontes, cores } from '../components/Global';
import { salvarDoacao } from '../services/doacoesService';
import { incrementarDoacoes } from '../authService';
import { salvarAvaliacao } from '../services/avaliacoesService';
import { auth } from '../firebase/firebaseconfig';

export default function FormularioDoacao({ projeto, onSuccess, onCancel }) {
  const [tipoEntrega, setTipoEntrega] = useState('entrega'); // 'entrega' ou 'coleta'
  const [itens, setItens] = useState([{ categoria: '', quantidade: '', descricao: '' }]);
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalAvaliacao, setModalAvaliacao] = useState(false);
  const [estrelasSelecionadas, setEstrelasSelecionadas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [doacaoId, setDoacaoId] = useState(null);

  const categorias = [
    { value: 'alimentos', label: 'Alimentos' },
    { value: 'roupas', label: 'Roupas' },
    { value: 'brinquedos', label: 'Brinquedos' },
    { value: 'moveis', label: 'Móveis' },
    { value: 'eletronicos', label: 'Eletrônicos' },
    { value: 'livros', label: 'Livros' },
    { value: 'outros', label: 'Outros' },
  ];

  const adicionarItem = () => {
    setItens([...itens, { categoria: '', quantidade: '', descricao: '' }]);
  };

  const removerItem = (index) => {
    const novosItens = itens.filter((_, i) => i !== index);
    setItens(novosItens.length > 0 ? novosItens : [{ categoria: '', quantidade: '', descricao: '' }]);
  };

  const atualizarItem = (index, campo, valor) => {
    const novosItens = [...itens];
    novosItens[index][campo] = valor;
    setItens(novosItens);
  };

  const validarFormulario = () => {
    // Verificar se há pelo menos 1 item válido
    const itensValidos = itens.filter(
      (item) => item.categoria && item.quantidade
    );

    if (itensValidos.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos um item com categoria e quantidade');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    console.log('🟢 handleSubmit INICIADO');
    console.log('🟢 projeto recebido:', projeto);
    
    if (!projeto) {
      console.error('❌ Projeto está undefined no handleSubmit!');
      Alert.alert('Erro', 'Dados do projeto não disponíveis');
      return;
    }
    
    if (!validarFormulario()) return;

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para fazer uma doação');
      return;
    }

    try {
      setLoading(true);

      // Filtrar itens válidos
      const itensValidos = itens.filter(
        (item) => item.categoria && item.quantidade
      );

      // Preparar dados da doação
      const dadosDoacao = {
        doadorId: user.uid,
        instituicaoId: projeto.instituicaoId,
        projetoId: projeto.id,
        projetoTitulo: projeto.titulo,
        tipoEntrega: tipoEntrega,
        itens: itensValidos.map(item => ({
          categoria: item.categoria,
          quantidade: parseInt(item.quantidade) || 1,
          descricao: item.descricao || '',
        })),
        observacoes: observacoes.trim(),
        status: tipoEntrega === 'entrega' ? 'aguardando_confirmacao' : 'pendente',
      };

      console.log('📤 Dados da doação preparados:');
      console.log('  - doadorId:', dadosDoacao.doadorId);
      console.log('  - instituicaoId:', dadosDoacao.instituicaoId);
      console.log('  - projetoId:', dadosDoacao.projetoId);
      console.log('  - status:', dadosDoacao.status);

      const resultado = await salvarDoacao(dadosDoacao);

      if (resultado.success) {
        // 🎯 INCREMENTAR PONTOS DO USUÁRIO
        try {
          await incrementarDoacoes(user.uid);
          console.log('✅ Pontos adicionados: +10 pontos!');
        } catch (error) {
          console.error('⚠️ Erro ao adicionar pontos:', error);
        }

        // Guardar ID da doação para avaliação
        setDoacaoId(resultado.id || resultado.doacaoId);
        // Mostrar modal de avaliação
        setModalAvaliacao(true);
        // Notificar componente pai para atualizar contadores (UX instantânea)
        if (onSuccess) {
          try { onSuccess(); } catch (e) { console.warn('onSuccess callback falhou', e); }
        }
      } else {
        Alert.alert('Erro', 'Não foi possível registrar a doação. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ Erro ao enviar doação:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao processar sua doação');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarAvaliacao = async () => {
    if (estrelasSelecionadas === 0) {
      Alert.alert('Avaliação', 'Por favor, selecione uma classificação');
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        console.warn('Usuário não autenticado ao salvar avaliação');
        Alert.alert('Erro', 'Você precisa estar logado para avaliar a instituição');
        setLoading(false);
        return;
      }

      await salvarAvaliacao({
        doacaoId: doacaoId,
        doadorId: user.uid,
        instituicaoId: projeto.instituicaoId,
        projetoId: projeto.id,
        estrelas: estrelasSelecionadas,
        comentario: comentario.trim(),
      });

      setModalAvaliacao(false);
      Alert.alert(
        'Sucesso! 🎉',
        'Sua doação foi registrada e sua avaliação foi salva!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Resetar form
              setEstrelasSelecionadas(0);
              setComentario('');
              if (onSuccess) onSuccess();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      Alert.alert('Erro', 'Não foi possível salvar sua avaliação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modal de Avaliação */}
      <Modal
        visible={modalAvaliacao}
        transparent
        animationType="slide"
        onRequestClose={() => setModalAvaliacao(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContent}>
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>Avalie a Instituição</Text>
              <TouchableOpacity onPress={() => setModalAvaliacao(false)}>
                <Ionicons name="close" size={28} color={cores.verdeEscuro} />
              </TouchableOpacity>
            </View>
                onPress={() => {
                  setModalAvaliacao(false);
                  if (onSuccess) {
                    try { onSuccess(); } catch (e) { console.warn('onSuccess callback falhou', e); }
                  }
                }}
            <ScrollView style={modalStyles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={modalStyles.avaliacaoContainer}>
                <Text style={modalStyles.avaliacaoLabel}>Como foi sua experiência?</Text>
                
                {/* Estrelas */}
                <View style={modalStyles.estrelasContainer}>
                  {[1, 2, 3, 4, 5].map((estrela) => (
                    <TouchableOpacity
                      key={estrela}
                      onPress={() => setEstrelasSelecionadas(estrela)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={estrela <= estrelasSelecionadas ? 'star' : 'star-outline'}
                        size={46}
                        color={estrela <= estrelasSelecionadas ? '#F9A825' : '#E0E0E0'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={modalStyles.estrelaTexto}>
                  {estrelasSelecionadas === 0
                    ? 'Selecione uma classificação'
                    : `${estrelasSelecionadas} estrela${estrelasSelecionadas !== 1 ? 's' : ''}`}
                </Text>

                {/* Comentário */}
                <Text style={modalStyles.comentarioLabel}>Deixe um comentário (opcional)</Text>
                <TextInput
                  style={modalStyles.comentarioInput}
                  placeholder="Conte-nos sua experiência..."
                  placeholderTextColor="#AAA"
                  value={comentario}
                  onChangeText={setComentario}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ScrollView>

            <View style={modalStyles.modalFooter}>
              <TouchableOpacity
                style={modalStyles.btnCancelar}
                onPress={() => setModalAvaliacao(false)}
                activeOpacity={0.8}
              >
                <Text style={modalStyles.btnCancelarText}>Pular</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.btnSalvar, loading && modalStyles.btnDisabled]}
                onPress={handleSalvarAvaliacao}
                disabled={loading}
                activeOpacity={0.9}
              >
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={modalStyles.btnSalvarText}>
                  {loading ? 'Salvando...' : 'Enviar Avaliação'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Tipo de Entrega */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Como deseja doar?</Text>
        
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              tipoEntrega === 'entrega' && styles.optionCardActive,
            ]}
            onPress={() => setTipoEntrega('entrega')}
          >
            <View style={[
              styles.optionIcon,
              tipoEntrega === 'entrega' && styles.optionIconActive,
            ]}>
              <Ionicons
                name="home"
                size={32}
                color={tipoEntrega === 'entrega' ? '#fff' : cores.verdeEscuro}
              />
            </View>
            <Text style={[
              styles.optionTitle,
              tipoEntrega === 'entrega' && styles.optionTitleActive,
            ]}>
              Levar até a ONG
            </Text>
            <Text style={styles.optionDesc}>
              Você entrega os itens diretamente na instituição
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              tipoEntrega === 'coleta' && styles.optionCardActive,
            ]}
            onPress={() => setTipoEntrega('coleta')}
          >
            <View style={[
              styles.optionIcon,
              tipoEntrega === 'coleta' && styles.optionIconActive,
            ]}>
              <Ionicons
                name="car"
                size={32}
                color={tipoEntrega === 'coleta' ? '#fff' : cores.verdeEscuro}
              />
            </View>
            <Text style={[
              styles.optionTitle,
              tipoEntrega === 'coleta' && styles.optionTitleActive,
            ]}>
              Coleta pela ONG
            </Text>
            <Text style={styles.optionDesc}>
              A instituição coleta os itens em sua casa
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Itens */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>O que você vai doar?</Text>
        
        {itens.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemNumber}>Item {index + 1}</Text>
              {itens.length > 1 && (
                <TouchableOpacity onPress={() => removerItem(index)}>
                  <Ionicons name="trash" size={20} color="#D32F2F" />
                </TouchableOpacity>
              )}
            </View>

            {/* Categoria */}
            <Text style={styles.inputLabel}>Categoria *</Text>
            <View style={styles.categoriaGrid}>
              {categorias.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoriaChip,
                    item.categoria === cat.value && styles.categoriaChipActive,
                  ]}
                  onPress={() => atualizarItem(index, 'categoria', cat.value)}
                >
                  <Text
                    style={[
                      styles.categoriaChipText,
                      item.categoria === cat.value && styles.categoriaChipTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quantidade */}
            <Text style={styles.inputLabel}>Quantidade *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 5"
              keyboardType="numeric"
              value={item.quantidade}
              onChangeText={(text) => atualizarItem(index, 'quantidade', text)}
            />

            {/* Descrição */}
            <Text style={styles.inputLabel}>Descrição (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ex: Roupas infantis tamanho 8-10 anos"
              multiline
              numberOfLines={3}
              value={item.descricao}
              onChangeText={(text) => atualizarItem(index, 'descricao', text)}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.addItemBtn} onPress={adicionarItem}>
          <Ionicons name="add-circle" size={24} color={cores.verdeEscuro} />
          <Text style={styles.addItemText}>Adicionar outro item</Text>
        </TouchableOpacity>
      </View>

      {/* Observações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Observações (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Informações adicionais sobre a doação..."
          multiline
          numberOfLines={4}
          value={observacoes}
          onChangeText={setObservacoes}
        />
      </View>

      {/* Botões */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.submitBtnText}>Confirmar Doação</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    ...fontes.montserratBold,
    fontSize: 16,
    color: cores.verdeEscuro,
    marginBottom: 15,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    backgroundColor: cores.brancoTexto,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionCardActive: {
    borderColor: cores.verdeEscuro,
    backgroundColor: cores.verdeClaro,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: cores.verdeClaro,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionIconActive: {
    backgroundColor: cores.verdeEscuro,
  },
  optionTitle: {
    ...fontes.montserratBold,
    fontSize: 13,
    marginBottom: 4,
    textAlign: 'center',
  },
  optionTitleActive: {
    color: cores.verdeEscuro,
  },
  optionDesc: {
    ...fontes.montserrat,
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  itemCard: {
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemNumber: {
    ...fontes.montserratBold,
    fontSize: 14,
    color: cores.verdeEscuro,
  },
  inputLabel: {
    ...fontes.montserratMedium,
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    ...fontes.montserrat,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoriaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  categoriaChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoriaChipActive: {
    backgroundColor: cores.verdeEscuro,
    borderColor: cores.verdeEscuro,
  },
  categoriaChipText: {
    ...fontes.montserratMedium,
    fontSize: 12,
    color: '#666',
  },
  categoriaChipTextActive: {
    color: '#fff',
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: cores.verdeClaro,
    borderRadius: 12,
    gap: 8,
  },
  addItemText: {
    ...fontes.montserratBold,
    fontSize: 14,
    color: cores.verdeEscuro,
  },
  buttonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    ...fontes.montserratBold,
    fontSize: 14,
    color: '#666',
  },
  submitBtn: {
    flex: 2,
    backgroundColor: cores.verdeEscuro,
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    ...fontes.montserratBold,
    fontSize: 14,
    color: '#fff',
  },
});

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: cores.brancoTexto,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    ...fontes.merriweatherBold,
    fontSize: 20,
    color: cores.verdeEscuro,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  avaliacaoContainer: {
    alignItems: 'center',
  },
  avaliacaoLabel: {
    ...fontes.merriweatherBold,
    fontSize: 18,
    color: '#333',
    marginBottom: 24,
  },
  estrelasContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 16,
  },
  estrelaTexto: {
    ...fontes.montserrat,
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
  },
  comentarioLabel: {
    ...fontes.montserratBold,
    fontSize: 14,
    color: '#333',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  comentarioInput: {
    ...fontes.montserrat,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  btnCancelar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: cores.laranjaEscuro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelarText: {
    ...fontes.montserratBold,
    fontSize: 14,
    color: cores.laranjaEscuro,
  },
  btnSalvar: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: cores.verdeEscuro,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnSalvarText: {
    ...fontes.montserratBold,
    fontSize: 14,
    color: '#fff',
  },
  btnDisabled: {
    opacity: 0.7,
  },
});
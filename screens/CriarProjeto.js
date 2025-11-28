// screens/CriarProjeto.js - VERSÃO COM TAGS PERSONALIZADAS
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import { TextInputMask } from 'react-native-masked-text';
import { fontes, cores } from '../components/Global';
import { auth, db } from '../firebase/firebaseconfig';
import { doc, getDoc } from 'firebase/firestore';
import { criarProjeto } from '../services/projetosService';

export default function CriarProjeto({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [instituicao, setInstituicao] = useState(null);
  
  // Dados Básicos
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [necessidade, setNecessidade] = useState('');
  const [categoria, setCategoria] = useState(null);
  const [meta, setMeta] = useState('');
  
  // FILTROS & TAGS
  const [materiaisAceitos, setMateriaisAceitos] = useState([]); 
  const [modalidadeEntrega, setModalidadeEntrega] = useState(null);
  
  // LOGICA PARA TAGS "OUTROS"
  const [textoOutros, setTextoOutros] = useState('');
  const [tagsExtras, setTagsExtras] = useState([]); // Armazena as tags personalizadas

  // Endereço
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // Contato
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  // ================= OPÇÕES =================
  const categorias = [
    { label: "Direitos Humanos", value: "direitos-humanos" },
    { label: "Combate à fome", value: "combate-a-fome" },
    { label: "Educação", value: "educacao" },
    { label: "Saúde", value: "saude" },
    { label: "Crianças e Adolescentes", value: "crianca-e-adolescentes" },
    { label: "Defesa dos Animais", value: "defesa-dos-animais" },
    { label: "Meio Ambiente", value: "meio-ambiente" },
    { label: "Apoio à Melhor Idade", value: "melhor-idade" },
  ];

  const opcoesMateriais = [
    { label: "Alimentos", value: "alimentos" },
    { label: "Roupas", value: "roupas" },
    { label: "Brinquedos", value: "brinquedos" },
    { label: "Higiene", value: "higiene" },
    { label: "Eletrodomésticos", value: "eletrodomesticos" },
    { label: "Eletrônicos", value: "eletronicos" },
    { label: "Móveis", value: "moveis" },
    { label: "Outros", value: "outros" }, 
  ];

  const opcoesEntrega = [
    { label: "Retirar em Casa (Busco doações)", value: "retirar_em_casa" },
    { label: "Levar ao Ponto de Coleta", value: "ponto_coleta" },
  ];

  useEffect(() => {
    carregarDadosInstituicao();
  }, []);

  useEffect(() => {
    if (rua && cidade && numero) {
        const enderecoCompleto = `${rua}, ${numero}, ${cidade}, ${estado}`;
        geocodificarEndereco(enderecoCompleto);
    }
  }, [numero]); 

  const carregarDadosInstituicao = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const instRef = doc(db, 'instituicoes', user.uid);
      const instDoc = await getDoc(instRef);
      if (instDoc.exists()) {
        const data = instDoc.data();
        setInstituicao(data);
        setTelefone(data.responsavel?.telefone || '');
        setEmail(data.email || '');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const buscarCEP = async (valorCep) => {
    if (valorCep.length < 9) return;
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${valorCep}`);
      if (!response.ok) throw new Error("CEP não encontrado");
      const data = await response.json();
      setRua(data.street || "");
      setBairro(data.neighborhood || "");
      setCidade(data.city || "");
      setEstado(data.state || "");
      geocodificarEndereco(`${data.street}, ${data.city}, ${data.state}`);
    } catch (error) {
      console.log(error);
    }
  };

  const geocodificarEndereco = async (enderecoCompleto) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}`;
      const response = await fetch(url, { headers: { "User-Agent": "AppDoacaoTCC/1.0" } });
      const data = await response.json();
      if (data.length > 0) {
        setLatitude(parseFloat(data[0].lat));
        setLongitude(parseFloat(data[0].lon));
      }
    } catch (error) {
      console.log("Erro geocodificação:", error);
    }
  };

  // ===================== LOGICA DAS TAGS =====================
  const toggleMaterial = (value) => {
    if (materiaisAceitos.includes(value)) {
      setMateriaisAceitos(materiaisAceitos.filter(item => item !== value));
      // Se desmarcar "outros", limpamos as tags extras (opcional, mas bom para UX)
      if(value === 'outros') setTagsExtras([]);
    } else {
      setMateriaisAceitos([...materiaisAceitos, value]);
    }
  };

  const adicionarTagExtra = () => {
    if (!textoOutros.trim()) return;
    if (tagsExtras.includes(textoOutros.trim())) {
        Alert.alert("Ops", "Essa tag já foi adicionada.");
        return;
    }
    setTagsExtras([...tagsExtras, textoOutros.trim()]);
    setTextoOutros('');
  };

  const removerTagExtra = (tagParaRemover) => {
    setTagsExtras(tagsExtras.filter(tag => tag !== tagParaRemover));
  };
  // ===========================================================

  const validarCampos = () => {
    if (!titulo.trim()) return Alert.alert('Erro', 'Digite o título') || false;
    if (!categoria) return Alert.alert('Erro', 'Selecione a categoria') || false;
    if (materiaisAceitos.length === 0) return Alert.alert('Erro', 'Selecione materiais aceitos') || false;
    
    // Validação extra se selecionou "Outros" mas não adicionou nenhuma tag
    if (materiaisAceitos.includes('outros') && tagsExtras.length === 0) {
        return Alert.alert('Atenção', 'Você selecionou "Outros". Adicione pelo menos uma tag específica.') || false;
    }

    if (!modalidadeEntrega) return Alert.alert('Erro', 'Selecione a modalidade') || false;
    if (!necessidade.trim()) return Alert.alert('Erro', 'Digite a necessidade') || false;
    if (!cep || cep.length < 9) return Alert.alert('Erro', 'CEP inválido') || false;
    if (!numero.trim()) return Alert.alert('Erro', 'Digite o número') || false;
    
    return true;
  };

  const handleCriarProjeto = async () => {
    if (!validarCampos()) return;

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const projetoData = {
        instituicaoId: user.uid,
        instituicaoNome: instituicao?.nome || 'Instituição',
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        necessidade: necessidade.trim(),
        categoria,
        
        // SALVANDO LISTA PADRÃO E AS TAGS EXTRAS SEPARADAS
        materiais: materiaisAceitos, // Ex: ['roupas', 'outros']
        tagsExtras: tagsExtras,      // Ex: ['Livros', 'Discos']

        modalidade: modalidadeEntrega,
        meta: meta ? parseInt(meta) : 0,
        
        endereco: {
            cep, rua, numero, bairro, cidade, estado,
            latitude: latitude || 0,
            longitude: longitude || 0
        },

        telefone: telefone.trim(),
        email: email.trim(),
        dataCriacao: new Date().toISOString(),
        ativo: true
      };

      await criarProjeto(projetoData);

      Alert.alert('Sucesso! 🎉', 'Seu projeto foi publicado.', 
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o projeto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={28} color={cores.verdeEscuro} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Novo Projeto</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.form}>
            {/* Título */}
            <Text style={styles.label}>Título do Projeto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Doação de Inverno"
              placeholderTextColor={cores.placeholder}
              value={titulo}
              onChangeText={setTitulo}
            />

            {/* Categoria */}
            <Text style={styles.label}>Categoria (Razão Social) *</Text>
            <Dropdown
              style={styles.input}
              placeholder="Selecione..."
              placeholderStyle={{ color: cores.placeholder, ...fontes.montserrat }}
              selectedTextStyle={{ color: '#000', ...fontes.montserrat }}
              data={categorias}
              labelField="label"
              valueField="value"
              value={categoria}
              onChange={(item) => setCategoria(item.value)}
            />

            {/* SELEÇÃO DE MATERIAIS ACEITOS */}
            <Text style={styles.label}>Materiais Aceitos *</Text>
            <View style={styles.chipsContainer}>
              {opcoesMateriais.map((item) => {
                const isSelected = materiaisAceitos.includes(item.value);
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.chip,
                      isSelected ? styles.chipSelected : styles.chipUnselected
                    ]}
                    onPress={() => toggleMaterial(item.value)}
                  >
                    <Text style={[
                      styles.chipText,
                      isSelected ? styles.chipTextSelected : styles.chipTextUnselected
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ===== ÁREA DE TAGS EXTRAS (APARECE SÓ SE CLICAR EM OUTROS) ===== */}
            {materiaisAceitos.includes('outros') && (
                <View style={styles.outrosContainer}>
                    <Text style={styles.subLabel}>Quais outros itens?</Text>
                    
                    <View style={styles.inputTagRow}>
                        <TextInput 
                            style={styles.inputTag}
                            placeholder="Ex: Livros, Ferramentas..."
                            value={textoOutros}
                            onChangeText={setTextoOutros}
                        />
                        <TouchableOpacity style={styles.btnAddTag} onPress={adicionarTagExtra}>
                            <Ionicons name="add" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Lista das tags adicionadas */}
                    <View style={styles.tagsExtraContainer}>
                        {tagsExtras.map((tag, index) => (
                            <View key={index} style={styles.tagExtraChip}>
                                <Text style={styles.tagExtraText}>{tag}</Text>
                                <TouchableOpacity onPress={() => removerTagExtra(tag)}>
                                    <Ionicons name="close-circle" size={18} color="#fff" style={{marginLeft: 5}}/>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>
            )}
            {/* =================================================================== */}

            <Text style={styles.label}>Modalidade da Entrega *</Text>
            <View style={styles.chipsContainer}>
              {opcoesEntrega.map((item) => {
                const isSelected = modalidadeEntrega === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.chip,
                      isSelected ? styles.chipSelected : styles.chipUnselected
                    ]}
                    onPress={() => setModalidadeEntrega(item.value)}
                  >
                    <Ionicons 
                        name={item.value === 'retirar_em_casa' ? 'car' : 'location'} 
                        size={16} 
                        color={isSelected ? '#fff' : '#666'} 
                        style={{ marginRight: 5 }}
                    />
                    <Text style={[
                      styles.chipText,
                      isSelected ? styles.chipTextSelected : styles.chipTextUnselected
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>O que você precisa? (Resumo) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Roupas tam. G, Arroz..."
              value={necessidade}
              onChangeText={setNecessidade}
            />

            <Text style={styles.label}>Meta (Opcional)</Text>
            <TextInput style={styles.input} placeholder="Quantidade" value={meta} onChangeText={setMeta} keyboardType="numeric" />

            <Text style={styles.label}>Descrição Completa *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva seu projeto..."
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={4}
            />

            <View style={styles.divider}>
              <Text style={styles.dividerText}>Localização</Text>
            </View>

            <Text style={styles.label}>CEP *</Text>
            <TextInputMask
                type={'zip-code'}
                value={cep}
                style={styles.input}
                placeholder="00000-000"
                onChangeText={(v) => { setCep(v); buscarCEP(v); }}
            />

            <View style={styles.row}>
                <View style={{ flex: 2, marginRight: 10 }}>
                    <Text style={styles.label}>Rua</Text>
                    <TextInput style={styles.inputDisabled} value={rua} editable={false} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Número *</Text>
                    <TextInput style={styles.input} value={numero} onChangeText={setNumero} keyboardType="numeric" />
                </View>
            </View>

            <View style={styles.divider}>
              <Text style={styles.dividerText}>Contato</Text>
            </View>
            
            <Text style={styles.label}>Telefone *</Text>
            <TextInputMask
              type={'cel-phone'}
              options={{ maskType: 'BRL', withDDD: true, dddMask: '(99) ' }}
              value={telefone} onChangeText={setTelefone} style={styles.input}
            />

            <Text style={styles.label}>E-mail *</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

            <TouchableOpacity
              style={[styles.botao, loading && { opacity: 0.6 }]}
              onPress={handleCriarProjeto}
              disabled={loading}
            >
              <Text style={styles.botaoText}>
                {loading ? 'Salvando...' : 'Publicar Projeto'}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 50 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundoBranco },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
  },
  headerTitle: { ...fontes.merriweatherBold, fontSize: 20, color: cores.verdeEscuro },
  form: { paddingHorizontal: 20, paddingTop: 20 },
  label: { ...fontes.montserratBold, fontSize: 14, marginBottom: 8, color: '#333', marginTop: 10 },
  subLabel: { ...fontes.montserrat, fontSize: 12, marginBottom: 5, color: '#666' },
  input: {
    ...fontes.montserrat, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0',
    borderRadius: 12, padding: 12, fontSize: 14, height: 50, marginBottom: 5
  },
  inputDisabled: {
    ...fontes.montserrat, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#E0E0E0',
    borderRadius: 12, padding: 12, fontSize: 14, height: 50, color: '#666'
  },
  textArea: { minHeight: 100, textAlignVertical: 'top', height: 'auto' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  divider: { marginVertical: 20, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20 },
  dividerText: { ...fontes.montserratBold, fontSize: 16, color: cores.laranjaEscuro },
  botao: {
    backgroundColor: cores.verdeEscuro, padding: 18, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginTop: 30,
  },
  botaoText: { ...fontes.montserratBold, color: '#fff', fontSize: 16 },

  // CHIPS
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10, gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, borderWidth: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 5,
  },
  chipUnselected: { backgroundColor: '#fff', borderColor: '#ccc' },
  chipSelected: { backgroundColor: cores.verdeEscuro, borderColor: cores.verdeEscuro },
  chipText: { ...fontes.montserratMedium, fontSize: 12 },
  chipTextUnselected: { color: '#666' },
  chipTextSelected: { color: '#fff', fontWeight: 'bold' },

  // ESTILOS PARA ÁREA DE "OUTROS"
  outrosContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee'
  },
  inputTagRow: {
    flexDirection: 'row',
    gap: 10
  },
  inputTag: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular'
  },
  btnAddTag: {
    backgroundColor: cores.verdeEscuro,
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tagsExtraContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8
  },
  tagExtraChip: {
    flexDirection: 'row',
    backgroundColor: cores.laranjaEscuro,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: 'center'
  },
  tagExtraText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold'
  }
});
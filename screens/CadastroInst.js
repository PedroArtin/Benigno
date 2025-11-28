// screens/CadastroInst.js - COMPLETO COM CEP + MAPA + FIREBASE
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { TextInputMask } from "react-native-masked-text";
import { fontes, cores } from "../components/Global";
import { registerWithEmail } from "../authService";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseconfig";

export default function CadastroInst({ navigation }) {
  const [loading, setLoading] = useState(false);

  // Dados da Instituição
  const [nomeInstituicao, setNomeInstituicao] = useState("");
  const [categoria, setCategoria] = useState(null);
  const [emailInst, setEmailInst] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cep, setCep] = useState("");

  // NOVO: endereço completo
  const [rua, setRua] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  // NOVO: coordenadas
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // Dados do Responsável
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");

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

  // ============================================================
  // 🔎 BUSCAR ENDEREÇO PELO CEP (BRASIL API - GRATIS)
  // ============================================================
  const buscarCEP = async (valorCep) => {
    if (valorCep.length < 9) return;
    try {
      const response = await fetch(
        `https://brasilapi.com.br/api/cep/v1/${valorCep}`
      );

      if (!response.ok) throw new Error("CEP não encontrado");

      const data = await response.json();

      setRua(data.street || "");
      setBairro(data.neighborhood || "");
      setCidade(data.city || "");
      setEstado(data.state || "");

      // Agora geocodificar
      geocodificarEndereco(
        `${data.street}, ${data.city}, ${data.state}`
      );
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível buscar o CEP");
    }
  };

  // ============================================================
  // 📍 GEOCODIFICAÇÃO GRATUITA (NOMINATIM / OPENSTREETMAP)
  // ============================================================
  const geocodificarEndereco = async (enderecoCompleto) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        enderecoCompleto
      )}`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "SeuApp/1.0", // obrigatório
        },
      });

      const data = await response.json();

      if (data.length > 0) {
        setLatitude(parseFloat(data[0].lat));
        setLongitude(parseFloat(data[0].lon));
      }
    } catch (error) {
      console.log("Erro geocodificação:", error);
    }
  };

  // ============================================================
  // VALIDAÇÃO
  // ============================================================
  const validarCampos = () => {
    if (!nomeInstituicao.trim()) return Alert.alert("Erro", "Digite o nome da instituição") || false;
    if (!categoria) return Alert.alert("Erro", "Selecione uma categoria") || false;
    if (!emailInst.trim()) return Alert.alert("Erro", "Digite o e-mail") || false;
    if (!cnpj || cnpj.length < 18) return Alert.alert("Erro", "CNPJ inválido") || false;
    if (!cep || cep.length < 9) return Alert.alert("Erro", "CEP inválido") || false;
    if (!rua) return Alert.alert("Erro", "CEP não retornou endereço") || false;
    if (!nomeResponsavel.trim()) return Alert.alert("Erro", "Nome do responsável obrigatório") || false;
    if (!telefone || telefone.length < 14) return Alert.alert("Erro", "Telefone inválido") || false;
    if (!cpf || cpf.length < 14) return Alert.alert("Erro", "CPF inválido") || false;
    if (!senha || senha.length < 6) return Alert.alert("Erro", "Senha muito curta") || false;
    return true;
  };

  // ============================================================
  // SALVAR NO FIREBASE
  // ============================================================
  const handleCadastro = async () => {
    if (!validarCampos()) return;

    try {
      setLoading(true);

      const userCredential = await registerWithEmail(
        emailInst.trim(),
        senha,
        nomeInstituicao.trim()
      );

      const uid = userCredential.uid;

      await setDoc(doc(db, "instituicoes", uid), {
        userId: uid,
        nome: nomeInstituicao.trim(),
        categoria,
        email: emailInst.trim(),
        cnpj,
        cep,

        // NOVO: Endereço completo
        endereco: {
          rua,
          bairro,
          cidade,
          estado,
          latitude,
          longitude,
        },

        responsavel: {
          nome: nomeResponsavel.trim(),
          telefone,
          cpf,
        },

        stats: {
          doacoesRecebidas: 0,
          valorArrecadado: 0,
          entregasPendentes: 0,
          doadoresAtivos: 0,
        },

        dataCadastro: new Date().toISOString(),
        ativo: true,
      });

      Alert.alert(
        "Cadastro Realizado! 🎉",
        "Sua instituição foi cadastrada com sucesso!",
        [{ text: "OK", onPress: () => navigation.replace("DashboardInstituicao") }]
      );
    } catch (error) {
      console.error("Erro ao cadastrar instituição:", error);
      let msg = "Erro ao cadastrar.";

      if (error.code === "auth/email-already-in-use") msg = "Este e-mail já está em uso.";
      if (error.code === "auth/invalid-email") msg = "E-mail inválido.";
      if (error.code === "auth/weak-password") msg = "Senha muito fraca.";

      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Título */}
      <View style={styles.ctntitulo}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={25} color={cores.verdeEscuro} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Cadastro de Instituição</Text>
      </View>

      <Text style={styles.separadores}>Dados da Instituição:</Text>

      <View style={styles.containerForm}>
        
        {/* Nome */}
        <Text style={styles.label}>Nome da Instituição:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor={cores.placeholder}
          value={nomeInstituicao}
          onChangeText={setNomeInstituicao}
        />

        {/* Categoria */}
        <Text style={styles.label}>Categoria:</Text>
        <Dropdown
          style={styles.input}
          placeholder="Escolha uma categoria"
          data={categorias}
          labelField="label"
          valueField="value"
          value={categoria}
          onChange={(item) => setCategoria(item.value)}
        />

        {/* Email */}
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="exemplo@gmail.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={emailInst}
          onChangeText={setEmailInst}
        />

        {/* Senha */}
        <Text style={styles.label}>Senha:</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 6 caracteres"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        {/* CNPJ */}
        <Text style={styles.label}>CNPJ:</Text>
        <TextInputMask
          type="cnpj"
          style={styles.input}
          value={cnpj}
          onChangeText={setCnpj}
        />

        {/* CEP */}
        <Text style={styles.label}>CEP:</Text>
        <TextInputMask
          type="zip-code"
          value={cep}
          style={styles.input}
          onChangeText={(v) => {
            setCep(v);
            buscarCEP(v);
          }}
        />

        {/* Endereço preenchido automaticamente */}
        <Text style={styles.label}>Rua:</Text>
        <TextInput style={styles.input} value={rua} editable={false} />

        <Text style={styles.label}>Bairro:</Text>
        <TextInput style={styles.input} value={bairro} editable={false} />

        <Text style={styles.label}>Cidade:</Text>
        <TextInput style={styles.input} value={cidade} editable={false} />

        <Text style={styles.label}>Estado:</Text>
        <TextInput style={styles.input} value={estado} editable={false} />

        <View style={styles.linhaComTexto}>
          <View style={styles.linha} />
        </View>

        <Text style={styles.separadores}>Dados do Responsável:</Text>

        {/* Nome responsável */}
        <Text style={styles.label}>Nome:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do responsável"
          value={nomeResponsavel}
          onChangeText={setNomeResponsavel}
        />

        {/* Telefone */}
        <Text style={styles.label}>Telefone:</Text>
        <TextInputMask
          type="cel-phone"
          style={styles.input}
          value={telefone}
          onChangeText={setTelefone}
          options={{ maskType: "BRL", withDDD: true, dddMask: "(99) " }}
        />

        {/* CPF */}
        <Text style={styles.label}>CPF:</Text>
        <TextInputMask
          type="cpf"
          style={styles.input}
          value={cpf}
          onChangeText={setCpf}
        />
      </View>

      <TouchableOpacity
        style={[styles.botao, loading && { opacity: 0.6 }]}
        onPress={handleCadastro}
        disabled={loading}
      >
        <Text style={styles.textoBotao}>
          {loading ? "Cadastrando..." : "Cadastrar Instituição"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("LoginInstituicao")}
        style={styles.linkContainer}
      >
        <Text style={styles.link}>Já tenho conta</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

// ESTILOS (iguais)
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: cores.fundoBranco,
    padding: 10,
  },
  ctntitulo: {
    width: 330,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 40,
    marginBottom: 40,
  },
  titulo: {
    ...fontes.merriweatherBold,
    fontSize: 22,
    marginLeft: 20,
    flex: 1,
    textAlign: "center",
  },
  containerForm: {
    width: "100%",
    marginBottom: 27,
  },
  separadores: {
    ...fontes.montserratBold,
    fontSize: 18,
    marginBottom: 20,
    color: cores.verdeEscuro,
    alignSelf: "flex-start",
    marginLeft: 15,
  },
  label: {
    ...fontes.montserratMedium,
    marginBottom: 5,
    marginLeft: 15,
  },
  input: {
    ...fontes.montserrat,
    width: 300,
    height: 45,
    marginBottom: 20,
    paddingHorizontal: 18,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#000",
    fontSize: 14,
  },
  botao: {
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    width: 300,
    borderRadius: 30,
    height: 50,
    backgroundColor: cores.verdeEscuro,
  },
  textoBotao: {
    ...fontes.montserratBold,
    fontSize: 16,
    textAlign: "center",
    color: cores.brancoTexto,
  },
  linhaComTexto: {
    flexDirection: "row",
    alignItems: "center",
    width: 320,
    marginBottom: 30,
    marginTop: 10,
  },
  linha: {
    height: 1,
    width: 320,
    backgroundColor: "#858585",
  },
  linkContainer: {
    marginTop: 20,
  },
  link: {
    ...fontes.montserratMedium,
    color: cores.verdeEscuro,
    textDecorationLine: "underline",
    fontSize: 16,
    textAlign: "center",
  },
});

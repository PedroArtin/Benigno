// screens/CadastroInst.js - ATUALIZADO
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

  const validarCampos = () => {
    if (!nomeInstituicao.trim()) {
      Alert.alert("Erro", "Digite o nome da instituição");
      return false;
    }
    if (!categoria) {
      Alert.alert("Erro", "Selecione uma categoria");
      return false;
    }
    if (!emailInst.trim()) {
      Alert.alert("Erro", "Digite o e-mail da instituição");
      return false;
    }
    if (!cnpj || cnpj.length < 18) {
      Alert.alert("Erro", "Digite um CNPJ válido");
      return false;
    }
    if (!cep || cep.length < 9) {
      Alert.alert("Erro", "Digite um CEP válido");
      return false;
    }
    if (!nomeResponsavel.trim()) {
      Alert.alert("Erro", "Digite o nome do responsável");
      return false;
    }
    if (!telefone || telefone.length < 14) {
      Alert.alert("Erro", "Digite um telefone válido");
      return false;
    }
    if (!cpf || cpf.length < 14) {
      Alert.alert("Erro", "Digite um CPF válido");
      return false;
    }
    if (!senha || senha.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres");
      return false;
    }
    return true;
  };

  const handleCadastro = async () => {
    if (!validarCampos()) return;

    try {
      setLoading(true);

      // 1. Criar conta no Firebase Auth
      const userCredential = await registerWithEmail(
        emailInst.trim(),
        senha,
        nomeInstituicao.trim()
      );

      const uid = userCredential.uid;

      // 2. Criar documento da instituição no Firestore
      await setDoc(doc(db, 'instituicoes', uid), {
        userId: uid,
        nome: nomeInstituicao.trim(),
        categoria: categoria,
        email: emailInst.trim(),
        cnpj: cnpj,
        cep: cep,
        responsavel: {
          nome: nomeResponsavel.trim(),
          telefone: telefone,
          cpf: cpf,
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

      // 3. Sucesso - navegar para Dashboard
      Alert.alert(
        "Cadastro Realizado! 🎉",
        "Sua instituição foi cadastrada com sucesso!",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.replace("DashboardInstituicao");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Erro ao cadastrar instituição:", error);
      
      let msg = "Ocorreu um erro ao cadastrar. Tente novamente.";
      
      if (error.code === "auth/email-already-in-use") {
        msg = "Este e-mail já está em uso.";
      } else if (error.code === "auth/invalid-email") {
        msg = "E-mail inválido.";
      } else if (error.code === "auth/weak-password") {
        msg = "A senha deve ter pelo menos 6 caracteres.";
      }
      
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
        {/* Nome da instituição */}
        <View>
          <Text style={styles.label}>Nome da Instituição:</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor={cores.placeholder}
            value={nomeInstituicao}
            onChangeText={setNomeInstituicao}
          />
        </View>

        {/* Categoria */}
        <Text style={styles.label}>Categoria:</Text>
        <Dropdown
          style={styles.input}
          placeholder="Escolha uma categoria"
          placeholderStyle={{
            color: cores.placeholder,
            ...fontes.montserrat,
          }}
          selectedTextStyle={{
            color: "#000",
            ...fontes.montserrat,
            fontSize: 14,
          }}
          itemTextStyle={{
            color: cores.verdeEscuro,
            ...fontes.montserrat,
          }}
          search
          data={categorias}
          labelField="label"
          valueField="value"
          value={categoria}
          onChange={(item) => setCategoria(item.value)}
        />

        {/* Email */}
        <View>
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            placeholder="exemplo@gmail.com"
            placeholderTextColor={cores.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            value={emailInst}
            onChangeText={setEmailInst}
          />
        </View>

        {/* Senha */}
        <View>
          <Text style={styles.label}>Senha:</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={cores.placeholder}
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
        </View>

        {/* CNPJ */}
        <View>
          <Text style={styles.label}>CNPJ:</Text>
          <TextInputMask
            type={"cnpj"}
            value={cnpj}
            onChangeText={setCnpj}
            style={styles.input}
            placeholder="00.000.000/0001-00"
            placeholderTextColor={cores.placeholder}
            keyboardType="numeric"
          />
        </View>

        {/* CEP */}
        <View>
          <Text style={styles.label}>CEP:</Text>
          <TextInputMask
            type={"zip-code"}
            value={cep}
            onChangeText={setCep}
            style={styles.input}
            placeholder="00000-000"
            placeholderTextColor={cores.placeholder}
            keyboardType="numeric"
          />
        </View>

        {/* Separador */}
        <View style={styles.linhaComTexto}>
          <View style={styles.linha} />
        </View>

        <Text style={styles.separadores}>Dados do Responsável:</Text>

        {/* Nome do responsável */}
        <View>
          <Text style={styles.label}>Nome:</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome do responsável"
            placeholderTextColor={cores.placeholder}
            value={nomeResponsavel}
            onChangeText={setNomeResponsavel}
          />
        </View>

        {/* Telefone */}
        <View>
          <Text style={styles.label}>Telefone:</Text>
          <TextInputMask
            type={"cel-phone"}
            options={{
              maskType: "BRL",
              withDDD: true,
              dddMask: "(99) ",
            }}
            value={telefone}
            onChangeText={setTelefone}
            style={styles.input}
            placeholder="(00) 00000-0000"
            placeholderTextColor={cores.placeholder}
            keyboardType="phone-pad"
          />
        </View>

        {/* CPF */}
        <View>
          <Text style={styles.label}>CPF:</Text>
          <TextInputMask
            type={"cpf"}
            value={cpf}
            onChangeText={setCpf}
            style={styles.input}
            placeholder="000.000.000-00"
            placeholderTextColor={cores.placeholder}
            keyboardType="numeric"
          />
        </View>
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

      {/* NOVO: Link para Login */}
      <TouchableOpacity
        onPress={() => navigation.navigate("LoginInstituicao")}
        style={styles.linkContainer}
        activeOpacity={0.7}
      >
        <Text style={styles.link}>Já tenho conta</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

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
    marginBottom: 30,
    paddingHorizontal: 18,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#000",
    fontSize: 14,
    textAlignVertical: "center",
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
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  link: {
    ...fontes.montserratMedium,
    color: cores.verdeEscuro,
    textDecorationLine: "underline",
    fontSize: 16,
    textAlign: "center",
  },
});
// screens/EscolhaDeFuncao.js
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fontes, cores } from "../components/Global";

export default function EscolhaDeFuncao({ navigation }) {
  return (
    <View style={style.container}>
      <View style={style.containerTitulo}>
        <Text style={style.titulo}>
          Escolha qual categoria é mais adequada a você
        </Text>
      </View>

      <View style={style.containerBtn}>
        <TouchableOpacity
          style={style.botao}
          onPress={() => navigation.navigate("Login")}
        >
          <View style={style.centralizarBtn}>
            <Ionicons name="gift-outline" size={30} color={cores.laranjaEscuro} />
            <Text style={style.texto}>Quero ser doador</Text>
          </View>
          <Text style={style.explicacao}>
            Pretendo doar roupas, produtos, brinquedos e etc...
          </Text>
        </TouchableOpacity>

        <View style={style.linhaComTexto}>
          <View style={style.linha} />
        </View>

        <TouchableOpacity 
          style={style.botao} 
          onPress={() => navigation.navigate("LoginInstituicao")}
        >
          <View style={style.centralizarBtn}>
            <Ionicons
              name="business-outline"
              size={28}
              color={cores.laranjaEscuro}
            />
            <Text style={style.texto}>Sou uma instituição</Text>
          </View>
          <Text style={style.explicacao}>
            Sou uma instituição de caridade, ONG, instituto e etc...
          </Text>
        </TouchableOpacity>
      </View>

      <Image source={require("../assets/wave-1.png")} style={style.imagem} />
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    backgroundColor: cores.fundoBranco,
  },
  containerTitulo: {
    width: 340,
  },
  titulo: {
    ...fontes.merriweatherBold,
    fontSize: 26,
    textAlign: "center",
    marginBottom: 70,
    marginTop: 100,
  },
  containerBtn: {
    alignItems: "center",
    width: "100%",
    height: "70",
  },
  botao: {
    justifyContent: "center",
    width: 300,
    height: 200,
    padding: 20,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: cores.laranjaEscuro,
    backgroundColor: cores.brancoTexto,
  },
  centralizarBtn: {
    flexDirection: "row",
    alignItems: "center",
    height: "auto",
  },
  texto: {
    ...fontes.montserratMedium,
    fontSize: 20,
    marginLeft: 10,
  },
  explicacao: {
    ...fontes.montserratMedium,
    fontSize: 14,
    marginTop: 5,
    color: "#868686ff",
    flexWrap: "wrap",
  },
  imagem: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 170,
    resizeMode: "cover",
    zIndex: 0,
  },
  linhaComTexto: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 30,
    marginTop: 30,
  },
  linha: {
    height: 1,
    width: 320,
    backgroundColor: "#858585",
  },
});
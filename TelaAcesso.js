import { fontes, cores } from "./Global";
import { FontAwesome } from "@expo/vector-icons";
import {useNavigation} from '@react-navigation/native';
import {
  View, TextInput, Text, Image, Pressable, TouchableOpacity, SafeAreaView, StyleSheet} from "react-native";

export default function TelaAcesso({
  titulo ,
  subtitulo,
  botaoTexto,
  textoLink,
  onSubmit,
  onLinkPress,
}) {

  const navigation = useNavigation();

  const handleLinkPress = () => {
    if (onLinkPress){
      onLinkPress();
    } else {
      navigation.navigate('Cadastro')
    }
  };

  return (
    <SafeAreaView style={style.container}>
      <Text style={style.titulo}>{titulo}</Text>

      <Text style={style.subtexto}>{subtitulo}</Text>

      <View style={style.containerForm}>
        <TextInput
          style={[style.input, { paddingHorizontal: 18 }]}
          placeholder="Nome"
          placeholderTextColor={cores.placeholder}
        />
        <TextInput
          style={[style.input, { paddingHorizontal: 18 }]}
          placeholder="Email"
          placeholderTextColor={cores.placeholder}
        />
        <Pressable>
          <Text style={style.link}>Esqueci a senha</Text>
        </Pressable>
      </View>

      <TouchableOpacity style={style.botao} onPress={onSubmit}>
        <Text style={style.textoBotao}>{botaoTexto}</Text>
      </TouchableOpacity>

      <View style={style.linhaComTexto}>
        <View style={style.linha} />
        <Text style={style.texto}>ou</Text>
        <View style={style.linha} />
      </View>

      <View style={style.containerBtnLogo}>
        <TouchableOpacity style={style.botaoConta} onPress={onLinkPress}>
          <FontAwesome name="google" size={25} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={style.botaoConta}>
          <FontAwesome name="apple" size={25} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={style.botaoConta}>
          <FontAwesome name="facebook" size={25} color="#000" />
        </TouchableOpacity>
      </View>

      <Pressable onPress={handleLinkPress}>
    <Text style={style.link2}>{textoLink}</Text>
</Pressable>

      <Image source={require("../assets/wave-1.png")} style={style.imagem} />
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: cores.fundoBranco,
  },
  titulo: {
    ...fontes.merriweatherBold,
    fontSize: 32,
    marginBottom: 5,
  },
  subtexto: {
    ...fontes.montserrat,
    fontSize: 16,
    marginHorizontal: 20,
    textAlign: "center",
    marginBottom: 60,
  },
  containerForm: {
    width: 300,
    marginBottom: 27,
  },
  input: {
    ...fontes.montserrat,
    width: 300,
    height: 48,
    marginBottom: 15,
    padding: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#000",
    fontSize: 14,
    textAlignVertical: "center",
  },
  link: {
    ...fontes.montserratMedium,
    color: cores.verdeEscuro,
    textAlign: "right",
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
    ...fontes.montserrat,
    fontSize: 20,
    textAlign: "center",
    color: cores.brancoTexto,
  },
  linhaComTexto: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 40,
    marginHorizontal: 40,
  },
  linha: {
    flex: 1,
    height: 1,
    backgroundColor: "#858585",
  },
  texto: {
    marginHorizontal: 10,
    fontSize: 16,
    color: "#000",
    fontFamily: "Montserrat_400Regular",
  },
  botaoConta: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    backgroundColor: cores.laranjaMedio,
  },
  containerBtnLogo: {
    width: 300,
    height: 60,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  link2: {
    position: 'relative',
    ...fontes.montserratMedium,
    color: cores.verdeEscuro,
    marginTop: 30,
    textDecorationLine: "underline",
    zIndex: 2,
  },
  imagem: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 170,
    resizeMode: "cover",
    zIndex: 0,
  },
});

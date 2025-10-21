import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import { fontes, cores } from './Global';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function TelaBase({
  titulo,
  texto,
  imagem,
  botaoTextoUm,
  botaoTextoDois,
  botaoCor,
  botaoTextoCor,
  backgroundCor,
  corPontosp,
  corPontoss,
  corPontost,
  onPressBotao,
  mostrarBotaoUm = true,
}) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.espacoUm}>
        <Image source={imagem} style={styles.image} />
      </View>

      <View style={styles.espacoDois}>
        <Text style={styles.titulo}>
          {titulo}
        </Text>
        <View style={styles.containerTexto}>
        <Text style={styles.texto}>{texto}</Text>
        </View>

        <View style={styles.tresPontosContainer}>
          <FontAwesome name='circle' size={10} color={corPontosp}/>
          <FontAwesome name='circle' size={10} color={corPontoss}/>
          <FontAwesome name='circle' size={10} color={corPontost}/>
        </View>

        <View style={styles.viewBotao}>
          <View style={[styles.espacoBotao, !mostrarBotaoUm && {justifyContent: 'center'}]}>
            {mostrarBotaoUm && (
            <TouchableOpacity style={styles.botaoUm} >
              <Text style={styles.textoBotaoUm}>{botaoTextoUm}</Text>
            </TouchableOpacity>
            )}

          <TouchableOpacity style={[styles.botaoDois, !mostrarBotaoUm && {width:290}]} onPress={onPressBotao}>
            <Text style={styles.textoBotaoDois}>{botaoTextoDois}</Text>
            <Ionicons name='arrow-forward-outline' size={18} color={cores.brancoTexto}/> 
          </TouchableOpacity>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    width: '100%',
    height: '100%',
    backgroundColor: cores.fundoBranco,
  },
  espacoUm:{
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "60%",
  },
  image: {
    width: 320,
    height: 300,
    marginBottom: 10,
  },
  espacoDois:{
    width: "100%",
    height: 300,
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingBottom: 10,
    backgroundColor: cores.fundoBranco,
  },
  titulo: {
    width: '80%',
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 32,
    marginBottom: 10,
    ...fontes.merriweatherBold,
  },
  containerTexto:{
    height: 90
  },
  texto:{
    textAlign: 'center',
    marginBottom: 30,
    ...fontes.montserrat,
    fontSize: 16,
  },
  viewBotao:{
    justifyContent: 'center',
    alignItems: "flex-end",
    width: '100%',
    flexDirection: 'row',
  },
  espacoBotao:{
    flex: '1',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    marginBottom: 30
  },
  botaoUm: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 11,
    width: 98,
    height: 45,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: cores.verdeEscuro,
  },
   botaoDois: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    width: 130,
    borderRadius: 30,
    backgroundColor: cores.verdeEscuro,
    height: 47,
  },
  textoBotaoUm: {
    fontSize: 14,
    alignItems: 'center',
    color: cores.verdeEscuro,
    ...fontes.montserratMedium,
  },
  textoBotaoDois: {
    fontSize: 15,
    justifyContent: "center",
    alignItems: 'center',
    color: cores.brancoTexto,
    ...fontes.montserratMedium,
    marginRight: 8
  },
  tresPontosContainer:{
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 56,
    marginBottom: 30
  },
});
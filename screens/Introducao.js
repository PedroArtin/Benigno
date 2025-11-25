import React from 'react';
import { View, Text } from 'react-native';
import TelaBase from '../components/TelaBase';
import { cores } from '../components/Global';
import { auth, db } from '../firebase/firebaseconfig';

export default function Introducao({ navigation }) {
  console.log("Auth:", auth);
  console.log("DB:", db);

  return (
    <TelaBase
      titulo="Vamos ajudar!"
      texto="Nós iremos facilitar a sua busca a locais que atendam pessoas que precisam de ajuda."
      imagem={require('../assets/folder-1-laranja.png')}
      botaoTextoUm="Pular"
      botaoTextoDois="Continuar"
      botaoCor={cores.verdeEscuro}
      botaoTextoCor={cores.verdeEscuro}
      corPontosp={cores.laranjaEscuro}
      corPontoss={cores.pontos}
      corPontost={cores.pontos}
      backgroundCor="#fff"
      onPressBotao={() => navigation.navigate('PExplicacao')}
    >
      <View style={{ marginTop: 20 }}>
        <Text>Firebase carregado: {auth && db ? " OK" : " Falhou"}</Text>
      </View>
    </TelaBase>
  );
}

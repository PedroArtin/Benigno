import React from 'react';
import TelaBase from '../components/TelaBase';
import { cores } from '../components/Global';

export default function PExplicacao({ navigation }) {
  return (
    <TelaBase
      titulo="Localização"
      texto="Você irá achar o local mais próximo de casa e filtrar por suas preferências"
      imagem={require('../assets/folder-2-laranja-2.png')}  // coloque a imagem certa
      botaoTextoUm="Pular"
      botaoTextoDois="Continuar"
      botaoCor="#5f713f"
      botaoTextoCor="#fff"
      corPontosp={cores.pontos}
      corPontoss={cores.laranjaEscuro}
      corPontost={cores.pontos}
      backgroundCor="#a8ba88"
      onPressBotao={() => navigation.navigate('SExplicacao')}
    />
  );
}
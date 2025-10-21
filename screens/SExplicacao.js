import React from "react";
import TelaBase from "../components/TelaBase";
import { cores } from "../components/Global";

export default function SExplicacao({ navigation }) {
  return (
    <TelaBase
      titulo="Suas estatísticas"
      texto="Monitore suas doações através de estatísticas de quantas pessoas você ajudou!"
      imagem={require("../assets/folder-3-laranja-2.png")} // coloque a imagem certa
      botaoTextoDois="Faça a sua conta"
      botaoCor={cores.laranjaEscuro}
      botaoTextoCor="#000"
      corPontosp={cores.pontos}
      corPontoss={cores.pontos}
      corPontost={cores.laranjaEscuro}
      backgroundCor={cores.laranjaClaro}
      onPressBotao={() => navigation.navigate("EscolhaDeFuncao")}
      mostrarBotaoUm={false}
    />
  );
}

// --- CORREÇÃO AQUI ---
// Mudamos de "./Global" para "./components/Global"
import { fontes, cores } from "./components/Global"; 
// ---------------------

import { FontAwesome } from '@expo/vector-icons';
import { View, Text, Image, TouchableOpacity, SafeAreaView, StyleSheet} from 'react-native';

import React from 'react'

export default function BottomNavbar() {
  return (
    <SafeAreaView style={style.container}>
        <View style={style.icones}>
            {/* O uso de cores.laranjaEscuro agora vai funcionar */}
            <FontAwesome name="home" size={25} color={cores.laranjaEscuro}></FontAwesome>
            <Text style={{fontFamily: 'Montserrat_400Regular'}}>Home</Text>
        </View>
        <View style={style.icones}>
            <FontAwesome name="bar-chart" size={25} color={cores.laranjaEscuro}></FontAwesome>
            <Text style={{fontFamily: 'Montserrat_400Regular'}}>Estatísticas</Text>
        </View>
        <View style={style.icones}>
            <FontAwesome name="heart" size={25} color={cores.laranjaEscuro}></FontAwesome>
            <Text style={{fontFamily: 'Montserrat_400Regular'}}>Doar</Text>
        </View>
        <View style={style.icones}>
            <FontAwesome name="star" size={25} color={cores.laranjaEscuro}></FontAwesome>
            <Text style={{fontFamily: 'Montserrat_400Regular'}}>Favoritos</Text>
        </View>
        <View style={style.icones}>
            <FontAwesome name="user" size={25} color={cores.laranjaEscuro}></FontAwesome>
            <Text style={{fontFamily: 'Montserrat_400Regular'}}>Perfil</Text>
        </View>
    </SafeAreaView>
  )
}

const style = StyleSheet.create({
    container:{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: "space-around",
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "#FFFFFF", // Mudei de vermelho (#f00) para branco para ficar visualmente melhor, ou use cores.fundoBranco
        width: "100%",
        height: 90, // Ajustei levemente a altura
        paddingBottom: 10, // Para não colar no fundo em Iphones novos
        borderTopWidth: 1,
        borderTopColor: "#eee"
    },
    icones:{
        alignItems: "center",
        justifyContent: "center",
        gap: 4
    }
})
import { fontes, cores } from "./Global";
import { FontAwesome } from '@expo/vector-icons';
import { View, Text, Image, TouchableOpacity, SafeAreaView, StyleSheet} from 'react-native';

import React from 'react'

export default function BottomNavbar() {
  return (
    <SafeAreaView style={style.container}>
        <View style={style.icones}>
        <FontAwesome name="home" size={25} color={cores.laranjaEscuro}></FontAwesome>
        <Text>Home</Text>
        </View>
        <View style={style.icones}>
        <FontAwesome name="user" size={25} color={cores.laranjaEscuro}></FontAwesome>
        <Text>Estatísticas</Text>
        </View>
        <View style={style.icones}>
        <FontAwesome name="heart" size={25} color={cores.laranjaEscuro}></FontAwesome>
        <Text>Doar</Text>
        </View>
        <View style={style.icones}>
        <FontAwesome name="user" size={25} color={cores.laranjaEscuro}></FontAwesome>
        <Text>Favoritos</Text>
        </View>
        <View style={style.icones}>
        <FontAwesome name="user" size={25} color={cores.laranjaEscuro}></FontAwesome>
        <Text>Perfil</Text>
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
        backgroundColor: "#f00",
        width: "100%",
        height: 100,

    },
    icones:{
        alignItems: "center",
    }
})
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';

// --- CORREÇÃO AQUI ---
// Mudamos de ".." para "." porque este arquivo está na raiz
import { fontes, cores } from "./components/Global"; 
// ---------------------

import { yAxisSides } from 'gifted-charts-core';
import { BarChart, PieChart } from 'react-native-gifted-charts';

export default function Estatisticas() {
  const finalData = [
    { value: 7, label: 'Jan', frontColor: '#dd604a' },
    { value: 14, label: 'Fev', frontColor: '#e07864' },
    { value: 5, label: 'Mar', frontColor: '#c94e3f' },
    { value: 19, label: 'Abr', frontColor: '#dd604a' },
    { value: 12, label: 'Mai', frontColor: '#e07864' },
    { value: 4, label: 'Jun', frontColor: '#c94e3f' },
    { value: 17, label: 'Jul', frontColor: '#dd604a' },
    { value: 8, label: 'Ago', frontColor: '#e07864' },
    { value: 1, label: 'Set', frontColor: '#c94e3f' },
    { value: 10, label: 'Out', frontColor: '#dd604a' },
    { value: 20, label: 'Nov', frontColor: '#e07864' },
    { value: 6, label: 'Dez', frontColor: '#c94e3f' },
  ];

  const pieData = [
    { value: 4, color: '#7B1FA2', text: 'Direitos Humanos' },           
    { value: 2, color: '#E53935', text: 'Combate a fome' },             
    { value: 3, color: '#1E88E5', text: 'Educação' },                   
    { value: 2, color: '#43A047', text: 'Saúde' },                      
    { value: 5, color: '#FBC02D', text: 'Crianças e Adolescentes' },   
    { value: 7, color: '#8D6E63', text: 'Defesa dos animais' },       
    { value: 9, color: '#26A69A', text: 'Meio Ambiente' },             
    { value: 1, color: '#FB8C00', text: 'Apoio à Melhor Idade' }, 
  ];

  const [animatedData, setAnimatedData] = useState(
    finalData.map(item => ({ ...item, value: 0 }))
  );

  useEffect(() => {
    let step = 0;
    const totalSteps = 30;
    const interval = setInterval(() => {
      if (step >= totalSteps) return clearInterval(interval);
      step++;
      setAnimatedData(
        finalData.map(item => ({
          ...item,
          value: Math.min(item.value, Math.floor((item.value / totalSteps) * step)),
        }))
      );
    }, 25);

    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView style={style.container} contentContainerStyle={style.contentContainer}>
      <View style={style.containerGrafico}>
        <Text style={fontes.merriweather}>Estatísticas do mês</Text>
        <BarChart
          height={100}
          width={325}
          backgroundColor={cores.brancoTexto}
          barWidth={30}
          barBorderRadius={3}
          frontColor="#FFA500"
          data={animatedData}
          yAxisThickness={0}
          xAxisThickness={0}
          yAxisTextStyle={{ color: "#999" }}
          yAxisLabelTextStyle={{ color: "#999", fontFamily:"Montserrat_500Medium" }}
          xAxisLabelTextStyle={{ color: "#999", fontFamily: "Montserrat_500Medium", fontSize: 12 }}
          yAxisSide={yAxisSides.RIGHT}
          spacing={12}
          maxValue={20}
          noOfSections={4}
          initialSpacing={2}
          isAnimated
          barColor={({ index }) => finalData[index].frontColor} 
        />
      </View>

      <View style={[style.containerGrafico, { marginTop: 30, alignItems: 'center' }]}>
        <Text style={fontes.merriweather}>Distribuição por categoria</Text>
        <View style={style.containerPie}>
          <PieChart
            data={pieData}
            donut
            radius={70}
            innerRadius={45}
            strokeColor="#fff"
            strokeWidth={0}
          />
        </View>
        <View style={style.legendaContainer}>
          {pieData.map((item, index) => (
            <View key={index} style={style.legendaItem}>
              <View style={[style.legendaCor, { backgroundColor: item.color }]} />
              <Text style={style.legendaTexto}>{item.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundoBranco,
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  containerGrafico: {
    width: "96%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
    backgroundColor: cores.brancoTexto,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendaContainer: {
    marginTop: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    columnGap: 10,
    width: 310,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  legendaCor: {
    width: 10,
    height: 10,
    borderRadius: 30,
    marginRight: 6,
  },
  legendaTexto: {
    fontSize: 10,
    color: "#333",
    fontFamily: 'Montserrat_500Medium',
  },
  containerPie:{
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    width: 300,
    height: 180
  }
});
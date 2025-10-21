import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Animated, Dimensions } from 'react-native';

import Home from '../screens/Home';
import Estatisticas from '../screens/Estatisticas';
import Doar from '../screens/Doar';
import Favoritos from '../screens/Favoritos';
import Perfil from '../screens/perfilUser';

import { cores } from '../components/Global';

const Tab = createBottomTabNavigator();
const screenWidth = Dimensions.get('window').width;

export default function TabRoutes() {
  const translateX = useRef(new Animated.Value(0)).current;

  const tabWidth = screenWidth / 5; // 5 abas

  const animateBar = (index) => {
    Animated.spring(translateX, {
      toValue: index * tabWidth,
      useNativeDriver: true,
    }).start();
  };

  const TabIcon = ({ name, color, size }) => (
    <Ionicons name={name} size={size} color={color} />
  );

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: cores.laranjaEscuro,
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 0,
            height: 100,
            position: 'relative',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 5,
            fontFamily: 'Montserrat_400Regular'
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={Home}
          listeners={{
            tabPress: () => animateBar(0),
          }}
          options={{
            tabBarIcon: ({ color }) => <TabIcon name="home-outline" size={25} color={color} />,
            tabBarLabel: 'Início',
          }}
        />
        <Tab.Screen
          name="Estatisticas"
          component={Estatisticas}
          listeners={{
            tabPress: () => animateBar(1),
          }}
          options={{
            tabBarIcon: ({ color }) => <TabIcon name="stats-chart-outline" size={25} color={color} />,
            tabBarLabel: 'Estatísticas',
          }}
        />
        <Tab.Screen
          name="Doar"
          component={Doar}
          listeners={{
            tabPress: () => animateBar(2),
          }}
          options={{
            tabBarIcon: ({ color }) => <TabIcon name="gift-outline" size={26} color={color} />,
            tabBarLabel: 'Doar',
          }}
        />
        <Tab.Screen
          name="Favoritos"
          component={Favoritos}
          listeners={{
            tabPress: () => animateBar(3),
          }}
          options={{
            tabBarIcon: ({ color }) => <TabIcon name="heart-outline" size={25} color={color} />,
            tabBarLabel: 'Favoritos',
          }}
        />
        <Tab.Screen
          name="Perfil"
          component={Perfil}
          listeners={{
            tabPress: () => animateBar(4),
          }}
          options={{
            tabBarIcon: ({ color }) => <TabIcon name="person-outline" size={25} color={color} />,
            tabBarLabel: 'Perfil',
          }}
        />
      </Tab.Navigator>

      {/* Barra animada */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 97, 
          left: 0,
          width: tabWidth,
          height: 3,
          backgroundColor: cores.laranjaEscuro,
          borderRadius: 4,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
}
import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Merriweather_400Regular, Merriweather_700Bold } from '@expo-google-fonts/merriweather';
import * as SplashScreen from 'expo-splash-screen';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebaseconfig'; 

import StackRoutes from './routes/StackRoutes'; 
// --- CORREÇÃO AQUI ---
import TabRoutes from './routes/TabRoutes'; // Agora chamamos as rotas, não só a barra
// ---------------------

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [user, setUser] = useState(null);
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_700Bold,
    Merriweather_400Regular,
    Merriweather_700Bold,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (fontsLoaded) setAppIsReady(true);
    });
    return unsubscribe;
  }, [fontsLoaded]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        {user ? (
          // --- CORREÇÃO AQUI ---
          <TabRoutes /> // Carrega o sistema de abas completo (Home + Barra)
          // ---------------------
        ) : (
          <StackRoutes />
        )}
      </NavigationContainer>
    </View>
  );
}
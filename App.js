import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Merriweather_400Regular, Merriweather_700Bold } from '@expo-google-fonts/merriweather';
import * as SplashScreen from 'expo-splash-screen';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebaseconfig'; 

import StackRoutes from './routes/StackRoutes'; 

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

  // Se tem usuário, começa na 'Home' (que abre as Tabs). Se não, 'Introducao'.
  const rotaInicial = user ? "Home" : "Introducao";

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        {/* A Key força o React a recriar a navegação quando loga/desloga */}
        <StackRoutes 
          initialRoute={rotaInicial} 
          key={user ? "user-logado" : "user-deslogado"} 
        />
      </NavigationContainer>
    </View>
  );
}
// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Merriweather_400Regular, Merriweather_700Bold } from '@expo-google-fonts/merriweather';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import StackRoutes from './routes/StackRoutes';

// Previne que a splash screen desapareça automaticamente
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_700Bold,
    Merriweather_400Regular,
    Merriweather_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <StackRoutes />
    </NavigationContainer>
  );
}
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PortalProvider } from '../../src/index';

export default function RootLayout() {
  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={'dark-content'}
      />

      <SafeAreaProvider>
        <PortalProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </PortalProvider>
      </SafeAreaProvider>
    </>
  );
}

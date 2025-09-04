import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import "nativewind/tailwind.css";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-semibold">Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

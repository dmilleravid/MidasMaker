import { Stack } from "expo-router";
import { SafeAreaView } from "react-native";
import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack screenOptions={{ headerShown: true }} />
    </SafeAreaView>
  );
}



import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold mb-4">Home</Text>
      <Link href="/product" className="text-blue-600 mb-2">Product</Link>
      <Link href="/order" className="text-blue-600">Order</Link>
    </View>
  );
}



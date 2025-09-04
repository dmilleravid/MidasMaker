import { apiBaseUrl } from "../lib/config";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function Product() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/products`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ ok: false }));
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-xl font-semibold mb-2">Product</Text>
      <Text className="text-gray-600">Fetched from API:</Text>
      <Text className="mt-2">{JSON.stringify(data)}</Text>
    </View>
  );
}



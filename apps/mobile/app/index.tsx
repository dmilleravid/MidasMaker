import { Link } from "expo-router";
import { Text, View, StyleSheet } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Link href="/product"><Text style={styles.link}>Product</Text></Link>
      <Link href="/order"><Text style={styles.link}>Order</Text></Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 16 },
  link: { color: "#2563eb", marginBottom: 8 },
});



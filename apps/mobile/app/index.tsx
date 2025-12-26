import { Link } from "expo-router";
import { View, Text, Pressable } from "react-native";

export default function Home() {
  return (
    <View style={{ flex: 1, padding: 24, gap: 12, justifyContent: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Dropify Mobile</Text>
      <Text>Expo Router scaffold is live.</Text>

      <Link href="/(auth)/login" asChild>
        <Pressable style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}>
          <Text>Go to Login</Text>
        </Pressable>
      </Link>
    </View>
  );
}

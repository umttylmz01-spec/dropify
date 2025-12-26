import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerTitle: "Dropify" }}>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="(auth)/login" options={{ title: "Login" }} />
    </Stack>
  );
}

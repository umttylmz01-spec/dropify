import { Text } from "react-native";

export function ThemedText(props: { children: any }) {
  return <Text style={{ fontSize: 16 }}>{props.children}</Text>;
}

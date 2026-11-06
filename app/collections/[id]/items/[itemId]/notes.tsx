import { useLocalSearchParams } from "expo-router";
import { ItemNotesScreen } from "../../../../../src/presentation/screens/notes/ItemNotesScreen";

export default function ItemNotesRoute() {
  const { itemId } = useLocalSearchParams<{
    itemId: string;
  }>();

  if (!itemId) return null;

  return <ItemNotesScreen itemId={itemId} />;
}
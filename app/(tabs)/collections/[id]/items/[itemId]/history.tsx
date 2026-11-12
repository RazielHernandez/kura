import { useLocalSearchParams } from "expo-router";
import { ItemHistoryScreen } from "../../../../../../src/presentation/screens/items/ItemHistoryScreen";

export default function ItemHistoryRoute() {
  const { itemId } = useLocalSearchParams<{
    itemId: string;
  }>();

  if (!itemId) {
    return null;
  }

  return <ItemHistoryScreen itemId={itemId} />;
}
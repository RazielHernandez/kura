
import { useLocalSearchParams } from "expo-router";
import { ItemDetailsScreen } from "../../../../src/presentation/screens/items/ItemDetailsScreen";

export default function ItemDetailsRoute() {
  const { itemId } = useLocalSearchParams<{
    id: string;
    itemId: string;
  }>();

  if (!itemId) return null;

  return <ItemDetailsScreen itemId={itemId} />;
}

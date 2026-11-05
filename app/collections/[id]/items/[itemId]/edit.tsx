import { useLocalSearchParams } from "expo-router";
import { EditItemScreen } from "../../../../../src/presentation/screens/items/EditItemScreen";


export default function EditItemRoute() {
  const { itemId } = useLocalSearchParams<{
    id: string;
    itemId: string;
  }>();

  if (!itemId) return null;

  return <EditItemScreen itemId={itemId} />;
}

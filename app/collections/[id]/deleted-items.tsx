import { useLocalSearchParams } from "expo-router";
import { DeletedItemsScreen } from "../../../src/presentation/screens/items/DeletedItemsScreen";

export default function DeletedItemsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <DeletedItemsScreen collectionId={id} />;
}

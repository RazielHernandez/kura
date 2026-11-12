import { useLocalSearchParams } from "expo-router";
import { CreateItemScreen } from "../../../../../src/presentation/screens/items/CreateItemScreen";


export default function CreateItemRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) return null;

  return <CreateItemScreen collectionId={id} />;
}
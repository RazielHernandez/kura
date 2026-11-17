
import { useLocalSearchParams } from "expo-router";
import { CreateCollectionScreen } from "../../../../src/presentation/screens/collections/CreateCollectionScreen";

export default function EditCollectionRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) return null;

  return <CreateCollectionScreen collectionId={id} />;
}
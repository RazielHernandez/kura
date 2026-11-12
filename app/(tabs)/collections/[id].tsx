
import { useLocalSearchParams } from "expo-router";
import { CollectionDetailsScreen } from "../../../src/presentation/screens/collections/CollectionDetailsScreen";

export default function CollectionDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return null;
  }

  return <CollectionDetailsScreen collectionId={id} />;
}

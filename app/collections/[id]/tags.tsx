import { useLocalSearchParams } from "expo-router";
import { ManageTagsScreen } from "../../../src/presentation/screens/tags/ManageTagsScreen";

export default function ManageTagsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return null;
  }

  return <ManageTagsScreen collectionId={id} />;
}
import { Collection } from "../../../models/Collection";
import { updateCollectionUseCase } from "../../collections/UpdateCollectionUseCase";

export interface UpdateCollectionWorkflowInput {
  collectionId: string;
  name?: string;
  icon?: string | null;
  color?: string | null;
  description?: string | null;
}

export class UpdateCollectionWorkflow {
  async execute(
    input: UpdateCollectionWorkflowInput
  ): Promise<Collection> {
    return updateCollectionUseCase.execute({
      id: input.collectionId,
      name: input.name,
      icon: input.icon,
      color: input.color,
      description: input.description,
    });
  }
}

export const updateCollectionWorkflow = new UpdateCollectionWorkflow();
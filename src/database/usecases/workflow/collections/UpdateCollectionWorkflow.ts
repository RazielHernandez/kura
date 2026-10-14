
import { Collection } from "../../../models/Collection";
import { updateCollectionUseCase } from "../../collections/UpdateCollectionUseCase";
import { validateCollectionUseCase } from "../../collections/ValidateCollectionUseCase";

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
    const validated = validateCollectionUseCase.execute({
      name: input.name,
      icon: input.icon,
      color: input.color,
      description: input.description,
    });

    return updateCollectionUseCase.execute({
      id: input.collectionId,
      ...validated,
    });
  }
}

export const updateCollectionWorkflow = new UpdateCollectionWorkflow();
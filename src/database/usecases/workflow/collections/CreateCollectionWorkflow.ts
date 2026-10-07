
import { Collection } from "../../../models/Collection";
import { FieldType } from "../../../models/CollectionField";
import { databaseService } from "../../../DatabaseService";

import { collectionFieldRepository } from "../../../repositories/CollectionFieldRepository";

import { createCollectionUseCase } from "../../collections/CreateCollectionUseCase";

export interface CreateCollectionWorkflowInput {
  name: string;
  icon?: string | null;
  color?: string | null;
  description?: string | null;

  fields?: Array<{
    name: string;
    fieldType: FieldType;
    required?: boolean;
  }>;
}

export class CreateCollectionWorkflow {
  async execute(
    input: CreateCollectionWorkflowInput
  ): Promise<Collection> {
    return databaseService.transaction(async () => {
      const collection =
        await createCollectionUseCase.execute({
          name: input.name,
          icon: input.icon,
          color: input.color,
          description: input.description,
        });

      if (input.fields?.length) {
        for (const field of input.fields) {
          await collectionFieldRepository.create(
            collection.id,
            field.name,
            field.fieldType,
            {
              required: field.required,
            }
          );
        }
      }

      return collection;
    });
  }
}

export const createCollectionWorkflow = new CreateCollectionWorkflow();
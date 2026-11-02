
import { Collection } from "../../../models/Collection";
import { databaseService } from "../../../DatabaseService";

import { createCollectionUseCase } from "../../collections/CreateCollectionUseCase";
import { createCollectionFieldUseCase } from "../../collectionFields/CreateCollectionFieldUseCase";
import { validateCollectionUseCase } from "../../collections/ValidateCollectionUseCase";
import { validateCollectionFieldsUseCase } from "../../collectionFields/ValidateCollectionFieldsUseCase";

import { FieldType } from "../../../models/CollectionField";

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
  async execute(input: CreateCollectionWorkflowInput): Promise<Collection> {
    // Validate collection properties before opening the transaction.
    const validated = validateCollectionUseCase.execute({
      name: input.name,
      icon: input.icon,
      color: input.color,
      description: input.description,
      requireName: true,
    });

    // Validate initial field names before opening the transaction.
    const fields = input.fields ?? [];

    validateCollectionFieldsUseCase.execute(fields);

    return databaseService.transaction(async () => {
      const collection = await createCollectionUseCase.execute({
        name: validated.name!,
        icon: validated.icon ?? null,
        color: validated.color ?? null,
        description: validated.description ?? null,
      });

      for (const field of fields) {
        await createCollectionFieldUseCase.execute({
          collectionId: collection.id,
          name: field.name.trim(),
          fieldType: field.fieldType,
          required: field.required ?? false,
        });
      }

      return collection;
    });
  }
}

export const createCollectionWorkflow = new CreateCollectionWorkflow();
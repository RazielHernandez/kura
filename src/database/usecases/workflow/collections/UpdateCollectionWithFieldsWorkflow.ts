
import { Collection } from "../../../models/Collection";
import { FieldType } from "../../../models/CollectionField";

import { databaseService } from "../../../DatabaseService";

import { collectionFieldRepository } from "../../../repositories/CollectionFieldRepository";
import { itemValueRepository } from "../../../repositories/ItemValueRepository";

import { updateCollectionUseCase } from "../../collections/UpdateCollectionUseCase";
import { validateCollectionUseCase } from "../../collections/ValidateCollectionUseCase";

import { createCollectionFieldUseCase } from "../../collectionFields/CreateCollectionFieldUseCase";
import { updateCollectionFieldUseCase } from "../../collectionFields/UpdateCollectionFieldUseCase";
import { deleteCollectionFieldUseCase } from "../../collectionFields/DeleteCollectionFieldUseCase";
import { validateCollectionFieldsUseCase } from "../../collectionFields/ValidateCollectionFieldsUseCase";

export interface UpdateCollectionWithFieldsWorkflowInput {
  collectionId: string;

  name: string;
  icon?: string | null;
  color?: string | null;
  description?: string | null;

  fields: Array<{
    id?: string;
    name: string;
    fieldType: FieldType;
    required: boolean;
  }>;
}

export class UpdateCollectionWithFieldsWorkflow {
  async execute(
    input: UpdateCollectionWithFieldsWorkflowInput
  ): Promise<Collection> {
    const collectionId = input.collectionId.trim();

    if (!collectionId) {
      throw new Error("Collection ID is required");
    }

    // Validate collection metadata.
    const validatedCollection = validateCollectionUseCase.execute({
      name: input.name,
      icon: input.icon,
      color: input.color,
      description: input.description,
      requireName: true,
    });

    // Validate field definitions.
    validateCollectionFieldsUseCase.execute(
      input.fields.map((field) => ({
        name: field.name,
        fieldType: field.fieldType,
        required: field.required,
      }))
    );

    // Prevent duplicate field IDs in the submitted form.
    const submittedIds = input.fields
      .map((field) => field.id)
      .filter((id): id is string => Boolean(id));

    if (new Set(submittedIds).size !== submittedIds.length) {
      throw new Error("Duplicate collection field IDs are not allowed");
    }

    return databaseService.transaction(async () => {
      const existingFields =
        await collectionFieldRepository.getByCollectionId(collectionId);

      const existingFieldsById = new Map(
        existingFields.map((field) => [field.id, field])
      );

      // Ensure submitted IDs belong to this collection.
      for (const id of submittedIds) {
        if (!existingFieldsById.has(id)) {
          throw new Error("A submitted field does not belong to this collection");
        }
      }

      // Update collection metadata.
      const collection = await updateCollectionUseCase.execute({
        id: collectionId,
        name: validatedCollection.name!,
        icon: validatedCollection.icon,
        color: validatedCollection.color,
        description: validatedCollection.description,
      });

      // Create or update submitted fields.
      for (const [index, field] of input.fields.entries()) {
        const sortOrder = index;

        if (!field.id) {
          await createCollectionFieldUseCase.execute({
            collectionId,
            name: field.name.trim(),
            fieldType: field.fieldType,
            required: field.required,
          });

          continue;
        }

        const existingField = existingFieldsById.get(field.id)!;

        // Don't change the type if existing items contain values.
        if (existingField.fieldType !== field.fieldType) {
            const values =
                await itemValueRepository.getNonEmptyByFieldIdForActiveItems(
                existingField.id
                );

            if (values.length > 0) {
                throw new Error(
                `The type of "${existingField.name}" cannot be changed because active items contain values for this field.`
                );
            }
        }

        await updateCollectionFieldUseCase.execute({
          id: field.id,
          name: field.name.trim(),
          fieldType: field.fieldType,
          required: field.required,
          sortOrder,
        });
      }

      // Soft-delete fields removed from the form.
      const submittedIdSet = new Set(submittedIds);

      for (const existingField of existingFields) {
        if (!submittedIdSet.has(existingField.id)) {
          await deleteCollectionFieldUseCase.execute(
            existingField.id
          );
        }
      }

      return collection;
    });
  }
}

export const updateCollectionWithFieldsWorkflow = new UpdateCollectionWithFieldsWorkflow();

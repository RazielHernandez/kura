import { databaseService } from "../../../DatabaseService";
import { Tag } from "../../../models/Tag";
import { createTagUseCase } from "../../tags/CreateTagUseCase";

export interface CreateTagWorkflowInput {
  collectionId: string;
  name: string;
  color?: string | null;
}

export class CreateTagWorkflow {
  async execute(input: CreateTagWorkflowInput): Promise<Tag> {
    return databaseService.transaction(async () => {
      return createTagUseCase.execute(input);
    });
  }
}

export const createTagWorkflow = new CreateTagWorkflow();

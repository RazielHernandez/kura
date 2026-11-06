import { databaseService } from "../../../DatabaseService";
import { setItemTagsUseCase } from "../../itemTags/SetItemTagsUseCase";

export interface SetItemTagsWorkflowInput {
  itemId: string;
  tagIds: string[];
}

export class SetItemTagsWorkflow {
  async execute(input: SetItemTagsWorkflowInput): Promise<void> {
    await databaseService.transaction(async () => {
      await setItemTagsUseCase.execute(input);
    });
  }
}

export const setItemTagsWorkflow = new SetItemTagsWorkflow();

import { databaseService } from "../../../DatabaseService";
import { Tag } from "../../../models/Tag";
import { UpdateTagInput, updateTagUseCase } from "../../tags/UpdateTagUseCase";

export class UpdateTagWorkflow {
  async execute(input: UpdateTagInput): Promise<Tag> {
    return databaseService.transaction(async () => {
      return updateTagUseCase.execute(input);
    });
  }
}

export const updateTagWorkflow = new UpdateTagWorkflow();

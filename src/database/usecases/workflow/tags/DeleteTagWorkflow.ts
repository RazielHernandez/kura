import { databaseService } from "../../../DatabaseService";
import { itemTagRepository } from "../../../repositories/ItemTagRepository";
import { deleteTagUseCase } from "../../tags/DeleteTagUseCase";

export class DeleteTagWorkflow {
  async execute(tagId: string): Promise<void> {
    await databaseService.transaction(async () => {
      await deleteTagUseCase.execute(tagId);
      await itemTagRepository.removeAllForTag(tagId);
    });
  }
}

export const deleteTagWorkflow = new DeleteTagWorkflow();

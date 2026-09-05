import { appSettingsRepository } from "../../repositories/AppSettingsRepository";
import { AppSetting } from "../../models/AppSetting";

export class GetSettingsUseCase {
  async execute(): Promise<AppSetting[]> {
    return appSettingsRepository.getAll();
  }
}

export const getSettingsUseCase = new GetSettingsUseCase();
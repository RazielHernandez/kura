import { appSettingsRepository } from "../../repositories/AppSettingsRepository";

export class GetSettingUseCase {
  async execute(key: string): Promise<string | null> {
    return appSettingsRepository.get(key);
  }
}

export const getSettingUseCase = new GetSettingUseCase();
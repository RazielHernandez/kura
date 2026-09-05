import { appSettingsRepository } from "../../repositories/AppSettingsRepository";

export class RemoveSettingUseCase {
  async execute(key: string): Promise<void> {
    await appSettingsRepository.remove(key);
  }
}

export const removeSettingUseCase = new RemoveSettingUseCase();
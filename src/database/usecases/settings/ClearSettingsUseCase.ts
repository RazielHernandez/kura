import { appSettingsRepository } from "../../repositories/AppSettingsRepository";

export class ClearSettingsUseCase {
  async execute(): Promise<void> {
    await appSettingsRepository.clear();
  }
}

export const clearSettingsUseCase = new ClearSettingsUseCase();
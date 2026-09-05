import { appSettingsRepository } from "../../repositories/AppSettingsRepository";

export class SetSettingUseCase {
  async execute(
    key: string,
    value: string | null
  ): Promise<void> {
    await appSettingsRepository.set(key, value);
  }
}

export const setSettingUseCase = new SetSettingUseCase();
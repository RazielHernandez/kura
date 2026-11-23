import { create } from "zustand";

import { DashboardData } from "../../models/DashboardData";
import { getDashboardDataUseCase } from "../../usecases/dashboard/GetDashboardDataUseCase";

interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;

  loadDashboard: () => Promise<void>;
  clearDashboard: () => void;
}

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  return error instanceof Error ? error.message : fallback;
}

export const useDashboardStore = create<DashboardState>((set) => {
  let latestRequestId = 0;

  return {
    data: null,
    isLoading: false,
    error: null,

    loadDashboard: async () => {
      const requestId = ++latestRequestId;

      set({
        isLoading: true,
        error: null,
      });

      try {
        const data = await getDashboardDataUseCase.execute();

        if (requestId !== latestRequestId) {
          return;
        }

        set({
          data,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (requestId !== latestRequestId) {
          return;
        }

        set({
          isLoading: false,
          error: getErrorMessage(
            error,
            "Unable to load dashboard."
          ),
        });
      }
    },

    clearDashboard: () => {
      latestRequestId += 1;

      set({
        data: null,
        isLoading: false,
        error: null,
      });
    },
  };
});
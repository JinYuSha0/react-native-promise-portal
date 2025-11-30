import { create } from 'zustand';
import { type PortalState, PortalManager } from '../../src/Portal';

interface PagePortalsState {
  // Homepage portal content
  homePortalContent: Map<string, PortalState>;
  setHomePortalContent: (
    action: React.SetStateAction<Map<string, PortalState>>
  ) => void;
}

/**
 * Use Zustand to manage the portal for the homepage and video area
 * Invoke the modal without using hooks, suitable for scenarios where the modal is invoked without UI interaction
 */
export const useLocalPortals = create<PagePortalsState>((set) => ({
  homePortalContent: new Map(),

  setHomePortalContent: (
    action: React.SetStateAction<Map<string, PortalState>>
  ) =>
    set((state) => {
      if (typeof action === 'function') {
        return {
          ...state,
          homePortalContent: action(state.homePortalContent),
        };
      }
      return { ...state, homePortalContent: action };
    }),
}));

export const HomePagePortalManager = new PortalManager(
  useLocalPortals.getState().setHomePortalContent
);

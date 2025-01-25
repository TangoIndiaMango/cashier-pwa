import { create } from "zustand";

interface PoinstState {
  loyaltyPoints: number;
  newLoyaltyPoints: number;
  creditNotePoints: number;
  newCreditNotePoints: number;
  setLoyaltyPoints: (by: number) => void;
  setNewLoyaltyPoints: (by: number) => void;
  setCreditNotePoints: (by: number) => void;
  setNewCreditNotePoints: (by: number) => void;
  clearPoints: () => void;
}

export const useApplyPoints = create<PoinstState>()((set) => ({
  loyaltyPoints: 0,
  newLoyaltyPoints: 0,
  creditNotePoints: 0,
  newCreditNotePoints:0,
  setLoyaltyPoints: (by) => set(() => ({ loyaltyPoints: by })),
  setNewLoyaltyPoints: (by) => set(() => ({ newLoyaltyPoints: by })),
  setCreditNotePoints: (by) => set(() => ({ creditNotePoints: by })),
  setNewCreditNotePoints: (by) => set(() => ({ newCreditNotePoints: by })),
  clearPoints: () => set(() => ({ loyaltyPoints: 0, newLoyaltyPoints: 0, creditNotePoints: 0, newCreditNotePoints: 0})),
}));

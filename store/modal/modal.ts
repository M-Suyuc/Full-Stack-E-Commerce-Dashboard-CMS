import { create } from 'zustand'

interface ModalState {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useStoreModal = create<ModalState>()((set, get) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false })
}))

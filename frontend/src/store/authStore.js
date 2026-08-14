import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
      hasPermission: (permissionCode) => {
        const user = get().user;
        if (!user) return false;

        for (const role of user.roles) {
          if (role.permissions.some((p) => p.code === permissionCode)) {
            return true;
          }
        }
        return false;
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);
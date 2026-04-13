import { supabaseApi } from "./supabase";

export const authService = {
  async signUp(payload: any) {
    const { data } = await supabaseApi.post("/auth/v1/signup", payload);
    return data;
  },

  async signIn(payload: any) {
    const { data } = await supabaseApi.post(
      "/auth/v1/token?grant_type=password",
      payload,
    );
    if (data.access_token) {
      this.setSession(data);
    }
    return data;
  },

  async signOut() {
    await supabaseApi.post("/auth/v1/logout");
    this.clearSession();
  },

  async getUser() {
    const { data } = await supabaseApi.get("/auth/v1/user");
    return data;
  },

  async refreshToken(refreshToken: string) {
    const { data } = await supabaseApi.post(
      "/auth/v1/token?grant_type=refresh_token",
      {
        refresh_token: refreshToken,
      },
    );
    if (data.access_token) {
      this.setSession(data);
    }
    return data;
  },

  setSession(session: any) {
    localStorage.setItem("supabase-session", JSON.stringify(session));
  },

  getSession() {
    const session = localStorage.getItem("supabase-session");
    return session ? JSON.parse(session) : null;
  },

  clearSession() {
    localStorage.removeItem("supabase-session");
    localStorage.clear();
    sessionStorage.clear();
  },
};

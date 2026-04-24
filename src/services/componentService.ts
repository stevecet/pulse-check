import type { Component } from "../lib/types";
import { supabaseApi } from "./supabase";

export const componentService = {
  async getAll() {
    const { data } = await supabaseApi.get("/rest/v1/components?select=*");
    return data;
  },

  async create(payload: Partial<Component>) {
    const { data } = await supabaseApi.post("/rest/v1/components", [payload], {
      headers: {
        Prefer: "return=representation",
        Accept: "application/vnd.pgrst.object+json",
      },
    });
    return data;
  },

  async update(id: string, payload: Partial<Component>) {
    const { data } = await supabaseApi.patch(
      `/rest/v1/components?id=eq.${id}`,
      payload,
      {
        headers: {
          Prefer: "return=representation",
          Accept: "application/vnd.pgrst.object+json",
        },
      },
    );
    return data;
  },

  async delete(id: string | null) {
    await supabaseApi.delete(`/rest/v1/components?id=eq.${id}`);
    return true;
  },
};

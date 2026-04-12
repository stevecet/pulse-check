import type { Component } from "../lib/types";
import { supabase } from "./supabase";

export const componentService = {
  async getAll() {
    const { data, error } = await supabase.from("components").select("*");
    if (error) throw error;
    return data;
  },

  async create(payload: Partial<Component>) {
    const { data, error } = await supabase
      .from("components")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, payload: Partial<Component>) {
    const { data, error } = await supabase
      .from("components")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string | null) {
    const { error } = await supabase.from("components").delete().eq("id", id);

    if (error) throw error;
    return true;
  },
};

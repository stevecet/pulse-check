import type { Incident } from "../lib/types";
import { supabase } from "./supabase";

export const incidentService = {
  async getAll() {
    const { data, error } = await supabase.from("incidents").select("*");
    if (error) throw error;
    return data;
  },

  async getByIdWithComponents(id: string) {
    const { data, error } = await supabase
      .from("incidents")
      .select(
        `
          *,
          incident_components (
            component:components (*)
          )
        `,
      )
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload: Incident) {
    const { data, error } = await supabase
      .from("incidents")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, payload: Incident) {
    const { data, error } = await supabase
      .from("incidents")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from("incidents").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  async addComponents(incidentId: string, componentIds: string[]) {
    if (componentIds.length === 0) return [];
    const payload = componentIds.map((componentId) => ({
      incident_id: incidentId,
      component_id: componentId,
    }));
    const { data, error } = await supabase
      .from("incident_components")
      .insert(payload)
      .select();
    if (error) throw error;
    return data;
  },

  async removeComponents(incidentId: string) {
    const { error } = await supabase
      .from("incident_components")
      .delete()
      .eq("incident_id", incidentId);
    if (error) throw error;
    return true;
  },

  async getUpdates(incidentId: string) {
    const { data, error } = await supabase
      .from("incident_updates")
      .select("*")
      .eq("incident_id", incidentId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async addUpdate(incidentId: string, message: string) {
    const { data, error } = await supabase
      .from("incident_updates")
      .insert([{ incident_id: incidentId, message }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async addUpdates(incidentId: string, messages: string[]) {
    if (messages.length === 0) return [];
    const { data, error } = await supabase
      .from("incident_updates")
      .insert(messages.map((message) => ({ incident_id: incidentId, message })))
      .select();
    if (error) throw error;
    return data;
  },

  async deleteUpdate(updateId: string) {
    const { error } = await supabase
      .from("incident_updates")
      .delete()
      .eq("id", updateId);
    if (error) throw error;
    return true;
  },
};

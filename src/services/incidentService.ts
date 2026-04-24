import type { Incident } from "../lib/types";
import { supabaseApi } from "./supabase";

export const incidentService = {
  async getAll() {
    const { data } = await supabaseApi.get("/rest/v1/incidents?select=*");
    return data;
  },

  async getByIdWithComponents(id: string) {
    const selectStr = "*,incident_components(component:components(*))";

    const { data } = await supabaseApi.get(`/rest/v1/incidents`, {
      params: {
        id: `eq.${id}`,
        select: selectStr,
      },
      headers: {
        Accept: "application/vnd.pgrst.object+json",
      },
    });
    return data;
  },

  async create(payload: Incident) {
    const { data } = await supabaseApi.post("/rest/v1/incidents", [payload], {
      headers: {
        Prefer: "return=representation",
        Accept: "application/vnd.pgrst.object+json",
      },
    });
    return data;
  },

  async update(id: string, payload: Incident) {
    const { data } = await supabaseApi.patch(
      `/rest/v1/incidents?id=eq.${id}`,
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

  async delete(id: string) {
    await supabaseApi.delete(`/rest/v1/incidents?id=eq.${id}`);
    return true;
  },

  async addComponents(incidentId: string, componentIds: string[]) {
    if (componentIds.length === 0) return [];
    const payload = componentIds.map((componentId) => ({
      incident_id: incidentId,
      component_id: componentId,
    }));
    const { data } = await supabaseApi.post(
      "/rest/v1/incident_components",
      payload,
      {
        headers: {
          Prefer: "return=representation",
        },
      },
    );
    return data;
  },

  async removeComponents(incidentId: string) {
    await supabaseApi.delete(
      `/rest/v1/incident_components?incident_id=eq.${incidentId}`,
    );
    return true;
  },

  async getUpdates(incidentId: string) {
    const { data } = await supabaseApi.get(
      `/rest/v1/incident_updates?incident_id=eq.${incidentId}&order=created_at.desc`,
    );
    return data;
  },

  async addUpdate(incidentId: string, message: string) {
    const { data } = await supabaseApi.post(
      "/rest/v1/incident_updates",
      [{ incident_id: incidentId, message }],
      {
        headers: {
          Prefer: "return=representation",
          Accept: "application/vnd.pgrst.object+json",
        },
      },
    );
    return data;
  },

  async addUpdates(incidentId: string, messages: string[]) {
    if (messages.length === 0) return [];
    const { data } = await supabaseApi.post(
      "/rest/v1/incident_updates",
      messages.map((message) => ({ incident_id: incidentId, message })),
      {
        headers: {
          Prefer: "return=representation",
        },
      },
    );
    return data;
  },

  async deleteUpdate(updateId: string) {
    await supabaseApi.delete(`/rest/v1/incident_updates?id=eq.${updateId}`);
    return true;
  },
};

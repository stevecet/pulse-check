import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Incident } from "../lib/types";
import { incidentService } from "../services/incidentService";

export const useIncidents = () => {
    return useQuery({
        queryKey: ["incidents"],
        queryFn: incidentService.getAll
    });
};

export const useIncidentsWithComponents = (id: string) => {
    return useQuery({
        queryKey: ["incidents", id],
        queryFn: () => incidentService.getByIdWithComponents(id)
    });
};

export const useCreateIncident = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: any) => {
            const { components, ...incidentData } = formData;

            const newIncident = await incidentService.create(incidentData);

            if (components?.length) {
                await incidentService.addComponents(newIncident.id, components);
            }

            return newIncident;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["incidents"] });
        },
    });
};

export const useUpdateIncident = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string, payload: Incident }) =>
            incidentService.update(id, payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["incidents"] });
        },
    });
};
export const useDeleteIncident = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            incidentService.delete(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["incidents"] });
        },
    });
};
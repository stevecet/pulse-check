import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { componentService } from "../services/componentService";
import type { Component } from "../lib/types";

export const useComponents = () => {
    return useQuery({
        queryKey: ["components"],
        queryFn: componentService.getAll
    });
};

export const useCreateComponent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: componentService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["components"] });
        },
    });
};

export const useUpdateComponent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string, payload: Partial<Component> }) =>
            componentService.update(id, payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["components"] });
        },
    });
};
export const useDeleteComponent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            componentService.delete(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["components"] });
        },
    });
};
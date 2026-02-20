import {
  type CreateOrganizationSchema,
  type CreateOrganizationResponse,
  type GetOrganizationsResponse,
  type GetOrganizationResponse,
} from "@repo/shared";
import axiosInstance from "@/api";

export const organizationApi = {
  getOrganizations: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await axiosInstance.get<GetOrganizationsResponse>(
      "/organizations",
      { params },
    );
    return response.data;
  },

  getOrganizationBySlug: async (slug: string) => {
    const response = await axiosInstance.get<GetOrganizationResponse>(
      `/organizations/${slug}`,
    );
    return response.data;
  },

  createOrganization: async (payload: CreateOrganizationSchema) => {
    const response = await axiosInstance.post<CreateOrganizationResponse>(
      "/organizations",
      payload,
    );
    return response.data;
  },
};

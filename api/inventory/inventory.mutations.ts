import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from './inventory.api';
import { inventoryKeys } from './inventory.queries';
import { toast } from 'sonner';

// ==========================================
// BUSINESS MUTATIONS
// ==========================================
export const useCreateBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => inventoryApi.createBusiness(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.businesses() });
      toast.success('Business created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create business');
    },
  });
};

export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => inventoryApi.updateBusiness(id, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.businesses() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.business(variables.id) });
      toast.success('Business updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update business');
    },
  });
};

export const useDeleteBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteBusiness(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.businesses() });
      toast.success('Business deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete business');
    },
  });
};

export const useCreateBusinessUser = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string; email: string; password?: string; roleId?: string | number; status?: string }) =>
      inventoryApi.createBusinessUser(businessId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.businessUsers(businessId) });
      toast.success('User created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create user');
    },
  });
};

export const useUpdateBusinessUser = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, dto }: { userId: string; dto: any }) =>
      inventoryApi.updateBusinessUser(businessId, userId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.businessUsers(businessId) });
      toast.success('User updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update user');
    },
  });
};

// ==========================================
// PRODUCT MUTATIONS
// ==========================================
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => inventoryApi.createProduct(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products() });
      toast.success('Product created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create product');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => inventoryApi.updateProduct(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products() });
      toast.success('Product updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update product');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products() });
      toast.success('Product deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete product');
    },
  });
};

// ==========================================
// CATEGORY MUTATIONS
// ==========================================
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string; businessId?: string | number }) => inventoryApi.createCategory(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.categories() });
      toast.success('Category created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create category');
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: { name: string } }) => inventoryApi.updateCategory(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.categories() });
      toast.success('Category updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update category');
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => inventoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.categories() });
      toast.success('Category deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete category');
    },
  });
};

// ==========================================
// BRAND MUTATIONS
// ==========================================
export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string; manufacturer?: string }) => inventoryApi.createBrand(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.brands() });
      toast.success('Brand created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create brand');
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { name?: string; manufacturer?: string } }) => inventoryApi.updateBrand(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.brands() });
      toast.success('Brand updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update brand');
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.brands() });
      toast.success('Brand deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete brand');
    },
  });
};

// ==========================================
// UNIT MUTATIONS
// ==========================================
export const useCreateUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string; abbreviation: string; businessId?: string | number }) => inventoryApi.createUnit(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.units() });
      toast.success('Unit created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create unit');
    },
  });
};

export const useUpdateUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { name?: string; abbreviation?: string } }) => inventoryApi.updateUnit(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.units() });
      toast.success('Unit updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update unit');
    },
  });
};

export const useDeleteUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.units() });
      toast.success('Unit deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete unit');
    },
  });
};

// ==========================================
// WHATSAPP NUMBER MUTATIONS
// ==========================================
export const useCreateWhatsappNumber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => inventoryApi.createWhatsappNumber(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.whatsappNumbers() });
      toast.success('WhatsApp number registered successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to add WhatsApp number');
    },
  });
};

export const useUpdateWhatsappNumber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => inventoryApi.updateWhatsappNumber(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.whatsappNumbers() });
      toast.success('WhatsApp number updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update WhatsApp number');
    },
  });
};

export const useDeleteWhatsappNumber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteWhatsappNumber(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.whatsappNumbers() });
      toast.success('WhatsApp number disconnected');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to disconnect WhatsApp number');
    },
  });
};

// ==========================================
// SUBSCRIPTION MUTATIONS
// ==========================================
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => inventoryApi.createSubscription(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.subscriptions() });
      toast.success('Subscription assigned successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to assign subscription');
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => inventoryApi.updateSubscription(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.subscriptions() });
      toast.success('Subscription updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update subscription');
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.cancelSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.subscriptions() });
      toast.success('Subscription cancelled');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to cancel subscription');
    },
  });
};

export const useExtendSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, days = 30 }: { id: string; days?: number }) => inventoryApi.extendSubscription(id, days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.subscriptions() });
      toast.success('Subscription extended successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to extend subscription');
    },
  });
};

export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.subscriptions() });
      toast.success('Subscription deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete subscription');
    },
  });
};

// ==========================================
// ADMINS & ROLES MUTATIONS
// ==========================================
export const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string; email: string; password?: string; roleId?: string | number; status?: string }) =>
      inventoryApi.createAdmin(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.admins() });
      toast.success('Admin created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create admin');
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => inventoryApi.updateAdmin(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.admins() });
      toast.success('Admin updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update admin');
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.admins() });
      toast.success('Admin deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete admin');
    },
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string; description?: string; permissions?: string[] }) =>
      inventoryApi.createRole(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.roles() });
      toast.success('Role created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create role');
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => inventoryApi.updateRole(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.roles() });
      toast.success('Role updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update role');
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.roles() });
      toast.success('Role deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete role');
    },
  });
};

// ==========================================
// PLATFORM USERS MUTATIONS
// ==========================================
export const useUpdatePlatformUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      inventoryApi.updatePlatformUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.platformUsers() });
      toast.success('User status updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update user status');
    },
  });
};

// ==========================================
// BROADCAST MUTATIONS
// ==========================================
export const useSendBroadcast = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { title: string; message: string; target?: string; businessId?: string }) =>
      inventoryApi.sendBroadcast(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.broadcasts() });
      toast.success('Broadcast sent successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to send broadcast');
    },
  });
};

export const useDeleteBroadcast = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteBroadcast(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.broadcasts() });
      toast.success('Broadcast campaign deleted');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete broadcast');
    },
  });
};

// ==========================================
// REFERRAL MUTATIONS
// ==========================================
export const useCreateReferralTier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => inventoryApi.createReferralTier(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.referralTiers() });
      toast.success('Referral tier created');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create tier');
    },
  });
};

export const useUpdateReferralTier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => inventoryApi.updateReferralTier(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.referralTiers() });
      toast.success('Referral tier updated');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update tier');
    },
  });
};

export const useDeleteReferralTier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteReferralTier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.referralTiers() });
      toast.success('Referral tier deleted');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete tier');
    },
  });
};

export const useCreatePointConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => inventoryApi.createPointConfig(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.pointConfigs() });
      toast.success('Point configuration created');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create config');
    },
  });
};

export const useUpdatePointConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => inventoryApi.updatePointConfig(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.pointConfigs() });
      toast.success('Point configuration updated');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update config');
    },
  });
};

export const useDeletePointConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.deletePointConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.pointConfigs() });
      toast.success('Point configuration deleted');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete config');
    },
  });
};

// ==========================================
// TESTIMONIAL MUTATIONS
// ==========================================
export const useCreateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => inventoryApi.createTestimonial(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.testimonials() });
      toast.success('Testimonial added successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create testimonial');
    },
  });
};

export const useUpdateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: any }) => inventoryApi.updateTestimonial(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.testimonials() });
      toast.success('Testimonial updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update testimonial');
    },
  });
};

export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => inventoryApi.deleteTestimonial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.testimonials() });
      toast.success('Testimonial deleted');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete testimonial');
    },
  });
};

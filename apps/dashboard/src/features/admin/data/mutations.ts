import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import {
  BanUserDocument,
  CreateAdPopupDocument,
  CreateAdRedirectDocument,
  CreatePostDocument,
  CreateVanHanEntryDocument,
  DeleteAdPopupDocument,
  DeleteAdRedirectDocument,
  DeletePostDocument,
  ToggleAdPopupActiveDocument,
  ToggleAdRedirectActiveDocument,
  ToggleVanHanPublishedDocument,
  UpdateAdPopupDocument,
  UpdateAdRedirectDocument,
  UpdatePostDocument,
  UpdateVanHanEntryDocument,
  type CreateAdPopupInput,
  type CreateAdRedirectInput,
  type CreatePostInput,
  type CreateVanHanEntryInput,
  type UpdateAdPopupInput,
  type UpdateAdRedirectInput,
  type UpdatePostInput,
  type UpdateVanHanEntryInput,
} from '@/lib/graphql/generated';

const USERS_KEY = ['admin', 'users'];
const BLOG_KEY = ['admin', 'blog'];
const ADS_KEY = ['admin', 'ads'];
const VAN_HAN_KEY = ['admin', 'van-han'];

export function useBanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => graphqlClient.request(BanUserDocument, { id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePostInput) => graphqlClient.request(CreatePostDocument, { input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: BLOG_KEY }),
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; input: UpdatePostInput }) =>
      graphqlClient.request(UpdatePostDocument, vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: BLOG_KEY }),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => graphqlClient.request(DeletePostDocument, { id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: BLOG_KEY }),
  });
}

export function useCreateAdRedirect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAdRedirectInput) =>
      graphqlClient.request(CreateAdRedirectDocument, { input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADS_KEY }),
  });
}

export function useUpdateAdRedirect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; input: UpdateAdRedirectInput }) =>
      graphqlClient.request(UpdateAdRedirectDocument, vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADS_KEY }),
  });
}

export function useToggleAdRedirectActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => graphqlClient.request(ToggleAdRedirectActiveDocument, { id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADS_KEY }),
  });
}

export function useDeleteAdRedirect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => graphqlClient.request(DeleteAdRedirectDocument, { id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADS_KEY }),
  });
}

export function useCreateAdPopup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAdPopupInput) =>
      graphqlClient.request(CreateAdPopupDocument, { input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADS_KEY }),
  });
}

export function useUpdateAdPopup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; input: UpdateAdPopupInput }) =>
      graphqlClient.request(UpdateAdPopupDocument, vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADS_KEY }),
  });
}

export function useToggleAdPopupActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => graphqlClient.request(ToggleAdPopupActiveDocument, { id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADS_KEY }),
  });
}

export function useDeleteAdPopup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => graphqlClient.request(DeleteAdPopupDocument, { id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADS_KEY }),
  });
}

export function useCreateVanHanEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVanHanEntryInput) =>
      graphqlClient.request(CreateVanHanEntryDocument, { input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: VAN_HAN_KEY }),
  });
}

export function useUpdateVanHanEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; input: UpdateVanHanEntryInput }) =>
      graphqlClient.request(UpdateVanHanEntryDocument, vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: VAN_HAN_KEY }),
  });
}

export function useToggleVanHanPublished() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => graphqlClient.request(ToggleVanHanPublishedDocument, { id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: VAN_HAN_KEY }),
  });
}

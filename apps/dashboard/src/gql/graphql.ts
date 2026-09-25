/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Role =
  | 'ADMIN'
  | 'SELLER'
  | 'SUPER_ADMIN'
  | 'USER';

export type AdminUsersQueryVariables = Exact<{
  page?: number | null | undefined;
  limit?: number | null | undefined;
  search?: string | null | undefined;
}>;


export type AdminUsersQuery = { users: { total: number, users: Array<{ id: string, email: string, displayName: string | null, avatar: string | null, role: Role, isEmailVerified: boolean, balance: number, createdAt: string, genCount: number, lastActiveAt: string | null }> } };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const AdminUsersDocument = new TypedDocumentString(`
    query AdminUsers($page: Int, $limit: Int, $search: String) {
  users(page: $page, limit: $limit, search: $search) {
    total
    users {
      id
      email
      displayName
      avatar
      role
      isEmailVerified
      balance
      createdAt
      genCount
      lastActiveAt
    }
  }
}
    `) as unknown as TypedDocumentString<AdminUsersQuery, AdminUsersQueryVariables>;
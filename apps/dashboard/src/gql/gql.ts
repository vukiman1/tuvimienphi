/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query AdminUsers($page: Int, $limit: Int, $search: String) {\n    users(page: $page, limit: $limit, search: $search) {\n      total\n      users {\n        id\n        email\n        displayName\n        avatar\n        role\n        isEmailVerified\n        balance\n        createdAt\n        genCount\n        lastActiveAt\n      }\n    }\n  }\n": typeof types.AdminUsersDocument,
};
const documents: Documents = {
    "\n  query AdminUsers($page: Int, $limit: Int, $search: String) {\n    users(page: $page, limit: $limit, search: $search) {\n      total\n      users {\n        id\n        email\n        displayName\n        avatar\n        role\n        isEmailVerified\n        balance\n        createdAt\n        genCount\n        lastActiveAt\n      }\n    }\n  }\n": types.AdminUsersDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AdminUsers($page: Int, $limit: Int, $search: String) {\n    users(page: $page, limit: $limit, search: $search) {\n      total\n      users {\n        id\n        email\n        displayName\n        avatar\n        role\n        isEmailVerified\n        balance\n        createdAt\n        genCount\n        lastActiveAt\n      }\n    }\n  }\n"): typeof import('./graphql').AdminUsersDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

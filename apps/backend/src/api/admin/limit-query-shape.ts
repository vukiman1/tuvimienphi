import {
  GraphQLError,
  type ASTVisitor,
  type OperationDefinitionNode,
  type SelectionSetNode,
  type ValidationContext,
  type ValidationRule,
} from 'graphql';

export interface QueryShapeLimits {
  maxRootFields: number;
  maxDepth: number;
  maxTotalFields: number;
}

interface Measurement {
  rootFields: number;
  depth: number;
  fields: number;
}

function isIntrospectionOperation(node: OperationDefinitionNode): boolean {
  return node.selectionSet.selections.every(
    (selection) => selection.kind === 'Field' && selection.name.value.startsWith('__'),
  );
}

function measure(
  selectionSet: SelectionSetNode,
  context: ValidationContext,
  visited: Set<string>,
  measured: Map<string, Measurement>,
): Measurement {
  let rootFields = 0;
  let depth = 0;
  let fields = 0;

  for (const selection of selectionSet.selections) {
    if (selection.kind === 'Field') {
      rootFields += 1;
      const child = selection.selectionSet
        ? measure(selection.selectionSet, context, visited, measured)
        : { rootFields: 0, depth: 0, fields: 0 };
      depth = Math.max(depth, child.depth + 1);
      fields += 1 + child.fields;
      continue;
    }

    if (selection.kind === 'InlineFragment') {
      const inline = measure(selection.selectionSet, context, visited, measured);
      rootFields += inline.rootFields;
      depth = Math.max(depth, inline.depth);
      fields += inline.fields;
      continue;
    }

    const name = selection.name.value;
    if (visited.has(name)) {
      continue;
    }
    const fragment = context.getFragment(name);
    if (!fragment) {
      continue;
    }
    const cached = measured.get(name);
    if (cached) {
      rootFields += cached.rootFields;
      depth = Math.max(depth, cached.depth);
      fields += cached.fields;
      continue;
    }
    visited.add(name);
    const spread = measure(fragment.selectionSet, context, visited, measured);
    visited.delete(name);
    measured.set(name, spread);
    rootFields += spread.rootFields;
    depth = Math.max(depth, spread.depth);
    fields += spread.fields;
  }

  return { rootFields, depth, fields };
}

export function limitQueryShape({
  maxRootFields,
  maxDepth,
  maxTotalFields,
}: QueryShapeLimits): ValidationRule {
  return (context: ValidationContext): ASTVisitor => ({
    OperationDefinition(node) {
      if (isIntrospectionOperation(node)) {
        return false;
      }

      const { rootFields, depth, fields } = measure(
        node.selectionSet,
        context,
        new Set(),
        new Map(),
      );
      if (fields > maxTotalFields) {
        context.reportError(
          new GraphQLError(`A query may select at most ${maxTotalFields} fields in total.`),
        );
      }
      if (rootFields > maxRootFields) {
        context.reportError(
          new GraphQLError(`A query may request at most ${maxRootFields} top-level fields.`),
        );
      }
      if (depth > maxDepth) {
        context.reportError(
          new GraphQLError(`A query may not nest deeper than ${maxDepth} levels.`),
        );
      }
      return false;
    },
  });
}

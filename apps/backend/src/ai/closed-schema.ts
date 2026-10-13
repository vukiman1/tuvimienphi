import type { AiSchema } from './ai.types';

export type JsonSchema = Record<string, unknown>;

export function closedSchema(schema: AiSchema): JsonSchema {
  const closed: JsonSchema = { type: schema.type };
  if (schema.description) {
    closed['description'] = schema.description;
  }
  if (schema.type === 'object') {
    closed['properties'] = Object.fromEntries(
      Object.entries(schema.properties ?? {}).map(([name, property]) => [
        name,
        closedSchema(property),
      ]),
    );
    closed['required'] = [...(schema.required ?? [])];
    closed['additionalProperties'] = false;
  }
  if (schema.items) {
    closed['items'] = closedSchema(schema.items);
  }
  return closed;
}

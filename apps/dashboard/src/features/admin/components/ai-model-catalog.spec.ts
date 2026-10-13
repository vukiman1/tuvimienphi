import { describe, expect, it } from 'vitest';
import type { AiProvider } from '../../../gql/graphql';
import {
  AI_MODEL_CATALOG,
  catalogModel,
  defaultModels,
  modelOptionGroups,
} from './ai-model-catalog';
import { isModelId } from './ai-provider-model';

const PROVIDERS = Object.keys(AI_MODEL_CATALOG) as AiProvider[];

describe('AI_MODEL_CATALOG', () => {
  it.each(PROVIDERS)(
    'recommends exactly one model for %s and starts the defaults with it',
    (provider) => {
      const recommended = AI_MODEL_CATALOG[provider].models.filter(
        (model) => model.badge === 'RECOMMENDED',
      );

      expect(recommended).toHaveLength(1);
      expect(defaultModels(provider)[0]).toBe(recommended[0].id);
    },
  );

  it.each(PROVIDERS)('only defaults %s to models it also describes', (provider) => {
    for (const id of defaultModels(provider)) {
      expect(catalogModel(provider, id)).toBeDefined();
    }
  });

  it.each(PROVIDERS)('lists ids for %s that the save form will accept, each once', (provider) => {
    const ids = AI_MODEL_CATALOG[provider].models.map((model) => model.id);

    expect(ids.every(isModelId)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(PROVIDERS)('points %s at pages on the provider’s own site', (provider) => {
    expect(AI_MODEL_CATALOG[provider].keyUrl).toMatch(/^https:\/\//);
    expect(AI_MODEL_CATALOG[provider].docsUrl).toMatch(/^https:\/\//);
  });

  it('hands out a copy of the defaults, so a form cannot change the catalog', () => {
    defaultModels('ANTHROPIC').push('something-else');

    expect(defaultModels('ANTHROPIC')).toEqual(['claude-opus-5-5']);
  });
});

describe('modelOptionGroups', () => {
  it('offers the suggested models by name before a key exists', () => {
    const groups = modelOptionGroups('ANTHROPIC', []);

    expect(groups).toHaveLength(1);
    expect(groups[0].options[0]).toEqual({ value: 'claude-opus-5-5', label: 'Claude Opus 5.5' });
  });

  it('adds what the key can also reach, without repeating the suggestions', () => {
    const groups = modelOptionGroups('ANTHROPIC', ['claude-opus-5-5', 'claude-opus-5']);

    expect(groups[1].options).toEqual([{ value: 'claude-opus-5', label: 'claude-opus-5' }]);
  });
});

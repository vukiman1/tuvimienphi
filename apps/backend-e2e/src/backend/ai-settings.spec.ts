import axios from 'axios';

const UNAUTHORIZED = 401;

function graphql(query: string) {
  return axios.post('/api/admin/graphql', { query }, { validateStatus: () => true });
}

describe('AI settings console API, without a console session', () => {
  it.each([
    ['reading the settings', '{ aiSettings { source providers { provider hasApiKey } } }'],
    ['listing a provider’s models', '{ aiProviderModels(provider: OPENAI) }'],
    [
      'saving a key',
      'mutation { saveAiProvider(input: { provider: OPENAI, apiKey: "sk-not-a-real-key-0001", models: ["gpt-x"] }) { provider } }',
    ],
    ['clearing a key', 'mutation { clearAiProviderKey(provider: OPENAI) { source } }'],
    [
      'choosing the provider the site uses',
      'mutation { setActiveAiProvider(provider: OPENAI) { source } }',
    ],
    ['running a health check', 'mutation { checkAiProvider(provider: OPENAI) { provider } }'],
    [
      'trying a key before it is saved',
      'mutation { testAiProvider(input: { provider: OPENAI, apiKey: "sk-not-a-real-key-0001", models: ["gpt-x"] }) { status } }',
    ],
    ['reading usage', '{ aiUsage(from: "2026-10-01", to: "2026-10-07") { day calls } }'],
    [
      'setting a monthly budget',
      'mutation { setAiProviderBudget(provider: OPENAI, monthlyBudgetUsd: 10) { provider } }',
    ],
    [
      'listing models with a typed key',
      '{ aiProviderModels(provider: OPENAI, apiKey: "sk-not-a-real-key-0001") }',
    ],
  ])('refuses %s', async (_action, query) => {
    const res = await graphql(query);

    expect(res.data.data).toBeNull();
    expect(res.data.errors[0].extensions.code).toBe(UNAUTHORIZED);
  });
});

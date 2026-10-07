import { Flex, Select, Tag } from 'antd';
import type { AiProvider } from '@/gql/graphql';
import type { AiProviderView } from '../data/admin-ai.query';
import { AI_PROVIDER_ICON } from './ai-provider-icon';
import { AI_PROVIDER_LABEL, providerStatus } from './ai-provider-model';

interface AiProviderSelectProps {
  readonly providers: readonly AiProviderView[];
  readonly value: AiProvider;
  readonly onChange: (provider: AiProvider) => void;
}

export function AiProviderSelect({ providers, value, onChange }: AiProviderSelectProps) {
  const statusOf = (id: AiProvider) => {
    const provider = providers.find((candidate) => candidate.provider === id);
    return provider ? providerStatus(provider) : null;
  };

  return (
    <Select<AiProvider>
      size="large"
      aria-label="Loại AI"
      value={value}
      onChange={onChange}
      style={{ width: '100%' }}
      options={providers.map(({ provider }) => ({
        value: provider,
        label: AI_PROVIDER_LABEL[provider],
      }))}
      labelRender={({ value: id }) => <ProviderName id={id as AiProvider} />}
      optionRender={({ value: id }) => {
        const status = statusOf(id as AiProvider);
        return (
          <Flex align="center" justify="space-between" gap={12}>
            <ProviderName id={id as AiProvider} />
            {status ? <Tag color={status.color}>{status.text}</Tag> : null}
          </Flex>
        );
      }}
    />
  );
}

function ProviderName({ id }: { readonly id: AiProvider }) {
  return (
    <Flex align="center" gap={10}>
      {AI_PROVIDER_ICON[id]}
      {AI_PROVIDER_LABEL[id]}
    </Flex>
  );
}

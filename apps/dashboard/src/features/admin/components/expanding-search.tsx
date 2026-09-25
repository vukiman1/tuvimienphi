import { useCallback, useRef, useState, useSyncExternalStore } from 'react';
import { Button, Input, Tooltip, type InputRef } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const OPEN_WIDTH = 240;
const TRANSITION = 'width 180ms ease';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

interface ExpandingSearchProps {
  readonly value: string;
  readonly label: string;
  readonly placeholder: string;
  readonly maxLength: number;
  readonly onSearch: (term: string) => void;
}

export function ExpandingSearch({
  value,
  label,
  placeholder,
  maxLength,
  onSearch,
}: ExpandingSearchProps) {
  const [isOpen, setIsOpen] = useState(value !== '');
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<InputRef>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const open = () => {
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const commit = (term: string) => {
    const search = term.trim();
    setDraft(search);
    if (search !== value) {
      onSearch(search);
    }
    if (search === '') {
      setIsOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div
        style={{
          width: isOpen ? OPEN_WIDTH : 0,
          overflow: 'hidden',
          transition: prefersReducedMotion ? undefined : TRANSITION,
        }}
      >
        <Input
          ref={inputRef}
          allowClear
          placeholder={placeholder}
          maxLength={maxLength}
          value={draft}
          tabIndex={isOpen ? 0 : -1}
          aria-hidden={!isOpen}
          onChange={(event) => setDraft(event.target.value)}
          onPressEnter={() => commit(draft)}
          onBlur={() => commit(draft)}
        />
      </div>
      <Tooltip title={label}>
        <Button
          type="text"
          aria-label={label}
          aria-expanded={isOpen}
          icon={<SearchOutlined />}
          onClick={() => (isOpen ? commit(draft) : open())}
        />
      </Tooltip>
    </div>
  );
}

function usePrefersReducedMotion(): boolean {
  const subscribe = useCallback((notify: () => void) => {
    const query = window.matchMedia?.(REDUCED_MOTION_QUERY);
    query?.addEventListener('change', notify);
    return () => query?.removeEventListener('change', notify);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false,
    () => false,
  );
}

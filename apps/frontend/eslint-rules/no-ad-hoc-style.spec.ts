import { deserialize, serialize } from 'node:v8';
import { RuleTester } from 'eslint';
import noAdHocStyle from './no-ad-hoc-style.mjs';

globalThis.structuredClone = <T>(value: T): T => deserialize(serialize(value));

const JSX_LANGUAGE_OPTIONS = {
  ecmaVersion: 2022,
  sourceType: 'module',
  parserOptions: { ecmaFeatures: { jsx: true } },
} as const;

const tester = new RuleTester({ languageOptions: JSX_LANGUAGE_OPTIONS });

function invalidClass(code: string): RuleTester.InvalidTestCase {
  return { code, errors: [{ messageId: 'adHocClass' }] };
}

function invalidColour(code: string): RuleTester.InvalidTestCase {
  return { code, errors: [{ messageId: 'adHocColour' }] };
}

tester.run('no-ad-hoc-style', noAdHocStyle, {
  valid: [
    { code: '<a className="bg-son text-cream" />' },
    { code: '<a className="max-w-[68ch]" />' },
    { code: "<a className={cn('p-4', active && 'text-gold')} />" },
    { code: '<a style={{ width: BOARD_WIDTH }} />' },
    { code: '<a href="#mo-dau" />' },
    { code: "const LABEL = 'Mục #1';" },
  ],
  invalid: [
    invalidClass('<a className="text-[#b3282d]" />'),
    invalidClass('<a className="text-[13px]" />'),
    invalidClass(`<a className={\`p-2 \${x ? 'bg-[#fff]' : ''}\`} />`),
    invalidClass(`<a className={\`text-[#fff] \${x}\`} />`),
    invalidClass("<a className={cn('mt-[3px]')} />"),
    invalidClass("<a className={cn({ 'text-[#fff]': active })} />"),
    invalidClass("<a className={x ? 'p-1' : 'p-[2px]'} />"),
    invalidClass("const CARD_CLASS = 'text-[#fff]';"),
    invalidClass("const buttonVariants = cva('focus-visible:ring-[3px]');"),
    invalidClass("const SURFACE = { base: 'bg-[#faf6ec]' };"),
    invalidClass("const SHADOW = 'shadow-[0_0_0_3px_#fff]';"),
    invalidColour("<a style={{ color: '#b3282d' }} />"),
    invalidColour("<a style={{ color: x ? '#b3282d' : undefined }} />"),
    invalidColour("const NAV_BAR_BG = '#f5f0e6';"),
  ],
});

import {
  ForceWithoutOnlyError,
  InvalidTetHubArgumentError,
  parseCliOptions,
} from './tet-hub-cli-options';

describe('parseCliOptions', () => {
  it('defaults to generating every missing page', () => {
    expect(parseCliOptions([])).toEqual({ only: null, isForced: false });
  });

  it('reads --only=<slug> and --force', () => {
    expect(parseCliOptions(['--only=tuoi-mui', '--force'])).toEqual({
      only: 'tuoi-mui',
      isForced: true,
    });
  });

  it.each([['--forse'], ['--only'], ['--only='], ['tuoi-mui']])(
    'rejects the argument %s instead of starting a full run',
    (argument) => {
      expect(() => parseCliOptions([argument])).toThrow(InvalidTetHubArgumentError);
    },
  );

  it('rejects --force without --only so a run cannot overwrite every hand-edited page', () => {
    expect(() => parseCliOptions(['--force'])).toThrow(ForceWithoutOnlyError);
  });
});

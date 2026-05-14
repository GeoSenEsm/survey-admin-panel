import { getConfiguredLanguage, getMaterialDateLocale, normalizeLanguage } from './supported-languages';

describe('supported languages', () => {
  it('normalizes Chinese browser locale to zh', () => {
    expect(normalizeLanguage('zh-CN')).toBe('zh');
  });

  it('uses Chinese browser locale when there is no stored language', () => {
    expect(getConfiguredLanguage(null, 'zh-CN')).toBe('zh');
  });

  it('maps Chinese language to zh-CN Material date locale', () => {
    expect(getMaterialDateLocale('zh')).toBe('zh-CN');
  });

  it('falls back unsupported languages to English', () => {
    expect(normalizeLanguage('it-IT')).toBe('en');
  });
});

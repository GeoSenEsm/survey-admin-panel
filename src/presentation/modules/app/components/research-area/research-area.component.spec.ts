import { ResearchAreaComponent } from './research-area.component';

describe('ResearchAreaComponent.parseLocalizedNumber', () => {
  let component: ResearchAreaComponent;

  beforeEach(() => {
    component = new ResearchAreaComponent(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    );
  });

  it('parses a plain number unchanged', () => {
    expect(component.parseLocalizedNumber(52.2297, '.')).toBe(52.2297);
  });

  it('parses a dot-separated value when the decimal separator is a dot', () => {
    expect(component.parseLocalizedNumber('52.2297', '.')).toBeCloseTo(52.2297);
  });

  it('parses a comma-separated value when the decimal separator is a comma', () => {
    expect(component.parseLocalizedNumber('52,2297', ',')).toBeCloseTo(52.2297);
  });

  it('rejects a value with a stray extra separator instead of truncating it', () => {
    expect(component.parseLocalizedNumber('52,2297,5', ',')).toBeNaN();
    expect(component.parseLocalizedNumber('52.2297.5', '.')).toBeNaN();
  });

  it('rejects a value using the wrong separator for the configured locale', () => {
    expect(component.parseLocalizedNumber('52.2297', ',')).toBeNaN();
  });

  it('returns NaN for a blank value', () => {
    expect(component.parseLocalizedNumber('   ', '.')).toBeNaN();
  });
});

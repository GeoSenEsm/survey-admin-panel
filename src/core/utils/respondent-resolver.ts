import { RespondentData } from '../../domain/models/respondent-data';

/** `undefined` means a typed username did not match any respondent. */
export function resolveRespondentId(
  value: RespondentData | string | null,
  respondents: RespondentData[]
): string | null | undefined {
  if (value && typeof value === 'object' && value.id) {
    return value.id;
  }
  if (typeof value === 'string' && value.trim()) {
    const match = respondents.find((r) => r.username === value.trim());
    return match ? match.id : undefined;
  }
  return null;
}

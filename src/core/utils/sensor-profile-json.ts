export interface JsonParseResult {
  value?: unknown;
  formatted?: string;
  error?: string;
}

export function parseAndFormatProfileJson(source: string): JsonParseResult {
  try {
    const value: unknown = JSON.parse(source);
    if (value === null || Array.isArray(value) || typeof value !== 'object') {
      return { error: 'profileMustBeObject' };
    }
    return {
      value,
      formatted: JSON.stringify(value, null, 2),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'invalidJson',
    };
  }
}

/**
 * Summarizes a profile spec using the backend's `operations`/`advertisement` schema
 * (see GattProfileValidator). `operations` entries have `kind: 'write' | 'delay' | 'acquire'`;
 * `acquire` steps additionally carry `acquisition.mode: 'read' | 'notification' | 'indication'`,
 * which is what the summary counts are broken down by.
 */
export function summarizeProfile(specification: unknown): {
  transport: string;
  discoveryMatchers: number;
  operations: Record<string, number>;
  decoders: number;
  decoderId?: string;
  objectMappings: number;
  goldenVectors: number;
} {
  const profile = specification as {
    transport?: string;
    discovery?: unknown;
    operations?: Array<{
      kind?: string;
      acquisition?: { mode?: string };
      decoders?: unknown[];
    }>;
    advertisement?: {
      matcher?: unknown;
      decoderId?: string;
      objects?: unknown[];
    };
    goldenPackets?: unknown[];
  };
  const operations = Array.isArray(profile?.operations) ? profile.operations : [];

  return {
    transport: profile?.transport ?? 'gatt_sequence',
    discoveryMatchers: profile?.discovery || profile?.advertisement?.matcher ? 1 : 0,
    operations: operations.reduce<Record<string, number>>((counts, operation) => {
      const kind =
        operation.kind === 'acquire'
          ? operation.acquisition?.mode ?? 'read'
          : operation.kind ?? 'write';
      counts[kind] = (counts[kind] ?? 0) + 1;
      return counts;
    }, {}),
    decoders: operations.reduce(
      (count, operation) =>
        count + (Array.isArray(operation?.decoders) ? operation.decoders.length : 0),
      0
    ),
    decoderId: profile?.advertisement?.decoderId,
    objectMappings: Array.isArray(profile?.advertisement?.objects)
      ? profile.advertisement.objects.length
      : 0,
    goldenVectors: Array.isArray(profile?.goldenPackets) ? profile.goldenPackets.length : 0,
  };
}

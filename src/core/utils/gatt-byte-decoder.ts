/**
 * Client-side re-implementation of the primitive byte-decode math from
 * `GattProfileDecoder`/`GattField` (mobile, Dart) and `GattProfileValidator` (backend, Java) —
 * only the arithmetic, not the schema validation those own. Used by the admin panel's live
 * device tester to preview decoded values from real bytes without a backend round trip.
 */
export interface GattDecoderSpec {
  parameter: string;
  type: string;
  endian?: 'little' | 'big';
  offset: number;
  scale?: number;
  add?: number;
  min?: number;
  max?: number;
}

export interface DecodedField {
  parameter: string;
  value?: number;
  error?: string;
}

export function decodeGattField(bytes: DataView, spec: GattDecoderSpec): DecodedField {
  const littleEndian = (spec.endian ?? 'little') === 'little';
  try {
    let raw: number;
    switch (spec.type) {
      case 'uint8':
        raw = bytes.getUint8(spec.offset);
        break;
      case 'int8':
        raw = bytes.getInt8(spec.offset);
        break;
      case 'uint16':
        raw = bytes.getUint16(spec.offset, littleEndian);
        break;
      case 'int16':
        raw = bytes.getInt16(spec.offset, littleEndian);
        break;
      case 'uint32':
        raw = bytes.getUint32(spec.offset, littleEndian);
        break;
      case 'int32':
        raw = bytes.getInt32(spec.offset, littleEndian);
        break;
      case 'float32':
        raw = bytes.getFloat32(spec.offset, littleEndian);
        break;
      case 'sfloat16':
        raw = readSfloat16(bytes.getUint16(spec.offset, littleEndian));
        break;
      default:
        return { parameter: spec.parameter, error: `Unsupported type "${spec.type}"` };
    }
    const value = raw * (spec.scale ?? 1) + (spec.add ?? 0);
    if (
      !Number.isFinite(value) ||
      (spec.min != null && value < spec.min) ||
      (spec.max != null && value > spec.max)
    ) {
      return { parameter: spec.parameter, error: 'Value out of range' };
    }
    return { parameter: spec.parameter, value };
  } catch (error) {
    return {
      parameter: spec.parameter,
      error: error instanceof Error ? error.message : 'Decode error',
    };
  }
}

function readSfloat16(raw: number): number {
  const mantissaBits = raw & 0x0fff;
  if ([0x07ff, 0x0800, 0x07fe, 0x0802, 0x0801].includes(mantissaBits)) {
    throw new Error('Reserved SFLOAT16 value');
  }
  const mantissa = (mantissaBits & 0x0800) === 0 ? mantissaBits : mantissaBits - 0x1000;
  const exponentBits = (raw >> 12) & 0x0f;
  const exponent = (exponentBits & 0x08) === 0 ? exponentBits : exponentBits - 0x10;
  return mantissa * Math.pow(10, exponent);
}

export function bytesToHex(bytes: DataView): string {
  const view = new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return Array.from(view)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/\s+/g, '');
  const bytes = new Uint8Array(Math.floor(clean.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

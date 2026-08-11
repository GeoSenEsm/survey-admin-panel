import { GattProfileOperation, GattSequenceProfileSpecification } from '../../domain/models/sensor-profile';
import { bytesToHex, decodeGattField, DecodedField, GattDecoderSpec, hexToBytes } from './gatt-byte-decoder';

/**
 * Minimal Web Bluetooth surface this tester actually calls. Declared locally rather than adding
 * the `@types/web-bluetooth` package as a dependency purely for typings.
 */
interface WebBluetoothCharacteristic {
  readValue(): Promise<DataView>;
  writeValueWithResponse(value: BufferSource): Promise<void>;
}
interface WebBluetoothService {
  getCharacteristic(uuid: string): Promise<WebBluetoothCharacteristic>;
}
interface WebBluetoothGattServer {
  connected: boolean;
  connect(): Promise<WebBluetoothGattServer>;
  disconnect(): void;
  getPrimaryService(uuid: string): Promise<WebBluetoothService>;
}
export interface WebBluetoothDevice {
  name?: string;
  gatt?: WebBluetoothGattServer;
}
interface WebBluetoothRequestOptions {
  acceptAllDevices?: boolean;
  optionalServices?: string[];
}

export interface LiveTestStep {
  kind: GattProfileOperation['kind'];
  serviceUuid?: string;
  characteristicUuid?: string;
  ok: boolean;
  message: string;
  hex?: string;
  decoded?: DecodedField[];
}

export function isWebBluetoothSupported(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}

/** Every serviceUuid referenced anywhere in the draft — Web Bluetooth requires each one to be
 * pre-declared (as `optionalServices`) before it will let you access it, even after the device
 * picker lets you pick a device by name alone via `acceptAllDevices`. */
export function collectServiceUuids(spec: GattSequenceProfileSpecification): string[] {
  const uuids = new Set<string>();
  for (const operation of spec.operations ?? []) {
    if (operation.serviceUuid) {
      uuids.add(operation.serviceUuid);
    }
  }
  const discovery = spec.discovery as { serviceUuid?: string } | undefined;
  if (discovery?.serviceUuid) {
    uuids.add(discovery.serviceUuid);
  }
  return [...uuids];
}

export async function requestTestDevice(serviceUuids: string[]): Promise<WebBluetoothDevice> {
  const bluetooth = (navigator as unknown as { bluetooth: {
    requestDevice(options: WebBluetoothRequestOptions): Promise<WebBluetoothDevice>;
  } }).bluetooth;
  // acceptAllDevices (rather than filtering by service) so the picker shows the device by name
  // even when the profile's guessed serviceUuid turns out to be wrong — that mismatch is exactly
  // what this tool needs to be able to surface, not hide behind an empty picker.
  return bluetooth.requestDevice({ acceptAllDevices: true, optionalServices: serviceUuids });
}

export async function runLiveTest(
  device: WebBluetoothDevice,
  spec: GattSequenceProfileSpecification
): Promise<LiveTestStep[]> {
  const server = device.gatt?.connected ? device.gatt : await device.gatt?.connect();
  if (!server) {
    throw new Error('This device does not expose a GATT server');
  }
  const steps: LiveTestStep[] = [];
  for (const operation of spec.operations ?? []) {
    steps.push(await runOperation(server, operation));
  }
  return steps;
}

export function disconnectTestDevice(device: WebBluetoothDevice): void {
  if (device.gatt?.connected) {
    device.gatt.disconnect();
  }
}

async function runOperation(
  server: WebBluetoothGattServer,
  operation: GattProfileOperation
): Promise<LiveTestStep> {
  if (operation.kind === 'delay') {
    const ms = operation.durationMs ?? 0;
    await new Promise((resolve) => setTimeout(resolve, ms));
    return { kind: 'delay', ok: true, message: `Waited ${ms} ms` };
  }
  if (!operation.serviceUuid || !operation.characteristicUuid) {
    return { kind: operation.kind, ok: false, message: 'Missing serviceUuid/characteristicUuid' };
  }
  try {
    const service = await server.getPrimaryService(operation.serviceUuid);
    const characteristic = await service.getCharacteristic(operation.characteristicUuid);
    if (operation.kind === 'write') {
      const bytes = hexToBytes(operation.payloadHex ?? '');
      await characteristic.writeValueWithResponse(bytes);
      return {
        kind: 'write',
        serviceUuid: operation.serviceUuid,
        characteristicUuid: operation.characteristicUuid,
        ok: true,
        message: `Wrote ${bytesToHex(new DataView(bytes.buffer))}`,
      };
    }
    const value = await characteristic.readValue();
    const hex = bytesToHex(value);
    const decoders = (operation.decoders ?? []) as GattDecoderSpec[];
    const decoded = decoders.map((decoder) => decodeGattField(value, decoder));
    return {
      kind: 'acquire',
      serviceUuid: operation.serviceUuid,
      characteristicUuid: operation.characteristicUuid,
      ok: true,
      message: `Read ${hex}`,
      hex,
      decoded,
    };
  } catch (error) {
    return {
      kind: operation.kind,
      serviceUuid: operation.serviceUuid,
      characteristicUuid: operation.characteristicUuid,
      ok: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

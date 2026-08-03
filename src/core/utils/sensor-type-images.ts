/**
 * Static product images for known sensor type codes on Integrations.
 * Unknown / custom codes fall back to the placeholder.
 */
const SENSOR_IMAGES: Record<string, string> = {
  xiaomi: 'assets/imgs/sensors/xiaomi.jpg',
  kestrel: 'assets/imgs/sensors/kestrel.jpg',
  flower_care: 'assets/imgs/sensors/flower_care.jpg',
  inkbird_ibs_th1: 'assets/imgs/sensors/inkbird_ibs_th1.jpg',
  pc_60fw: 'assets/imgs/sensors/pc_60fw.jpg',
  bluetooth_sig_plx: 'assets/imgs/sensors/bluetooth_sig_plx.jpg',
  xiaomi_door_sensor_2: 'assets/imgs/sensors/xiaomi_door_sensor_2.jpg',
};

const PLACEHOLDER_IMAGE = 'assets/imgs/sensors/sensor_placeholder.jpg';

export function sensorTypeImageUrl(sensorTypeCode: string | undefined | null): string {
  if (!sensorTypeCode) {
    return PLACEHOLDER_IMAGE;
  }
  return SENSOR_IMAGES[sensorTypeCode] ?? PLACEHOLDER_IMAGE;
}

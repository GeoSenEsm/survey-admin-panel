export function generateGuid(): string {
    const d = new Date().getTime();
    const d2 = (performance && performance.now && (performance.now() * 1000)) || 0;
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    return uuid;
}
  
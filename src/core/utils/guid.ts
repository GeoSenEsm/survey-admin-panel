export function generateGuid(): string {
  const template = 'xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx';
  const guid = template.replace(/[xy]/g, (character) => {
      const randomValue = Math.random() * 16 | 0;
      const replacementValue = character === 'x'
          ? randomValue
          : (randomValue & 0x3 | 0x8);
      return replacementValue.toString(16);
  });
  return guid;
}
  
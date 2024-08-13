import { generateGuid } from "./guid";

describe('generateGuid', () => {
    it('should generate a valid GUID', () => {
        const guid = generateGuid();
        const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(guid).toMatch(guidPattern);
    });

    it('should generate a unique GUID each time', () => {
        const guid1 = generateGuid();
        const guid2 = generateGuid();
        expect(guid1).not.toBe(guid2);
    });
});

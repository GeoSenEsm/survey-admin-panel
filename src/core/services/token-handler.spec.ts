import { JwtTokenHandler } from "./token-handler";

describe('JwtTokenHandler tests', () =>{
    it('Sould properly decode a JWT token', () => {
        const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MjgxNTUyNTYsImV4cCI6MTc1OTY5MTI1NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjoiTWFuYWdlciJ9.g3ZXary3mRxGXltuIJuUtMYU15IOcJ0AQ8IO0IE1ELs';
        const handler = new JwtTokenHandler();

        expect(handler.getClaim(token, 'exp')).toBe(1759691256);
        expect(handler.getClaim(token, 'iat')).toBe(1728155256);
        expect(handler.getClaim(token, 'Email')).toBe('jrocket@example.com');
        expect(handler.getClaim(token, 'this property doe snot exist')).toBe(undefined);
    });
});
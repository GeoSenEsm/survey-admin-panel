export function toStudyWallClockParam(value: Date): string {
    const two = (n: number) => String(n).padStart(2, '0');
    return `${value.getFullYear()}-${two(value.getMonth() + 1)}-${two(value.getDate())}` +
        `T${two(value.getHours())}:${two(value.getMinutes())}:${two(value.getSeconds())}Z`;
}

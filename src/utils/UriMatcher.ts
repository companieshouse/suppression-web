export function urlMatches(expected: string, actual: string): boolean {
  return (actual === expected || actual === `${expected}/`);
}

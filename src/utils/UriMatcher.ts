export function urlMatches(expected: string, actual: string): boolean {
  const uriPattern = new RegExp(`^${expected}(/|\\?.*|)$`);
  return uriPattern.test(actual);
}

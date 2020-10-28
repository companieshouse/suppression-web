import { ROOT_URI } from '../../src/routes/paths';
import { urlMatches } from '../../src/utils/UriMatcher';

describe ('URI Matcher', () => {

  it('should return True if the URIs are a perfect match', () => {
    const result: boolean = urlMatches(ROOT_URI, ROOT_URI);
    expect(result).toBe(true);
  });

  it('should return True if the actual URI has a trailing slash', () => {
    const result: boolean = urlMatches(ROOT_URI, `${ROOT_URI}/`);
    expect(result).toBe(true);
  });

  it('should return False if the URIs do not match', () => {
    const result: boolean = urlMatches(ROOT_URI, 'different-uri');
    expect(result).toBe(false);
  });
});

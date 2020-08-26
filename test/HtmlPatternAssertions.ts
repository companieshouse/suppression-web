export function expectToHaveLink(body: string, href: string, linkText: string) {
  const patternStr = `<a.* href="${href}">\\s*${linkText}\\s*<\/a>`;
  const pattern = new RegExp(patternStr, 's');
  expect(body).toMatch(pattern);
}

export function expectToHaveInput(body: string, field: string, label: string) {
  const patternStr = `<label.*>\\s*${label}\\s*<\/label>.*<input.*name="${field}".*>`;
  const pattern = new RegExp(patternStr, 's');
  expect(body).toMatch(pattern);
}

export function expectToHaveErrorMessages(body: string, expectedErrors: string[]) {
  expectedErrors.forEach(error => {
    const patternStr = `<span.*class="govuk-error-message">.*${error}.*<\/span>`
    const pattern = new RegExp(patternStr, 's');
    expect(body).toMatch(pattern)
  });
}

export function expectToHaveErrorSummaryContaining(body: string, expectedErrors: string[]) {
  const summaryPattern = /<div class="govuk-error-summary".*>/s;
  expect(body).toMatch(summaryPattern);

  const errorListPattern = /(?<list><ul class="govuk-list govuk-error-summary__list">(?:.*?)<\/ul>)/s;
  const errorList = errorListPattern.exec(body)?.groups?.list;
  if (errorList) {
    const errorPattern = /<a(?:.*?)>(?<text>.*?)<\/a>/gs;
    const receivedErrors: (string | undefined)[] = [];
    let match = errorPattern.exec(errorList);
    while (match) {
      receivedErrors.push(match.groups?.text);
      match = errorPattern.exec(errorList);
    }
    expectedErrors.forEach(error => {
      expect(receivedErrors).toContain(error);
    });
    expect(receivedErrors.length).toEqual(expectedErrors.length);
  } else {
    fail('Expected to find an Error Summary list in the HTML body')
  }
}

export function expectToHaveTitle(body: string, expectedTitle: string) {
  const patternStr = `<title>\\s*${expectedTitle}\\s*<\/title>`;
  const pattern = new RegExp(patternStr, 's');
  expect(body).toMatch(pattern);
}

export function expectNotToHaveTitle(body: string, invalidTitle: string) {
  const patternStr = `<title>\\s*${invalidTitle}\\s*<\/title>`;
  const pattern = new RegExp(patternStr, 's');
  expect(body).not.toMatch(pattern);
}

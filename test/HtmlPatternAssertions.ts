export function expectToHaveLink(body: string, href: string, linkText: string): void {
  const patternStr = `<a.* href="${href}"\( target="_blank"\|\)>\\s*${linkText}\\s*<\/a>`;
  const pattern = new RegExp(patternStr, 's');
  expect(body).toMatch(pattern);
}

export function expectToHaveBackButton(body: string, href: string): void {
  const patternStr = `<a.* href="${href}" class="govuk-back-link">Back<\/a>`;
  const pattern = new RegExp(patternStr, 's');
  expect(body).toMatch(pattern);
}

export function expectToHaveInput(body: string, field: string, label: string): void {
  const patternStr = `<label.*>\\s*${label}\\s*<\/label>.*<input.*name="${field}".*>`;
  const pattern = new RegExp(patternStr, 's');
  expect(body).toMatch(pattern);
}

export function expectToHavePopulatedInput(body: string, field: string, value: string): void {
  const patternStr = `<input.*name="${field}".*value="${value}".*>`;
  const pattern = new RegExp(patternStr, 's');
  expect(body).toMatch(pattern);
}

export function expectToHaveErrorMessages(body: string, expectedErrors: string[]): void {
  expectedErrors.forEach(error => {
    const patternStr = `<span.*class="govuk-error-message">.*${error}.*<\/span>`
    const pattern = new RegExp(patternStr, 's');
    expect(body).toMatch(pattern)
  });
}

export function expectToHaveErrorSummaryContaining(body: string, expectedErrors: string[]): void {
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

export function expectToHaveTitle(body: string, expectedTitle: string): void {
  const patternStr = `<title>\\s*${expectedTitle}\\s*<\/title>`;
  const pattern = new RegExp(patternStr, 's');
  expect(body).toMatch(pattern);
}

export function expectNotToHaveTitle(body: string, invalidTitle: string): void {
  const patternStr = `<title>\\s*${invalidTitle}\\s*<\/title>`;
  const pattern = new RegExp(patternStr, 's');
  expect(body).not.toMatch(pattern);
}

export function expectToHaveButton(body: string, buttonText: string): void {
  const patternStr = `<button class="govuk-button".*>.*${buttonText}.*<\/button>`;
  const pattern = new RegExp(patternStr, 's');
  expect(body).toMatch(pattern);
}

export function expectToHaveSummaryRow(body: string, key: string, value: string): void {
  const keyPatternStr = `<dt class="govuk-summary-list__key">\\s*${key}\\s*</dt>`;
  const valuePatternStr = `<dd class="govuk-summary-list__value">\\s*${value}\\s*</dd>`;
  const patternStr = `${keyPatternStr}\\s*${valuePatternStr}`;
  const pattern = new RegExp(patternStr, 's');
  expect(body).toMatch(pattern);
}

export function expectToHaveTableRow(body: string, key: string, value: string): void {
  const patternStr = `<tr class="govuk-table__row">.*>${key}<.*>${value}<.*</tr>`
  const pattern = new RegExp(patternStr, 's');
  expect(body).toMatch(pattern);
}

import { dateFilter } from '../../../src/modules/nunjucks/DateFilter';

describe('Date Filter', () => {
    it('should reformat a correctly-formatted datestring into the format dd Month yyyy', () => {
        const testCases = [
            { input: '1990-01-21', output: '21 January 1990' },
            { input: '2005-05-13', output: '13 May 2005' },
            { input: '2015-12-31', output: '31 December 2015' }
        ];

        testCases.forEach(testCase => {
            const result = dateFilter(testCase.input);
            expect(result).toEqual(testCase.output);
        });
    });

    it('should throw an error if a date component is missing', () => {
        const testInput = '2020-05';
        expect(() => dateFilter(testInput)).toThrow('Input should be formatted as yyyy-MM-dd');
    });

    it('should throw an error if a date component is invalid', () => {
        const testInput = '2020-20-01';
        expect(() => dateFilter(testInput)).toThrow('Input contains invalid month: 2020-20-01 BLAH CHECK ME');
    });

    it('should throw an error if the input format is invalid', () => {
        const testInput = '2020-05-one';
        expect(() => dateFilter(testInput)).toThrow('Input should be formatted as yyyy-MM-dd');
    });
});

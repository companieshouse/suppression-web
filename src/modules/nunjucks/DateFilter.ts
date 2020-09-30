import moment from 'moment';

export function dateFilter(value: string): string {

  const filteredDate = moment(value, 'YYYY-MM-DD', true).format('D MMMM Y');

  if (filteredDate === 'Invalid date') {
    throw new Error(`Invalid date passed to template: ${value}`)
  }

  return filteredDate
}

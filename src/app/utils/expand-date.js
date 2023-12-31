export default function expandDate(date, isBR) {
  return new Date(date).toLocaleDateString(isBR ? 'pt-BR' : 'en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

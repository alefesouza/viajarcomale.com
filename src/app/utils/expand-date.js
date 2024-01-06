export default function expandDate(date, isBR, short) {
  return new Date(date).toLocaleDateString(isBR ? 'pt-BR' : 'en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: short ? 'short' : 'long',
    day: 'numeric',
  });
}

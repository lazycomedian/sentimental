/**
 * Match a string from the beginning of a certain character to the end of a certain character
 * @param source
 * @param start start character
 * @param end end character
 */
export function matchBetween(source: string, start: string, end: string): string[] {
  const matchs: string[] = source.match(new RegExp(start + ".*?" + end, "g")) || [];
  return matchs.map(match => match.replace(start, "").replace(end, ""));
}

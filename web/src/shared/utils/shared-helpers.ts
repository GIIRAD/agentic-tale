/**
 * Removes any
 * - leading and trailing white space
 * - line terminators and line breaks
 * - multiple spaces
 * - commas
 * @param {string} s any string
 * @returns {string} string without format
 */
function removeFomat(s: string): string {
  const irregularWhiteSpace = '\u00A0';

  return s.trim()
    .replace(/,/g, '')
    .replace(/(\r\n|\n|\r)/gm, '')
    .replace(new RegExp(irregularWhiteSpace, 'g'), ' ')
    .replace(/ +(?= )/g, '');
}

/**
 * @param {string} s string which is possibly undefined
 * @returns {string} the string or an empty string in case of undefined
 */
function unknownStringToString(s?: string): string {
  return s ? s : '';
}

function possiblyEmptyStrToStrOrUndef(s: string): string | undefined {
  if (s === '') {
    // eslint-disable-next-line no-undefined
    return undefined;
  }
  return s;
}

// DistributiveOmit: https://stackoverflow.com/a/57103940/19082446
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;

// Valid for one specific key value pair from a type: https://stackoverflow.com/questions/56933109/pick-one-key-value-pair-from-type
type PickOne<T> = {
  [P in keyof T]: Record<P, T[P]> & Partial<Record<Exclude<keyof T, P>, undefined>>
}[keyof T];

// Valid for one specific key which mathes a given type and is part of a given type: https://stackoverflow.com/questions/54520676/in-typescript-how-to-get-the-keys-of-an-object-type-whose-values-are-of-a-given
type KeysMatching<T, V> = {[K in keyof T]-?: T[K] extends V ? K : never}[keyof T];

// https://stackoverflow.com/questions/46376468/how-to-get-type-of-array-items
type GetElementTypeFromElementArr<T extends unknown[]> = T extends (infer U)[] ? U : never;

// eslint-disable-next-line import/prefer-default-export
export { removeFomat, unknownStringToString, possiblyEmptyStrToStrOrUndef };
export type { DistributiveOmit, PickOne, KeysMatching, GetElementTypeFromElementArr };

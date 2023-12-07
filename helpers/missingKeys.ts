/**
 * Returns array of missing keys from provided body
 *
 * @param {string[]} keys array of strings
 * @param {Record<string, unknown>} body request body
 * @returns string[] array of missing keys
 */
export function missingKeys(keys: string[], body: Record<string, unknown> = {}): string[] {
	return keys.filter((key) => !Boolean(body[key]));
}
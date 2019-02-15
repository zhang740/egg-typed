
export function toHyphenCase(s: string) {
  s = s.replace(/([A-Z])/g, '_$1').toLowerCase();
  if (s.startsWith('_')) {
    s = s.substr(1);
  }
  return s;
}

export function toCamelCase(s: string) {
  return s.replace(/_(\w)/g, function (_all, letter) {
    return letter.toUpperCase();
  });
}

export function guard<T>(func: () => T, defaultValue?: T, onError?: (error: Error) => T | void): T {
  try {
    return func();
  } catch (error) {
    return (onError && onError(error)) || defaultValue;
  }
}

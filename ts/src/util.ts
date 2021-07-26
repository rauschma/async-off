export async function readTextFromStdin(): Promise<string> {
  let text='';
  for await (const chunk of process.stdin) {
    text += chunk;
  }
  return text;
}

export function dedent(str: string) {
  const newlineIndex = str.indexOf('\n');
  if (newlineIndex < 0) {
    return str;
  }
  str = str.slice(newlineIndex+1).trimEnd();
  let indexOfNonWhiteSpace = str.search(/\S/);
  if (indexOfNonWhiteSpace < 0) {
    indexOfNonWhiteSpace = 0;
  }
  const lines = splitLines(str).map(l => l.slice(indexOfNonWhiteSpace));
  return lines.join('');
}

export function splitLines(text: string): Array<string> {
  const result: Array<string> = [];
  let lastIndex = 0;
  while (lastIndex < text.length) {
    // Searching for '\n' also works for '\r\n'
    const nextIndex = text.indexOf('\n', lastIndex);
    if (nextIndex < 0) {
      result.push(text.slice(lastIndex));
      break;
    }
    result.push(text.slice(lastIndex, nextIndex + 1)); // include linebreak
    lastIndex = nextIndex + 1;
  }
  return result;
}

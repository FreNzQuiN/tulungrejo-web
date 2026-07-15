export function wrapWith(
  text: string,
  selStart: number,
  selEnd: number,
  before: string,
  after: string,
): { newText: string; cursorPos: number } {
  const selected = text.slice(selStart, selEnd);
  if (selStart === selEnd) {
    return {
      newText: text.slice(0, selStart) + before + after + text.slice(selEnd),
      cursorPos: selStart + before.length,
    };
  }
  return {
    newText:
      text.slice(0, selStart) + before + selected + after + text.slice(selEnd),
    cursorPos: selEnd + before.length + after.length,
  };
}

export function insertLinePrefix(
  text: string,
  selStart: number,
  selEnd: number,
  prefix: string,
): { newText: string; cursorPos: number } {
  const lineStart = text.lastIndexOf("\n", selStart - 1) + 1;
  const lineEndIdx = text.indexOf("\n", selEnd);
  const endIdx = lineEndIdx === -1 ? text.length : lineEndIdx;

  const portion = text.slice(lineStart, endIdx);
  const lines = portion.split("\n");
  const newPortion = lines.map((l) => prefix + l).join("\n");

  return {
    newText: text.slice(0, lineStart) + newPortion + text.slice(endIdx),
    cursorPos: endIdx + prefix.length * lines.length,
  };
}

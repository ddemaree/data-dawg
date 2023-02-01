/*

Adapted from https://github.com/lautis/unicode-substring to add TypeScript support

Copyright (c) 2015 Ville Lautanala

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

function charAt(inputString: string, index: number) {
  var first = inputString.charCodeAt(index);
  var second;
  if (first >= 0xd800 && first <= 0xdbff && inputString.length > index + 1) {
    second = inputString.charCodeAt(index + 1);
    if (second >= 0xdc00 && second <= 0xdfff) {
      return inputString.substring(index, index + 2);
    }
  }
  return inputString[index];
}

function slice(inputString: string, start: number, end: number) {
  var accumulator = "";
  var character;
  var stringIndex = 0;
  var unicodeIndex = 0;
  var length = inputString.length;

  while (stringIndex < length) {
    character = charAt(inputString, stringIndex);
    if (unicodeIndex >= start && unicodeIndex < end) {
      accumulator += character;
    }
    stringIndex += character.length;
    unicodeIndex += 1;
  }
  return accumulator;
}

function toNumber(value: any, fallback: number = 0) {
  if (value === undefined) {
    return fallback;
  } else {
    return Number(value);
  }
}

export default function unicodeSubstring(
  string: string,
  start: number,
  end: number | undefined = undefined
) {
  var realStart = toNumber(start, 0);
  var realEnd = toNumber(end, string.length);
  if (realEnd == realStart) {
    return "";
  } else if (realEnd > realStart) {
    return slice(string, realStart, realEnd);
  } else {
    return slice(string, realEnd, realStart);
  }
}

export function assert(condition: boolean): asserts condition {
  if (!condition) throw new Error("assertion error");
}

// https://stackoverflow.com/a/45905199/6164984
export function debounce(func: (a: any) => any) {
  let timer: any;
  return function (event: any) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(func, 100, event);
  };
}

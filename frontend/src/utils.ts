// export const SERVER_ADDRESS = "137.184.41.190:8081"
export const SERVER_ADDRESS = "math2001-git-graph-visualiser.herokuapp.com"

export function assert(condition: boolean): asserts condition {
  if (!condition) throw new Error("assertion error");
}

// https://stackoverflow.com/a/45905199/6164984
export function debounce(delayMS: number, func: (a: any) => any) {
  let timer: any;
  return function (event: any) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(func, delayMS, event);
  };
}

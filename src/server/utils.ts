export function toHuman(ms: number) {
  let s = ms / 1000;
  const h = Math.floor(s / 60 / 60);
  const r = s - h * 60 * 60;
  const m = Math.floor(r / 60);
  const secs = r - m * 60;
  return {
    hours: h,
    mins: m,
    secs: secs,
  };
}

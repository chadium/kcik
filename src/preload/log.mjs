export function info(tag, ...args) {
  console.log(`%c KCIK:${tag} `, 'background: #dcff6c; color: #222222', ...args);
}

export function warn(tag, ...args) {
  console.log(`%c KCIK:${tag} `, 'background: #ffe96c; color: #222222', ...args);
}

export function bad(tag, ...args) {
  console.error(`%c KCIK:${tag} `, 'background: #ff6c6c; color: #ffffff', ...args);
}

export function info(tag, ...args) {
  console.log(`%c ${tag} `, 'background: #dcff6c; color: #222222', ...args);
}

export function warn(tag, ...args) {
  console.log(`%c ${tag} `, 'background: #ffe96c; color: #222222', ...args);
}

export function bad(tag, ...args) {
  console.error(`%c ${tag} `, 'background: #ff6c6c; color: #ffffff', ...args);
}

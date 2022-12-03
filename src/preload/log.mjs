export function info(tag, ...args) {
  console.log(`%c ${tag} `, 'background: #222; color: #dcff6c', ...args);
}

export function warn(tag, ...args) {
  console.log(`%c ${tag} `, 'background: #222; color: #ffe96c', ...args);
}

export function bad(tag, ...args) {
  console.log(`%c ${tag} `, 'background: #222; color: #ff6c6c', ...args);
}

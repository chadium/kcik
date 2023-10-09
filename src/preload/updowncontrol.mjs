function isAtTheStart() {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const caretOffset = range.startOffset;

  return caretOffset === 0
}

function isAtTheEnd() {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const caretOffset = range.endOffset;
  const contentLength = range.startContainer.textContent.length;

  return caretOffset === contentLength;
}

export function updowncontrol({ container, onUp, onDown }) {
  let lastOffset = null

  const onKeydown = (e) => {
    if (e.key === 'ArrowUp') {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);

      if (isAtTheStart()) {
        onUp()
      } else if (lastOffset === null) {
        lastOffset = range.startOffset
      } else if (lastOffset !== range.startOffset) {
        lastOffset = range.startOffset
      } else {
        onUp()
      }
    } else if (e.key === 'ArrowDown') {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);

      if (isAtTheEnd()) {
        onDown()
      } else if (lastOffset === null) {
        lastOffset = range.startOffset
      } else if (lastOffset !== range.startOffset) {
        lastOffset = range.startOffset
      } else {
        onDown()
      }
    } else {
      lastOffset = null
    }
  }

  container.addEventListener('keydown', onKeydown)

  return {
    destroy: () => {
      container.removeEventListener('keydown', onKeydown)
    }
  }
}

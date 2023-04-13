import toast from 'toast-me'
import styles from "./toaster.lazy.module.css"
import logoUrl from 'url-loader!./../icon128.png'

const SIGNED_32B_INT = 2147483647

export function toaster(message, {
  duration = 5000,
} = {}) {
  if (duration > SIGNED_32B_INT) {
    // To support infinity and beyond. Nobody will leave their browser open
    // for more than 25 days, right?
    duration = SIGNED_32B_INT
  }

  styles.use()

  let t = toast.default(message, {
    type: 'over',
    containerClass: styles.locals.container,
    toastClass: styles.locals.message,
    duration,
  })

  let logo = document.createElement('img')
  logo.src = logoUrl

  t.domNode.insertBefore(logo, t.domNode.firstChild)

  return {
    remove() {
      t.close()
    },

    replace(message) {
      t.domNode.children[1].textContent = message
      t.startTimer()
    }
  }
}

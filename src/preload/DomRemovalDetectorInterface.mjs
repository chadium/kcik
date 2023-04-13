export class DomRemovalDetectorInterface {
  static ConnectionInterface = class ConnectionInterface {
    disconnect() {
      throw new Error('To be implemented. Needs to stop detecting removal.')
    }
  }

  connect(element, cb) {
    throw new Error('To be implemented. Needs to return a ConnectionInterface object.')
  }
}

// +-+-+-+-+-+-+
// |y|o|o|n|i|t|
// +-+-+-+-+-+-+
//
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// | Yoonit WebSocket Plugin for NativeScript applications           |
// |                                                                 |
// | Based on NativeScript Websockets created by Nathanael Anderson  |
// | (https://github.com/nathanaela/nativescript-websockets.git)     |
// |                                                                 |
// | Rewritten using modern JS methodologies                         |
// | Luigui Delyer @ Cyberlabs AI 2020                               |
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

import WebSocket from './WebSocket.native.ios'
import WebSocketBase from './Yoonit.WebSocket.common'

export default class YoonitWebSocket extends WebSocketBase {
  constructor (url, options) {
    super(url, options)
    this.create()
  }

  /**
  * This function is used to open and re-open sockets so that you don't have to re-create a whole new websocket class
  * @private
  */
  create () {
    const urlRequest = NSMutableURLRequest
      .requestWithURL(
        NSURL
          .URLWithString(
            this.url
          )
      )

    urlRequest.allowsCellularAccess = true

    if (this.protocol) {
      urlRequest.addValueForHTTPHeaderField(
        this.protocol,
        'Sec-WebSocket-Protocol'
      )
    }

    for (var name in this.headers) {
      if (!this.headers.hasOwnProperty(name)) continue
      const value = this.headers[name]

      urlRequest.addValueForHTTPHeaderField(value, name)
    }

    if (this.timeout !== -1) {
      urlRequest.timeoutInterval = this.timeout
    }

    // Clear old memory if used...
    if (this.socket) {
      this.socket = null
    }

    this.socket = PSWebSocket.clientSocketWithRequest(urlRequest)
    this.socket.native = WebSocket.alloc().init()
    this.socket.native.wrapper = this

    if (this.protocol) {
      this.socket.protocol = this.protocol
    }

    this.socket.delegate = this.socket.native
  }

  /**
  * Internal function that actually sends the message
  * @param message {String|ArrayBuffer} - Message to send
  * @private
  */
  _send (message) {
    if (!this.socket) {
      return
    }

    this.socket.send(message)
  }

  /**
  * Returns the state of the Connection
  * @returns {Number} - returns this.NOT_YET_CONNECTED, .CONNECTING, .OPEN, .CLOSING or .CLOSED
  */
  state () {
    if (!this._hasOpened) {
      return this.NOT_YET_CONNECTED
    }
    return (this.socket.readyState)
  }

  /**
  * Is the connection open
  * @returns {boolean} - true if the connection is open
  */
  isOpen () {
    if (!this.socket) {
      return
    }

    return this.socket.readyState === this.OPEN
  }

  /**
  * Is the connection closed
  * @returns {boolean} - true if the connection is closed
  */
  isClosed () {
    if (!this.socket) {
      return
    }

    return this.socket.readyState === this.CLOSED
  }

  /**
  * Is the connection is in the process of closing
  * @returns {boolean} - true if closing
  */
  isClosing () {
    if (!this.socket) {
      return
    }

    return this.socket.readyState === this.CLOSING
  }

  /**
  * Is the connection currently connecting
  * @returns {boolean} - true if connecting
  */
  isConnecting () {
    if (!this.socket) {
      return
    }

    return this.socket.readyState === this.CONNECTING
  }
}

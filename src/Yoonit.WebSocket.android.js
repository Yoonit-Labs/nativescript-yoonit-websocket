/**
 * ██╗   ██╗ ██████╗  ██████╗ ███╗   ██╗██╗████████╗
 * ╚██╗ ██╔╝██╔═══██╗██╔═══██╗████╗  ██║██║╚══██╔══╝
 *  ╚████╔╝ ██║   ██║██║   ██║██╔██╗ ██║██║   ██║
 *   ╚██╔╝  ██║   ██║██║   ██║██║╚██╗██║██║   ██║
 *    ██║   ╚██████╔╝╚██████╔╝██║ ╚████║██║   ██║
 *    ╚═╝    ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═╝   ╚═╝
 *
 * https://yoonit.dev - about@yoonit.dev
 *
 * NativeScript Yoonit Websocket
 * Build modern apps using NativeScript and WebSocket in Android and iOS
 *
 * Based on NativeScript Websockets created by Nathanael Anderson
 * https://github.com/nathanaela/nativescript-websockets.git
 * Rewritten using modern JS methodologies
 *
 * Luigui Delyer @ 2020-2021
 */

import {
  ToHashMap,
  CheckForEmulator
} from './Utils'
//
import WebSocket from './WebSocket.native.android'
import WebSocketBase from './Yoonit.WebSocket.common'

// Checks for running on a emulator
CheckForEmulator()

/**
* This function is used to open and re-open sockets so that you don't
* have to re-create a whole new websocket class
* @private
*/
export default class YoonitWebSocket extends WebSocketBase {
  constructor (url, options) {
    super(url, options)
    this.create()
  }

  create () {
    const isWSS = (this.url.indexOf('wss:') === 0)

    const uri = new java.net.URI(this.url)

    if (!this.headers.hasOwnProperty('Origin')) {
      const originScheme = isWSS ? 'https' : 'http'
      const originHost = uri.getPort() !== -1
        ? `${uri.getHost()}${uri.getPort()}:`
        : uri.getHost()

      this.headers['Origin'] = `${originScheme}://${originHost}`
    }

    // TODO: Add Per-message deflate?
    const knownExtensions = new java.util.ArrayList()

    // Must have a protocol, even if it is blank
    const knownProtocols = new java.util.ArrayList()

    if (this.protocol) {
      knownProtocols.add(
        new org.java_websocket.protocols.Protocol(this.protocol)
      )
    } else {
      knownProtocols.add(
        new org.java_websocket.protocols.Protocol('')
      )
    }

    // Clear old memory if used...
    if (this.socket) {
      this.socket = null
    }

    this.socket = new WebSocket(
      uri,
      new org.java_websocket.drafts.Draft_6455(
        knownExtensions,
        knownProtocols
      ),
      ToHashMap(this.headers),
      this.timeout
    )

    if (!this.socket) {
      return
    }

    if (this.debug) {
      org.java_websocket.WebSocketImpl.DEBUG = true
    }

    // Create linking and values for the socket controller.
    this.socket.wrapper = this
    this.socket.debug = this.debug

    // check for Proxy
    let proxy = null

    if (this.proxy) {
      if (this.proxy instanceof Object) {
        proxy = new java.net.Proxy(
          java.net.Proxy.Type.HTTP,
          new java.net.InetSocketAddress(
            this.proxy.address,
            this.proxy.port || 80
          )
        )
      }
    }

    if (proxy) {
      this.socket.setProxy(proxy)
    }

    // Check for SSL/TLS
    if (isWSS) {
      let socketFactory

      if (this._sslSocketFactory) {
        socketFactory = this._sslSocketFactory
      } else {
        const sslContext = javax.net.ssl.SSLContext.getInstance('TLS')
        sslContext.init(null, null, null)

        socketFactory = sslContext.getSocketFactory()
      }

      this.socket.setSocket(socketFactory.createSocket())
    }
  }

  /**
  * Internal function that actually sends the message
  * @param message {String|ArrayBuffer} - Message to send
  * @private
  */
  _send (message) {
    try {
      if (message instanceof ArrayBuffer ||
          message instanceof Uint8Array ||
          Array.isArray(message)) {
        let view

        if (message instanceof ArrayBuffer) {
          view = new Uint8Array(message)
        } else {
          view = message
        }

        const buffer = java.lang.reflect.Array
          .newInstance(
            java.lang.Byte.class.getField('TYPE').get(null),
            view.length
          )

        for (let i = 0; i < view.length; i++) {
          java.lang.reflect.Array
            .setByte(
              buffer,
              i,
              byte(view[i])
            )
        }

        if (!this.socket) {
          return
        }

        this.socket.send(buffer)
      } else {
        if (!this.socket) {
          return
        }

        this.socket.send(message)
      }
    } catch (err) {
      // Websocket is probably diconnected; so put the back at the top
      // of the message queue...
      this._queue.unshift(message)
      this._startQueueRunner()

      return false
    }

    return true
  }

  /**
  * Returns the state of the Connection
  * @returns {Number} - returns this.NOT_YET_CONNECTED, .CONNECTING, .OPEN,
  *                     .CLOSING or .CLOSED
  */
  state () {
    if (!this.socket ||
        !this.socket.getReadyState) {
      return
    }

    switch (this.socket.getReadyState()) {
    case org.java_websocket.WebSocket.READYSTATE.NOT_YET_CONNECTED:
      return this.NOT_YET_CONNECTED

    case org.java_websocket.WebSocket.READYSTATE.CONNECTING:
      return this.CONNECTING

    case org.java_websocket.WebSocket.READYSTATE.OPEN:
      return this.OPEN

    case org.java_websocket.WebSocket.READYSTATE.CLOSING:
      return this.CLOSING

    case org.java_websocket.WebSocket.READYSTATE.CLOSED:
      return this.CLOSED

    default:
      throw new Error('getReadyState returned invalid value')
    }
  }

  /**
  * Is the connection open
  * @returns {boolean} - true if the connection is open
  */
  isOpen () {
    if (!this.socket) {
      return
    }

    return this.socket.isOpen()
  }

  /**
  * Is the connection closed
  * @returns {boolean} - true if the connection is closed
  */
  isClosed () {
    if (!this.socket) {
      return
    }

    return this.socket.isClosed()
  }

  /**
  * Is the connection is in the process of closing
  * @returns {boolean} - true if closing
  */
  isClosing () {
    if (!this.socket) {
      return
    }

    return this.socket.isClosing()
  }

  /**
  * Is the connection currently connecting
  * @returns {boolean} - true if connecting
  */
  isConnecting () {
    if (!this.socket) {
      return
    }

    return this.socket.isConnecting()
  }
}

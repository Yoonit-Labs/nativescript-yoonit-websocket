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

/**
* This is the Constructor for creating a WebSocket
* @param url {String} - url to open, "ws://" or "wss://"
* @param options {Object} - options
* @constructor
*/
export default class WebSocketBase {
  constructor (url, options) {
    this.debugLabel = '[YooSocket]'

    this.callbacks = options.callbacks || {
      open: [],
      close: [],
      message: [],
      error: [],
      fragment: [],
      handshake: [],
      ping: [], // Not supported yet
      pong: [] // Not supported yet
    }
    this.debug = options.debug || false
    this.protocol = options.protocol || ''
    this.url = url.replace(/\s/g, '+') || ''
    this.timeout = options.timeout || 10000
    this.headers = options.headers || []
    this.proxy = options.proxy || {
      address: '',
      port: ''
    }
    this.opened = false
    this._queue = []
    this._queueRunner = null
    this._sslSocketFactory = null
    this.socket = null

    /**
    * This is a list standardized Close Codes
    * @type {Number}
    */
    this.CLOSE_CODE = {
      NORMAL: 1000,
      GOING_AWAY: 1001,
      PROTOCOL_ERROR: 1002,
      REFUSE: 1003,
      NOCODE: 1005,
      ABNORMAL_CLOSE: 1006,
      NO_UTF8: 1007,
      POLICY_VALIDATION: 1008,
      TOOBIG: 1009,
      EXTENSION: 1010,
      UNEXPECTED_CONDITION: 1011,
      SERVICE_RESTART: 1012,
      TRY_AGAIN_LATER: 1013,
      BAD_GATEWAY: 1014,
      TLS_ERROR: 1015,
      NEVER_CONNECTED: -1,
      BUGGYCLOSE: -2,
      FLASHPOLICY: -3
    }
    this.NOT_YET_CONNECTED = -1
    this.CONNECTING = 0
    this.OPEN = 1
    this.CLOSING = 2
    this.CLOSED = 3

    if (this.debug) {
      console.log(`${this.debugLabel} Start!`)
      org.java_websocket.WebSocketImpl.DEBUG = true
    }
  }

  /**
  * This function is used to send the notifications back to the user code
  * in the Advanced webSocket mode
  * @param event {String} - event name ("message", "open", "close", "error")
  * @param data {String|Array|ArrayBuffer}
  * @private
  */
  notify (event, data) {
    const eventCallbacks = this.callbacks[event]

    if (!eventCallbacks.length) {
      return
    }

    for (let i = 0; i < eventCallbacks.length; i++) {
      if (eventCallbacks[i].t) {
        if (eventCallbacks[i].c.apply) {
          eventCallbacks[i].c.apply(eventCallbacks[i].t, data)
        }
      } else {
        if (eventCallbacks[i].c.apply) {
          eventCallbacks[i].c.apply(this, data)
        }
      }
    }
  }

  /**
  * Attach an event to this webSocket
  * @param event {String} - Event Type ("message", "open", "close", "error")
  * @param callback {Function} - the function to run on the event
  * @param thisArg {Object} - the "this" to use for calling your function,
  *                           defaults to this current webSocket "this"
  */
  on (event, callback, thisArg = this) {
    this.addEventListener(event, callback, thisArg)
  }

  /**
  * Detaches an event from this websocket
  * If no callback is provided all events are cleared of that type.
  * @param event {String} - Event to detach from
  * @param callback {Function} - the function you registered
  */
  off (event, callback) {
    this.removeEventListener(event, callback)
  }

  /**
  * Attach an event to this webSocket
  * @param event {String} - Event Type ("message", "open", "close", "error")
  * @param callback {Function} - the function to run on the event
  * @param thisArg {Object} - the "this" to use for calling your function,
  *                           defaults to this current webSocket "this"
  */
  addEventListener (event, callback, thisArg = this) {
    if (!Array.isArray(this.callbacks[event])) {
      throw new Error('addEventListener passed an invalid event type ' + event)
    }

    this.callbacks[event]
      .push({
        c: callback,
        t: thisArg || this
      })
  }

  /**
  * Detaches an event from this webSocket
  * If no callback is provided all events are cleared of that type.
  * @param event {String} - Event to detach from
  * @param callback {Function} - the function you registered
  */
  removeEventListener (event, callback) {
    if (!Array.isArray(this.callbacks[event])) {
      throw new Error('Invalid event type in removeEventListener ' + event)
    }

    if (callback) {
      const eventCallbacks = this.callbacks[event]

      for (let i = eventCallbacks.length - 1; i >= 0; i--) {
        if (eventCallbacks[i].c === callback) {
          eventCallbacks.splice(i, 1)
        }
      }
    } else {
      this.callbacks[event] = []
    }
  }

  /**
  This opens or re-opens a webSocket.
  */
  open () {
    if (this.opened) {
      if (!this.state() >= this.CLOSING) {
        return
      }

      if (this.socket.delegate) {
        this.socket.delegate = null
      }

      if (this.socket ||
          this.socket.wrapper) {
        this.socket.wrapper = null
        this.socket = null
      }

      this.create()
    }

    this.opened = true

    if (this.socket &&
        this.socket.connect &&
        typeof this.socket.connect === 'function') {
      this.socket.connect()
    } else if (this.socket &&
              this.socket.open &&
              typeof this.socket.open === 'function') {
      this.socket.open()
    }
  }

  /**
  * This closes your webSocket
  * @param code {Number} - The value to send as the close reason
  * @param message {String} - The message as to why you are closing
  */
  close (code, message) {
    if (code &&
        message) {
      if (this.socket &&
          this.socket.closeWithCodeReason &&
          typeof this.socket.closeWithCodeReason === 'function') {
        return this.socket.closeWithCodeReason(code, message || '')
      }

      return this.socket.close(code, message || '')
    }

    return this.socket.close()
  }

  /**
  * This sends a Text or Binary Message (Allows Buffering of messages
  * if this is an advanced WebSocket)
  * @param message {string|Array|ArrayBuffer} - Message to send
  * @returns {boolean} - returns false if it is unable to send the messag
  *                      at this time, it will queue them up and try later...
  */
  send (message) {
    if (!this.state) {
      return
    }

    const state = this.state()

    // If we have a queue, we need to start processing it...
    if (this._queue.length &&
        state === this.OPEN) {
      let sendSuccess = true

      while (this._queue.length &&
              sendSuccess) {
        const oldMessage = this._queue.pop()
        sendSuccess = this._send(oldMessage)
      }

      if (sendSuccess) {
        if (this._queueRunner) {
          clearTimeout(this._queueRunner)
          this._queueRunner = null
        }
      } else {
        if (message != null) {
          this._queue.push(message)

          this._startQueueRunner()
        }
        return false
      }
    }

    // You shouldn't be sending null/undefined messages; but if you do -- we won't error out.
    if (message === null ||
        message === undefined) {
      this._startQueueRunner()
      return false
    }

    // If the socket isn't open, or we have a queue length; we are
    if (state !== this.OPEN ||
        this._queue.length) {
      this._queue.push(message)

      this._startQueueRunner()

      return false
    }

    return this._send(message)
  }

  /**
  * Internal function to start the Queue Runner timer
  * @private
  */
  _startQueueRunner () {
    if (!this._queueRunner &&
        this.state() !== this.OPEN &&
        this._queue.length) {
      this._queueRunner = setTimeout(() => {
        this._queueRunner = null
        this.send(null)
      }, 250)
    }
  }

  /**
  * This returns the current state
  */
  getState () {
    return this.state()
  }

  /**
  * This returns the amount of data buffered
  */
  queueLength () {
    return this._queue.length
  }
}

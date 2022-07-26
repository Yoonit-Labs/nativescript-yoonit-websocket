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

/**
* This is our extended class that gets the messages back from the Native IOS class
* We use a thin shell to just facilitate communication from IOS to our JS code
* We also use this class to try and standardize the messages
*/
const WebSocket = NSObject.extend({
  wrapper: null,

  webSocketDidOpen: function () {
    if (!this.wrapper) {
      return
    }

    this.wrapper.notify(
      'open',
      [
        this.wrapper
      ]
    )
  },

  webSocketDidReceiveMessage: function (webSocket, message) {
    if (!this.wrapper) {
      return
    }

    if (Object.prototype.toString.apply(message) === '[object NSConcreteMutableData]') {
      let buf = new ArrayBuffer(message.length)
      message.getBytes(buf)
      message = buf
    }

    this.wrapper.notify(
      'message',
      [
        this.wrapper,
        message
      ]
    )
  },

  webSocketDidFailWithError: function (webSocket, err) {
    if (!this.wrapper) {
      return
    }

    this.wrapper.notify(
      'close',
      [
        this.wrapper,
        1006,
        '',
        false
      ]
    )

    if (!err ||
        err.code !== 3 &&
        err.code !== 54) {
      this.wrapper.notify(
        'error',
        [
          this.wrapper,
          err
        ]
      )
    }
  },

  webSocketDidCloseWithCodeReasonWasClean: function (
    webSocket,
    code,
    reason,
    wasClean
  ) {
    if (!this.wrapper) {
      return
    }

    this.wrapper.notify(
      'close',
      [
        this.wrapper,
        code,
        reason,
        wasClean
      ]
    )
  }
}, {
  protocols: [
    PSWebSocketDelegate
  ]
})

export default WebSocket

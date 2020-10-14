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

import {
  UTF8ArrayToStr
} from './Utils'

const debugLabel = '[YooSocket]'

/**
* This is our extended class that gets the messages back from the Native ANDROID
* class. We use a thin shell to just facilitate communication from ANDROID to
* our JS code. We also use this class to try and standardize the messages
*/
const WebSocket = org.java_websocket.client.WebSocketClient
  .extend(
    'technology.master.nativescript.WebSocket',
    {
      fragmentInfo: {
        type: 0,
        data: [],
        sizes: 0
      },
      wrapper: null,
      debug: false,
      onOpen: function () {
        if (this.debug) {
          console.log(`${debugLabel} Event: OnOpen`)
        }
        if (this.wrapper) {
          this.wrapper.notify(
            'open',
            [
              this.wrapper
            ]
          )
        }
      },
      onClose: function (code, reason) {
        if (this.debug) {
          console.log(`${debugLabel} Event: OnClose`, code, reason)
        }
        if (this.wrapper) {
          // org.java_websocket.WebSocketImpl.closeConnection() currently executes this callback prior to updating readystate to CLOSED
          // and as such there are cases when the readystate is still showing as OPEN when this called. In short, the websocket connection
          // still appears to be up when it is not which is makes things like coding auto reconnection logic problematic. This seems like
          // an issue/bug in org.java_websocket.WebSocketImpl.closeConnection(). Regardless, as a workaround we pass control back to
          // closeConnection() prior to passing the notification along so that the readystate gets updated to CLOSED.
          // TODO: remove this when the readystate issue gets resolved.

          setTimeout(() => {
            if (this.wrapper) {
              this.wrapper.notify(
                'close',
                [
                  this.wrapper,
                  code,
                  reason
                ]
              )

              this.wrapper = null // Clean up memory
            }
          }, 1)
        }
      },
      onMessage: function (message) {
        if (this.debug) {
          console.log(`${debugLabel} Event: OnMessage`, JSON.parse(message) || message)
        }

        // Check for Native Java Objects
        if (typeof message === 'object' &&
            typeof message.getClass === 'function') {
          this.onMessageBinary(message)
          return
        }

        // Should be a JavaScript String or ArrayBuffer
        if (this.wrapper) {
          this.wrapper.notify(
            'message',
            [
              this.wrapper,
              message
            ]
          )
        }
      },
      onMessageBinary: function (binaryMessage) {
        if (this.debug) {
          console.log(`${debugLabel} Event: OnMessageBinary`)
        }

        if (this.wrapper &&
            binaryMessage) {
          // Is a Native JAVA Buffer type
          if (typeof binaryMessage.rewind === 'function') {
            // Make sure binaryMessage is at beginning of buffer

            binaryMessage.rewind()

            // Convert Binary Message into ArrayBuffer/Uint8Array
            const count = binaryMessage.limit()
            const view = new Uint8Array(count)

            for (let i = 0; i < count; i++) {
              view[i] = binaryMessage.get(i)
            }

            binaryMessage = null

            this.wrapper.notify(
              'message',
              [
                this.wrapper,
                view.buffer
              ]
            )
          } else {
            // If this is already an a ArrayBuffer
            this.wrapper.notify(
              'message',
              [
                this.wrapper,
                binaryMessage
              ]
            )
          }
        }
      },
      onPong: function () {
        if (this.debug) {
          console.log(`${debugLabel} Event: onPong`)
        }
      },
      onError: function (err) {
        if (this.debug) {
          console.log(`${debugLabel} Event: onError`, err)
        }

        if (this.wrapper) {
          this.wrapper.notify(
            'error',
            [
              this.wrapper,
              err
            ]
          )
        }
      },
      onFragment: function (fragment) {
        const optCode = fragment.optcode.toString()

        if (this.debug) {
          console.log(`${debugLabel} Event: onFragment`, optCode)
        }

        if (optCode !== 'CONTINUOUS') {
          if (this.fragmentInfo.type !== 0) {
            console.log(`${debugLabel} Missing Fragment info, skipped fragment`)
          }

          // Reset our buffer size when we have a new fragment chain
          this.fragmentInfo.sizes = 0

          if (optCode === 'TEXT') {
            this.fragmentInfo.type = 1
          } else if (optCode === 'BINARY') {
            this.fragmentInfo.type = 2
          } else {
            console.log(`${debugLabel} Unknown Fragment code:`, optCode)
            this.fragmentInfo.type = 0
          }
        }

        let data = fragment.getPayloadData()
        this.fragmentInfo.sizes += data.limit()
        this.fragmentInfo.data.push(data)

        if (fragment.fin === true) {
          let view = new Uint8Array(this.fragmentInfo.sizes)

          for (let i = 0, dst = 0; i < this.fragmentInfo.data.length; i++) {
            data = this.fragmentInfo.data[i]
            const count = data.limit()

            for (let src = 0; src < count; src++, dst++) {
              view[dst] = data.get(src)
            }
          }

          data = null
          this.fragmentInfo.data = []

          if (this.wrapper) {
            // Do our final message callback
            if (this.fragmentInfo.type === 2) {
              this.wrapper.notify(
                'message',
                [
                  this.wrapper,
                  view.buffer
                ]
              )
            } else {
              this.wrapper.notify(
                'message',
                [
                  this.wrapper,
                  UTF8ArrayToStr(view)
                ]
              )
            }
            view = null
          }

          // Reset back to unknown type
          this.fragmentInfo.type = 0
        }

        if (this.wrapper) {
          this.wrapper.notify(
            'fragment',
            [
              this.wrapper,
              fragment
            ]
          )
        }
      },
      onWebsocketHandshakeReceivedAsClient: function (handshake) {
        if (this.debug) {
          console.log(`${debugLabel} Event: Handshake Received`, handshake)
        }

        if (this.wrapper) {
          this.wrapper.notify(
            'handshake',
            [
              this.wrapper,
              handshake
            ]
          )
        }
      }
    }
  )

export default WebSocket

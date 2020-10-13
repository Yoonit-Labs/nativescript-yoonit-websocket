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

import YoonitWebSocket from './Yoonit.WebSocket'

export default {
  install (
    Vue,
    url,
    opts
  ) {
    if (!url) {
      Vue.prototype.$yoo = {
        ...Vue.prototype.$yoo,
        socket: undefined
      }

      return
    }

    let protocol
    let timeout
    let headers
    let reconnect
    let debug
    let proxy

    if (opts) {
      protocol = opts.protocol || ''
      timeout = opts.timeout || 10000
      headers = opts.headers || []
      reconnect = opts.reconnect || true
      debug = opts.debug
      proxy = opts.proxy || null
    }

    const socket = new YoonitWebSocket(
      url,
      {
        protocol,
        timeout,
        headers,
        debug,
        proxy
      }
    )

    const destroy = () =>
      Object
        .keys(socket['callbacks'])
        .forEach(key => {
          socket['callbacks'][key] = []
        })

    const events = events => {
      if (events) {
        Object
          .keys(events)
          .forEach(key => {
            const fn = events[key].bind(this)

            socket.on(key, () => null)

            if (reconnect &&
                (key === 'close' ||
                key === 'error')
            ) {
              socket.on(
                key,
                () => {
                  fn()
                  setTimeout(() => socket.open(), 1000)
                }
              )
            } else {
              socket.on(key, fn)
            }

            events[key].__binded = fn
          })
      }
    }

    const push = something => {
      if (!socket ||
          !socket.opened ||
          !something) {
        return
      }

      return socket.send(something)
    }

    socket['events'] = events
    socket['openAsync'] = (timeout = 1000) => setTimeout(() => socket.open(), timeout)
    socket['getStatus'] = () => socket.opened
    socket['push'] = push
    socket['destroy'] = destroy

    Vue.prototype.$yoo = {
      ...Vue.prototype.$yoo,
      socket
    }
  }
}

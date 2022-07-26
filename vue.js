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

import YoonitWebSocket from './Yoonit.WebSocket'

export default {
  install (
    Vue,
    url,
    opts
  ) {
    if (!url) {
      return
    }

    Vue.prototype.$yoo = {
      ...Vue.prototype.$yoo,
      socket: undefined
    }

    let protocol
    let timeout
    let headers
    let reconnect
    let delay
    let debug
    let proxy

    if (opts) {
      protocol = opts.protocol || ''
      timeout = opts.timeout || 10000
      headers = opts.headers || []
      reconnect = opts.reconnect || true
      delay = opts.delay || 1000
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

    const eventMaker = (events, scope = this) => {
      if (!events ||
          !Object.keys(events).length) {
        return null
      }

      Object
        .keys(events)
        .forEach(key => {
          const fn = events[key].bind(scope)

          socket.on(key, () => null)

          if (reconnect &&
              (key === 'close' ||
              key === 'error')
          ) {
            socket.on(
              key,
              () => {
                fn()
                setTimeout(
                  () => socket.open(),
                  delay
                )
              }
            )
          } else {
            socket.on(key, fn)
          }

          events[key].__binded = fn
        })
    }

    const push = something => {
      if (!socket ||
          !socket.opened ||
          !something) {
        return
      }

      return socket.send(something)
    }

    socket['events'] = eventMaker
    socket['getStatus'] = () => socket.opened
    socket['push'] = push
    socket['destroy'] = destroy
    socket['openAsync'] = (timeout = delay) =>
      setTimeout(
        () => socket.open(),
        timeout
      )

    const addListeners = function () {
      if (this.$options &&
          this.$options['yoo'] &&
          this.$options['yoo']['socket']) {
        const { events } = this.$options.yoo.socket

        if (events &&
            Object.keys(events).length) {
          return socket.events(events, this)
        }
      }
    }

    const removeListeners = function () {
      if (this.$options &&
          this.$options['yoo'] &&
          this.$options['yoo']['socket']) {
        const { events } = this.$options.yoo.socket

        if (events &&
            Object.keys(events).length) {
          return Object
            .keys(events)
            .forEach(key =>
              socket.off(key, events[key].__binded)
            )
        }
      }
    }

    Vue.mixin({
      [Vue.version.indexOf('2') === 0
        ? 'beforeCreate'
        : 'beforeCompile'
      ]: addListeners,
      beforeDestroy: removeListeners
    })

    Vue.prototype.$yoo = {
      ...Vue.prototype.$yoo,
      socket
    }
  }
}

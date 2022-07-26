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

import Vue from 'nativescript-vue'
import App from './components/App'
import YoonitWebSocket from '@yoonit/nativescript-websocket/vue'

// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production')

Vue.use(
  YoonitWebSocket,
  'wss://demo.piesocket.com/v3/channel_1?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV&notify_self',
  {
    reconnect: true,
    debug: false
  }
)

new Vue({
  render: h =>
    h(
      'frame',
      [
        h(App)
      ]
    )
})
  .$start()

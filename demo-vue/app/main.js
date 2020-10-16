import Vue from 'nativescript-vue'
import App from './components/App'
import YoonitWebSocket from '@yoonit/nativescript-websocket/vue'

// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production')

Vue.use(
  YoonitWebSocket,
  'wss://echo.websocket.org/',
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

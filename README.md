[<img src="https://raw.githubusercontent.com/Yoonit-Labs/nativescript-yoonit-websocket/development/logo_cyberlabs.png" width="300">](https://cyberlabs.ai/)

# NativeScript Yoonit WebSocket

![NativeScript](https://img.shields.io/badge/NativeScript-7-lightgrey.svg?style=for-the-badge&logo=nativescript) ![Version](https://img.shields.io/npm/v/@yoonit/nativescript-websocket?color=lightgrey&style=for-the-badge&logo=npm) ![Downloads](https://img.shields.io/npm/dm/@yoonit/nativescript-websocket?color=lightgrey&logo=npm&style=for-the-badge)

![Android](https://img.shields.io/badge/Android-YES-lightgrey.svg?style=for-the-badge&logo=android) ![iOS](https://img.shields.io/badge/iOS-YES-lightgrey.svg?style=for-the-badge&logo=apple) ![MIT license](https://img.shields.io/npm/l/@yoonit/nativescript-websocket?color=lightgrey&style=for-the-badge)

Build modern apps using NativeScript and WebSocket in Android and iOS

A NativeScript plugin to provide:
- Better and more stable Websocket connection
- Modern JS Code (ESNext)
- VueJS integrated plugin

## Installation

```bash
npm i -s @yoonit/nativescript-websocket
```

## Usage

All the functionalities that the `@yoonit/nativescript-websocket` provides is accessed through the `YoonitWebSocket` object. Below we have the basic usage code, for more details, your can see the [**Methods**](#methods) or the [**Demo Vue**](https://github.com/Yoonit-Labs/nativescript-yoonit-websocket/tree/development/demo-vue).


#### VueJS Plugin
`main.js`
```javascript
import Vue from 'nativescript-vue'
import YoonitWebSocket from '@yoonit/nativescript-websocket/vue'

Vue.use(
  YoonitWebSocket,
  'wss://echo.websocket.org/',
  {
    protocol: '',
    timeout: 1000,
    headers: [],
    reconnect: true,
    delay: 1000,
    debug: false,
    proxy: {
      address: '',
      port: ''
    }
  }
)
```

After that, you can access the socket object in your entire project using `this.$yoo.socket`

#### Vue Component
**Declaring events using an Yoonit-Style**

`App.vue`
```vue
<template>
  <Page @loaded="doLoaded"></Page>
</template>

<script>
export default {
  data: () => ({
    interval: null
  }),
  methods: {
    doLoaded () {
      // start the connection
      this.$yoo.socket.open()
    },
    doPing () {
      this.interval = setInterval(() => {
        if (!this.$yoo.socket.getStatus()) {
          return console.log('[YooSocket] Socket closed')
        }

        console.log("[YooSocket] Sending 'echo' message!")

        // add your message/file to queue and call 'send' method
        return this.$yoo.socket.push('echo')
      }, 2000)
    }
  },
  yoo: {
    socket: {
      events: {
        open ($socket) {
          console.log("[YooSocket] Hey! I'm connected!")

          clearInterval(this.interval)
          return this.doPing()
        },
        message ($socket, message) {
          if (!message) {
            console.log("[YooSocket] Message is empty")
          }

          console.log(`[YooSocket] Received Message: '${message}'!`)
        },
        close () {
          console.log("[YooSocket] Socket was closed")
        },
        error () {
          console.log("[YooSocket] Socket had an error")
        }
      }
    }
  }
}
</script>
```

**Or declaring events using your own already created methods**

`App.vue`
```vue
<template>
  <Page @loaded="doLoaded"></Page>
</template>

<script>
export default {
  data: () => ({
    interval: null
  }),
  methods: {
    doLoaded () {
      // start the connection
      this.$yoo.socket.open()

      // declare all callback events
      this.$yoo.socket.events({
        open: this.doSocketOpen,
        message: this.doReceivedMessage,
        close: this.doSocketClose,
        error: this.doSocketError
      })
    },

    doPing () {
      this.interval = setInterval(() => {
        if (!this.$yoo.socket.getStatus()) {
          return console.log('[YooSocket] Socket closed')
        }

        console.log("[YooSocket] Sending 'echo' message!")

        // add your message/file to queue and call 'send' method
        return this.$yoo.socket.push('echo')
      }, 2000)
    },

    doSocketOpen ($socket) {
      console.log("[YooSocket] Hey! I'm connected!")

      clearInterval(this.interval)

      // onOpen event calls your function
      return this.doPing()
    },

    doSocketClose () {
      // onClose event
      return console.log('[YooSocket] Socket was closed')
    },

    doSocketError () {
      // onError event
      return console.log('[YooSocket] Socket had an error')
    },

    doReceivedMessage ($socket, message) {
      // onMessage event
      return console.log(`[YooSocket] Received Message: '${message}'!`)
    },
  }
}
</script>
```


## API

#### Methods   
| Function | Parameters | Valid values | Return Type | Description |
|-|-|-|-|-|  
| **`openAsync`** | timeout | any positive number, default 1000 (ms) | void | Wait `timeout` to start the connection
| **`open`** | - | - | void | Start immediately the connection
| **`on`** | event, callback | string, function | void | Include an event, every that your server sent an event of this type, your callback will be invoked
| **`off`** | event, callback | string, function | void | Exclude an event
| **`events`** | callbacks | object with functions ```{ open: [], close: [], message: [], error: [], fragment: [], handshake: [] }``` | void | You can use an `Array` of callbacks in each event. Use this to add a batch of events at once
| **`getStatus`** | - | - | boolean | You can use this method to check the connection status
| **`push`** | content | string/blob | void | Send files or strings to server. You can use this method to make uploads for example
| **`destroy`** | - | - | void | Destroy server connection
| **`close`** | code, message | number, string | void | Close server connection programmatically offering an reason
| **`queueLength`** | - | - | number | Get the total pending items to be sent
| **`isOpen`** | - | - | boolean | Get connection status
| **`isClosed`** | - | - | boolean | Get connection status
| **`isClosing`** | - | - | boolean | Get connection status
| **`isConnecting`** | - | - | boolean | Get connection status

#### Properties   
| Property | Return Type |
|-|-|
| **`protocol`** | string
| **`timeout`** | number
| **`headers`** | array
| **`reconnect`** | boolean
| **`delay`** | number
| **`debug`** | boolean
| **`proxy`** | object
| **`callbacks`** | object
| **`url`** | string
| **`opened`** | boolean


## To contribute and make it better

Clone the repo, change what you want and send PR.

Contributions are always welcome!

---

Code with ❤ by the [**Cyberlabs AI**](https://cyberlabs.ai/) Front-End Team

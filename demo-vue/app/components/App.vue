<template>
  <Page @loaded="doLoaded">
    <ActionBar title="Yoonit WebSocket"/>

    <ScrollView orientation="vertical">
      <Label class="console" :text="consoleContent" textWrap="true"></Label>
    </ScrollView>
  </Page>
</template>

<script>
export default {
  data: () => ({
    consoleContent: '',
    interval: null
  }),
  methods: {
    doLoaded () {
      this.$yoo.socket.destroy()

      this.$yoo.socket.openAsync()

      this.$yoo.socket.events({
        open: this.doSocketOpen,
        message: this.doReceivedMessage,
        close: this.doSocketClose,
        error: this.doSocketError
      })

      const consoleLabel = "[YooSocket] Connecting..."

      this.doWriteInConsole(consoleLabel)
    },
    doWriteInConsole (text) {
      let newLine = '\n'

      if (!this.consoleContent) {
        newLine = ''
      }

      this.consoleContent = `${this.consoleContent}${newLine}${text}`
    },
    doPing () {
      this.interval = setInterval(() => {
        console.log('\n')

        if (!this.$yoo.socket.getStatus()) {
          const consoleLabel = '\n[YooSocket] Socket closed'

          this.doWriteInConsole(consoleLabel)

          return console.log(consoleLabel)
        }

        const consoleLabel = "\n[YooSocket] Sending 'echo' message!"

        this.doWriteInConsole(consoleLabel)
        console.log(consoleLabel)

        return this.$yoo.socket.push('echo')
      }, 2000)
    },
    doSocketOpen ($socket) {
      const consoleLabel = "[YooSocket] Hey! I'm connected!"

      this.doWriteInConsole(consoleLabel)
      console.log(consoleLabel)

      clearInterval(this.interval)
      return this.doPing()
    },
    doSocketClose () {
      const consoleLabel = '[YooSocket] Socket was closed'

      this.doWriteInConsole(consoleLabel)

      return console.log(consoleLabel)
    },
    doSocketError () {
      const consoleLabel = '[YooSocket] Socket had an error'

      this.doWriteInConsole(consoleLabel)

      return console.log(consoleLabel)
    },
    doReceivedMessage ($socket, message) {
      if (!message) {
        const consoleLabel = '[YooSocket] Message is empty'

        this.doWriteInConsole(consoleLabel)

        return console.log(consoleLabel)
      }

      const consoleLabel = `[YooSocket] Received Message: '${message}'!`

      this.doWriteInConsole(consoleLabel)

      return console.log(consoleLabel)
    },
  }
}
</script>

<style scoped>
  ActionBar {
    background-color: #000000;
    color: #ffffff;
  }

  .console {
    font-size: 20;
  }
</style>

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
  yoo: {
    socket: {
      events: {
        open ($socket) {
          const consoleLabel = "[YooSocket] Hey! I'm connected!"
          this.doWriteInConsole(consoleLabel)

          clearInterval(this.interval)
          return this.doPing()
        },
        message ($socket, message) {
          if (!message) {
            const consoleLabel = '[YooSocket] Message is empty'

            this.doWriteInConsole(consoleLabel)
          }

          const consoleLabel = `[YooSocket] Received Message: '${message}'!`

          this.doWriteInConsole(consoleLabel)
        },
        close () {
          const consoleLabel = '[YooSocket] Socket was closed'

          this.doWriteInConsole(consoleLabel)
        },
        error () {
          const consoleLabel = '[YooSocket] Socket had an error'

          this.doWriteInConsole(consoleLabel)
        }
      }
    }
  },
  methods: {
    doLoaded () {
      const consoleLabel = "[YooSocket] Connecting..."

      this.doWriteInConsole(consoleLabel)

      this.$yoo.socket.open()
    },
    doWriteInConsole (text) {
      let newLine = '\n'

      if (!this.consoleContent) {
        newLine = ''
      }

      this.consoleContent = `${this.consoleContent}${newLine}${text}`

      console.log(text)
    },
    doPing () {
      this.interval = setInterval(() => {
        console.log('\n')

        if (!this.$yoo.socket.getStatus()) {
          const consoleLabel = '\n[YooSocket] Socket closed'

          this.doWriteInConsole(consoleLabel)
        }

        const consoleLabel = "\n[YooSocket] Sending 'echo' message!"

        this.doWriteInConsole(consoleLabel)

        return this.$yoo.socket.push('echo')
      }, 2000)
    }
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

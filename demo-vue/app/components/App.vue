<template>
  <Page @loaded="doLoaded">
    <ActionBar title="Welcome to NativeScript-Vue!"/>
    <GridLayout
      height="100%"
      width="100%"
    >
    </GridLayout>
  </Page>
</template>

<script>
export default {
  data: () => ({}),
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

      this.doPing()
    },
    doPing () {
      return setInterval(() => {
        console.log('\n')

        if (!this.$yoo.socket.getStatus()) {
          return console.log(
            '[YooSocket]',
            'Socket closed'
          )
        }

        console.log(
          '[YooSocket]',
          "Sending 'echo' message!"
        )
        return this.$yoo.socket.push('echo')
      }, 2000)
    },
    doSocketOpen ($socket) {
      console.log(
        '[YooSocket]',
        "Hey! I'm connected!"
      )
    },
    doSocketClose () {
      console.log(
        '[YooSocket]',
        'Socket was closed'
      )
    },
    doSocketError () {
      console.log(
        '[YooSocket]',
        'Socket had an error'
      )
    },
    doReceivedMessage ($socket, message) {
      if (!message) {
        return console.log(
          '[YooSocket]',
          'Message is empty'
        )
      }

      return console.log(
        '[YooSocket]',
        'Received Message:',
        `'${message}'!`
      )
    },
  }
}
</script>

<style scoped>
  ActionBar {
    background-color: #53ba82;
    color: #ffffff;
  }

  Button {
    padding: 8 12;
    color: #333333;
    background-color: lightgray;
    border-radius: 8;
    margin: 8 0 8 12;
  }

  .message {
    vertical-align: center;
    text-align: center;
    font-size: 20;
    color: #333333;
  }
</style>

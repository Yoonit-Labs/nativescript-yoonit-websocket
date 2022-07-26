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

const ToHashMap = obj => {
  const map = new java.util.HashMap()

  for (var property in obj) {
    if (!obj.hasOwnProperty) continue
    if (obj[property] === null) continue

    var val = obj[property]
    switch (typeof val) {
    case 'object':
      map.put(
        property,
        ToHashMap(val, map)
      )
      break

    case 'boolean':
      map.put(
        property,
        java.lang.Boolean.valueOf(
          String(val)
        )
      )
      break

    case 'number':
      if (Number(val) === val &&
          val % 1 === 0) {
        map.put(
          property,
          java.lang.Long.valueOf(
            String(val)
          )
        )
      } else {
        map.put(
          property,
          java.lang.Double.valueOf(
            String(val)
          )
        )
      }
      break

    case 'string':
      map.put(
        property,
        String(val)
      )
      break
    }
  }

  return map
}

/**
* Checks for running on a emulator
* IPV6 doesn't work properly on emulators; so we have to disable it
* @returns {boolean}
*/
const CheckForEmulator = () => {
  const res = android.os.Build.FINGERPRINT

  if (res.indexOf('generic') === -1) {
    return
  }

  const setProperty = java.lang.System.setProperty

  setProperty('java.net.preferIPv6Addresses', 'false')
  setProperty('java.net.preferIPv4Stack', 'true')
}

const UTF8ArrayToStr = function (data) {
  const count = data.length
  let result = ''
  let i = 0
  let c1
  let c2
  let c3

  while (i < count) {
    c1 = data[i++]

    switch (c1 >> 4) {
    case 12: // 10xx xxxx
    case 13: // 110x xxxx
      c2 = (data[i++] & 0x3F)
      result += String.fromCharCode(((c1 & 0x1F) << 6) | c2)

      break

    case 14: // 1110 xxxx
      c2 = (data[i++] & 0x3F) << 6
      c3 = (data[i++] & 0x3F)
      result += String.fromCharCode(((c1 & 0x0F) << 12) | c2 | c3)

      break

    default: // 0xxxxxxx
      result += String.fromCharCode(c1)

      break
    }
  }

  return result
}

export {
  CheckForEmulator,
  ToHashMap,
  UTF8ArrayToStr
}

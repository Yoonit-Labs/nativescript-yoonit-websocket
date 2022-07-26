import { NativeScriptConfig } from '@nativescript/core';

export default {
  id: 'dev.yoonit.websocket.demo',
  appResourcesPath: 'App_Resources',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none'
  }
} as NativeScriptConfig;

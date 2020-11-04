import { NativeScriptConfig } from '@nativescript/core';

export default {
  id: 'ai.cyberlabs.yoonit.websocket.demo',
  appResourcesPath: 'App_Resources',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none'
  }
} as NativeScriptConfig;

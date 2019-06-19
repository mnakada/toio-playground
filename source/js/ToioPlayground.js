/*

  frontend/js/ToioPlayground.js

*/
'use strict';

import Vue from 'vue';
// css
import 'element-ui/lib/theme-chalk/base.css';
import '../css/localStyle.css';

import SocketClient from 'socket.io-client';
import TopMenu from '../vue/TopMenu.vue';

// for webpack
import '../index.html';

class ToioPlayground {
  constructor() {
    global.Socket = SocketClient();

    document.addEventListener('DOMContentLoaded', (ev) => {
      // IE Error
      const ua = window.navigator.userAgent.toLowerCase();
      if((ua.indexOf('msie') > 0) ||
         (ua.indexOf('trident/7') > 0)) {
        document.body.innerHTML = '<h2><br>このページはHTML5ブラウザのみの対応です。<br>申し訳ありませんがChrome/Safari/Firefoxでアクセスしてください。<br></h2>';
        return;
      }

      // vue
      new Vue({
        el: '#app',
        template: '<top-menu/>',
        components: { TopMenu },
      });
    });
  }
}
new ToioPlayground();

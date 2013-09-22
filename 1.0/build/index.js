/*
combined files : 

gallery/albums/1.0/album-tpl
gallery/albums/1.0/dialog
gallery/albums/1.0/rotate
gallery/albums/1.0/index

*/
/**
 * Generated By grunt-kissy-template
 */
KISSY.add('gallery/albums/1.0/album-tpl',function(){
    return {"html":"<div class=\"handers{{#if index === len - 1}} step-last{{/if}}{{#if index === 0}} step-start{{/if}}\">\n  <span class=\"prev album-prev hander\">&lt;</span>   \n  <span class=\"next album-next hander\">&gt;</span>   \n</div>\n<div class=\"box\">   \n  <div class=\"album-action-bar\">\n    <a class=\"album-big action\" data-action=\"zoom\" href=\"#nowhere\"></a>\n    <a class=\"album-small action\" data-action=\"zoom\" href=\"#nowhere\"></a>\n    <a class=\"rotation-pro action\" data-action=\"rotation-pro\" href=\"#nowhere\"></a>\n    <a class=\"rotation-con action\" data-action=\"rotation-con\" href=\"#nowhere\"></a>\n  </div>\n  <div class=\"box-main album-loading\" style=\"height: {{h - 20}}px\">  \n    {{#if download}}\n      <a href=\"{{download}}\"><img class=\"{{imgCls}}\" src=\"{{src}}\" alt=\"\" /></a>\n    {{else}}\n      <img class=\"{{imgCls}}\" src=\"{{src}}\" style=\"display: none\" alt=\"\" />\n    {{/if}}\n  </div>   \n  <div class=\"box-aside\" style=\"height: {{h}}px\">   \n    <div class=\"aside-wrap\">  \n      <div class=\"headline\"><em class=\"J_num num\">{{index + 1}}/{{len}}</em>{{title}}</div>  \n      {{#if desc}}\n      <p class=\"J_desc desc\">{{prefix}}: {{{desc}}}</p>  \n      {{/if}}\n    </div>   \n  </div>   \n</div>\n"};
});
KISSY.add('gallery/albums/1.0/dialog',function(S, Overlay, DD){

  var drag;
  var dialog = new S.Dialog({
      width: '100%',
      height: '100%',
      elCls: 'albums-dialog'
  });

  var contentEl;
  //禁止滚动事件和隐藏滚轮
  dialog.on('show', function(){

    S.Event.on(window, 'mousewheel', function(e){
      e.halt();
    })
    S.all('html').css('overflow-y', 'hidden')

    renderDD();

  });

  function renderDD(){

    drag && drag.destroy();

    drag = new DD.Draggable({
      node: contentEl.all('.J_img'),
      move: true
    });

  }

  //恢复滚动和滚轮
  dialog.on('hide', function(){

    S.Event.detach(window, 'mousewheel');
    S.all('html').css('overflow-y', 'auto')

  });

  dialog.on('change:step', renderDD);

  function distribution(name){
    return function(e){
      var id = dialog.get('album-id');
      dialog.fire(name + ':' + id, { el: e.currentTarget });
    };
  }

  var winBox = {};

  dialog.getWinHeight = function(){
    if (!winBox.height) {
      winBox.height = S.DOM.viewportHeight();
    }
    return winBox.height;
  };

  dialog.getWinWidth = function(){
    if (!winBox.width) {
      winBox.width = S.DOM.viewportWidth();
    }
    return winBox.width;
  };

  //dom渲染完成后
  dialog.on('afterRenderUI', function(){

    contentEl = dialog.get('contentEl');

    contentEl.delegate('click', '.hander', distribution('hander'));

    contentEl.delegate('click', '.action', distribution('action'));

    S.Event.on(window, 'resize', function(){
        if (dialog.get('visible')) {
          var id = dialog.get('album-id');
          dialog.fire('resize:' + id);
          winBox = {};
        }
    });

    S.Event.on(document, 'keyup', function(e){
      if (dialog.get('visible')) {
        var id = dialog.get('album-id');
        if (e.keyCode === 39){
          dialog.fire('next:' + id);
        } else if (e.keyCode === 37) {
          dialog.fire('prev:' + id);
        }
      }
    });


  });

  return dialog;

}, {
  requires: [ 'overlay', 'dd' ]
});

KISSY.add('gallery/albums/1.0/rotate',function(S){

  function rotate(degree, scale){

    var css = {};

    if (scale === undefined) scale = 1;

    if (S.UA.ie && S.UA.ie < 9) {
      css = cssIE(degree, scale);
    } else {
      css = cssRotate(degree, scale);
    }

    return css;

  }

  function cssIE(degree, scale){
    degree = degree / 180 * Math.PI;
    var costheta = Math.cos(degree) * scale;
    var sintheta = Math.sin(degree) * scale;
    var sinthetaN = - Math.sin(degree) * scale;
    var filter = "progid:DXImageTransform.Microsoft.Matrix(M11={costheta},M12={sinthetaN},M21={sintheta},M22={costheta},SizingMethod='auto expand')";
    filter = S.substitute(filter, { costheta: costheta, sintheta: sintheta, sinthetaN: sinthetaN });
    return { filter: filter };
  }

  function cssRotate(degree, scale){

    var css = { 
      '-moz-transform': "rotate({degree}deg) scale({scale})",
      '-webkit-transform': "rotate({degree}deg) scale({scale})",
      '-ms-transform': "rotate({degree}deg) scale({scale})",
      '-o-transform':  "rotate({degree}deg) scale({scale})",
      'transform': "rotate({degree}deg) scale({scale})"
    };

    S.each(css, function(text, key){
      css[key] = S.substitute(text, { degree: degree, scale: scale });
    });

    return css;

  }

  return rotate;
});

/**
 * @fileoverview 
 * @author hanwen.sah<hanwen.sah@taobao.com>
 * @module albums
 **/
KISSY.add('gallery/albums/1.0/index',function (S, Node, Base, Overlay, Anim, TPL, XTemplate, dialog, rotate) {

  var EMPTY = '';
  var $ = Node.all;

  var HTML_BODY = new XTemplate(TPL.html);

  /**
   * 请修改组件描述
   * @class Albums
   * @constructor
   * @extends Base
   */
  function Albums(comConfig) {
    var self = this;
    //调用父类构造函数
    Albums.superclass.constructor.call(self, comConfig);
    self.init();
  }

  function getNaturlWidth(el){
    if (el.prop('naturalWidth')) {
      return { 
        width: el.prop('naturalWidth'), 
        height: el.prop('naturalHeight') 
      };
    } else {
      var img = new Image();
      img.src = el.attr('src');
      return { 
        width: img.width, 
        height: img.height 
      };
    }
  }

  S.extend(Albums, Base, /** @lends Albums.prototype*/{

    init: function(){

      var baseEl = this.get('baseEl');

      if (!baseEl.length) return;
      //调用setter，传递一个参数1，本身没有意义，最终id会是通过guid生成的
      this.set('id', 1);

      dialog.render();

      this._bindEvent();

    },

    _setEls: function(){
      var baseEl = this.get('baseEl');
      var imgList = $(this.get('img'), baseEl);

      imgList.each(function(el, i){
        el.attr('data-index', i);
      });

      this.set('imgList', imgList);
      this.set('len', imgList.length);
      return imgList;
    },

    _bindEvent: function(){

      var baseEl = this.get('baseEl');
      var evt = this.get('trigger');
      var img = this.get('img');

      S.Event.delegate(baseEl, evt, img, this._show, this);

      var id = this.get('id');
      dialog.on('hander:' + id, this._go, this);
      dialog.on('action:' + id, this._action, this);
      dialog.on('resize:' + id, this._resize, this);

      var self = this;
      //键盘事件前进后退
      dialog.on('prev:' + id, function(){ self.go(-1); });
      dialog.on('next:' + id, function(){ self.go(1); });

      this.on('switch', this._hander, this);

    },

    /**
     * 放大缩小和旋转功能
     */
    _action: function(e){

      var target = e.el;
      var action = $(target).attr('data-action');

      if (action == 'rotation-con') {
        this._rotation(-90);
      } else if (action == 'rotation-pro') {
        this._rotation(90);
      } else if (action == 'zoom') {
        this._zoom($(target));
      }
    },

    //旋转图片
    _rotation: function(degree){

      var imgEl = dialog.get('contentEl').all('.J_img');
      var rotation = this.get('rotation');
      var scale = this.get('scale');

      rotation += parseInt(degree, 10);
      //rotation = rotation % 360;

      this.set('rotation', rotation);

      var css = rotate(rotation, scale);

      imgEl.css(css);

    },

    _resize: function(){
      var el = dialog.get('contentEl').all('.J_img');
      var viewH = dialog.getWinHeight() - 74 - 20;
      dialog.get('contentEl').all('.box-main').height(viewH - 20);
      dialog.get('contentEl').all('.box-aside').height(viewH);
      this._position(el, true);
    },

    // 处理上一个和下一个
    _hander: function(e){

      var contentEl = dialog.get('contentEl');
      var hander = contentEl.all('.hander');

      if (e.from === 0) {
        hander.removeClass('step-start');
      }

      if (e.to === 0) {
        hander.addClass('step-start');
      }

      var len = this.get('len') - 1;
      if (e.to === len) {
        hander.addClass('step-last');
      }

      if (e.from === len) {
        hander.removeClass('step-last');
      }
    },

    _zoom: function(target){

      var el = dialog.get('contentEl').all('.J_img');

      var isBig = target.hasClass('album-big');

      if (isBig) {

        this._zoomOut(el);

      } else {

        var rotation = this.get('rotation');
        var zoomFit = this.get('zoomFit');
        var css = rotate(rotation, zoomFit);
        el.css(css);

        this.set('scale', zoomFit);
        this._position(el, true);

      }

    },

    _zoomOut: function(el){
      var rotation = this.get('rotation');
      var scale = this.get('scale');
      scale += 0.2;
      if (scale < 1) scale = 1;
      var css = rotate(rotation, scale);
      el.css(css);
      this.set('scale', scale);
    },

    //设置合适屏幕的位置
    _position: function(el, noAnim){

      if (!el.data('loaded')) return;

      var box = getNaturlWidth(el);

      var viewH = dialog.getWinHeight() - 74 - 20;
      var viewW = dialog.getWinWidth() - 74 - 235 - 20;
      var h = box.height;
      var w = box.width;
      var top = 0, left = 0;
      var display = noAnim ? 'inline' : 'none';
      var css = {
        top: top, 
        left: left,
        position: 'relative',
        display: display
      };

      //适合缩放比例
      var zoomFit = 1;

      if (h > viewH || w > viewW) {

        if (h / viewH > w / viewW) {
          zoomFit = viewH / h;
          css.top = - (h - viewH) / 2;
          css.left = (viewW - w ) / 2;
          //css.left = (viewW - w * zoomFit) / 2;
        } else {
          zoomFit = viewW / w;
          css.top = (viewH - h) / 2;
          css.left = - (w - viewW) / 2;
        }

      } else {

        css.left = (viewW - w) / 2;
        css.top = (viewH - h) / 2;

      }

      if (!noAnim) {
        css = S.mix(rotate(0, zoomFit), css);
      }

      el.css(css);
      dialog.get('contentEl').all('.album-loading').removeClass('album-loading');
      if (!noAnim) {
        el.fadeIn();
      }

      this.set('zoomFit', zoomFit);
      this.set('scale', zoomFit);
    },

    /**
     * 显示图片
     * @param {Node|string|HTMLElement} el
     */
    show: function(el, callback){
      var base = this.get('baseEl');
      this._show({ target: base.all(el)[0] }, callback);
    },

    //显示图片
    _show: function(evt, callback){

      this.set('rotation', 0);
      var target = evt.target;
      var url = $(target).attr('data-original-url');

      var download = $(target).attr('data-download');

      if (!url) url = target.src;

      this._setEls();

      var index = $(target).attr('data-index');
      this.set('index', parseInt(index, 10));

      var len = this.get('len');
      var pos = + index + 1;

      var viewH = dialog.getWinHeight();
      var viewW = dialog.getWinWidth();

      var obj = {
        src: url,
        imgCls: 'J_img',
        index: +index,
        len: len,
        h: viewH - 74,
        desc: $(target).attr('data-desc') || '',
        download: download,
        title: this.get('title')
      };

      var html = this.get('template').render(S.mix(obj, this.get('datas')));

      dialog.set('bodyContent', html);
      dialog.show();

      dialog.set('album-id', this.get('id'));

      var el = dialog.get('contentEl').all('.J_img');
      var self = this;
      el.data('loaded', false);

      el.on('load', function(){
        el.data('loaded', true);
        self._position(el);
        callback && callback();
      });

    },

    next: function(){
    },

    /**
     * 移动步数，正数向前，负数向后
     */
    go: function(step){

      step = parseInt(step, 10);
      var len = this.get('imgList').length;
      var index = this.get('index') + step;

      //超出边界值
      if (index < 0 || index > len - 1) {
        return;
      }

      var baseEl = this.get('baseEl');
      var img = this.get('imgList').item(index);

      this.fire('switch', {from: this.get('index'), to: index});
      this.show(img, function(){
        dialog.fire('change:step');
      });
    },

    _go: function(e){

      var target = $(e.el);
      var step = target.hasClass('prev') ? -1 : 1;
      this.go(step);

    }

  }, {ATTRS : /** @lends Albums*/{

    baseEl: {
      setter: function(el){
        return $(el);
      }
    },

    imgList: { value: null },
    // image selector
    img: { value: '.J_ImgDD' },

    len: { value: 0},

    // trigger event of open imgView
    trigger: { value: 'click' },

    title: { value: '查看图片' },

    index: { value: 0 },

    datas: { 
      value: { prefix: "图片说明" }
    },

    template: { value: HTML_BODY },

    id: { setter: function(){ return S.guid(); }},

    //旋转角度
    rotation: { value: 0 },

    scale: { value: 1 }

  }});

  return Albums;

}, {requires:[
  'node', 
  'base', 
  'overlay',
  'anim',
  './album-tpl',
  'xtemplate',
  './dialog',
  './rotate',
  './index.css'
]});


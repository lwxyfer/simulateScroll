'use strict';

/**
 * scroll picker
 * customize data: such as time and city
 */


  var Picker = function(element, options) {
    console.log('init')
    this.$element = $('.picker');
    this.$col = this.$element.find('.col');
    this.$mask = this.$element.find('.mask');
    this.length = this.$col.length;
    this.$data = this.$element.find('.data');
    this.init();
    this.mouseMove();
    this.touchMove();
  };

  Picker.DEFAULTS = {
    width: '100%',
    height: 200
  };

  // 动画兼容性支持
  var rAF = window.requestAnimationFrame	||
  window.webkitRequestAnimationFrame	||
  window.mozRequestAnimationFrame		||
  window.oRequestAnimationFrame		||
  window.msRequestAnimationFrame		||
  function (callback) { window.setTimeout(callback, 1000 / 60); };

  Picker.prototype = {

    // init
    // 动态设置宽高
    init: function() {
      var per = 100 * this.length;
      this.$col.css('width', per + '%');

      this.h = this.$data.css('fontSize'); // 全局大小设置的基础
      console.log(this.h);
    },

    move: function() {

      var h = -100;
      // this.$data.eq(1).css('transform','translateY(' + h + 'px)');
    },

    index: function() {

    },

    // init to cal what we need
    calSize: function() {

    },

    mouseMove: function() {

      var _this = this;
      var position = 0;  // 表示节点当前位置
      var index = 0; // 在多个col下的序列值维护, 一个 col 就是一个滚动的实例
      var duration = 0; // the time when mousedown and mouseup
      var distance = 0; // the distance when mousedown and mouseup
      var startTime = 0;
      var startPoint = 0;
      var kRecord = [];

      this.$mask.on('mousedown', function(e) {

        var self = this;

        startPoint = e.offsetY;

        index = _this.$mask.index(this);

        console.log('current index:', index);
        position = $(this).data('top') || Number(_this.$data.eq(index).css('top').slice(0, -2));

        console.log('mousedown posiiton: ', position);
        console.log('real data-top: ', $(this).data('top'));
        console.log('Get top form css: ', Number(_this.$data.eq(index).css('top').slice(0, -2)));

        e.preventDefault();

        var old = startPoint;
        var direction = 1;
        startTime = Date.now();

        // if mousedown, on mousemove; if mouseup, off mousemove
        _this.$mask.on('mousemove', function(e) {

          // console.log(e.offsetY, e.pageY, e.offsetY)
          e.preventDefault();

          // if (old === 0) {
          //   old = e.offsetY;
          // }
          console.log('move e.offsetY')

          if (e.offsetY - old > 0) {
            direction = 2;
          } else if (e.offsetY - old < 0) {
            direction  = -2;
          }
          old = e.offsetY;
          position += direction;
          // console.log('direction: %s, position: %s', direction, position);

          _this.$data.eq(index).css('top', position);  // 不需要动画

        });
      });

      // 目前需要处理： 快速点击移动，然后放开的一个动画效果
      this.$mask.on('mouseup', function(e, outPosition, outTime) {
        console.log('mouseup happing');

        // Need off mousemove， 注意兄弟元素之间的值设置
        _this.$mask.off('mousemove');

        duration = (outTime || Date.now()) - startTime;
        distance = (outPosition || e.offsetY) - startPoint;

        var k = distance / duration; // a quick event, so set it as a speed;
        kRecord.push(k);
        console.log(kRecord)
        console.log('duration: %s', 'startPoint: %s', 'speed: %s',duration, distance, k);
        console.log('index up:', index);

        // var ter = getInteger(position, 30);
        _this.$mask.eq(index).data('top', position);
        // _this.$data.eq(index).css('top', ter);

        // if a quick move happening, animate it
        var speed = k ; // 通过速度决定移动的距离
        console.log('speed quadratic:', 'kkkkkkkk:', speed, k)

        if (Math.abs(speed) > 0.7) {

          _this.$data.eq(index).animate({
            top: '+=' + speed * 150 + 'px'
          }, 200, function() {

            position +=  speed * 150;
            _this.$mask.eq(index).data('top', position);

            console.log('animate move after:', position)

            if (Math.abs(position) < 750) {
              _this.$data.eq(index).css('top', getInteger(position, 30) + 15);
            }
            if ( Math.abs(position) > 750 && position < 0) {
              _this.$data.eq(index).animate({
                top:  -765 + 'px'
              }, 300, function() {
                // position =  speed * 100;
                _this.$mask.eq(index).data('top', -765);
              });
            }
            if ( Math.abs(position) > 150 && position > 0) {

              _this.$data.eq(index).animate({
                top:  135 + 'px'
              }, 300, function() {
                // position =  speed * 100;
                _this.$mask.eq(index).data('top', 135);
              });
            }
          });

        } else if (Math.abs(speed) < 0.7) {

          console.log('position after up: ', position)

          if (Math.abs(position) < 750) {
            _this.$data.eq(index).css('top', getInteger(position, 30) + 15);
          }
          if ( Math.abs(position) > 750 && position < 0) {
            _this.$data.eq(index).animate({
              top:  -765 + 'px'
            }, 200, function() {
              // position =  speed * 100;
              _this.$mask.eq(index).data('top', -765);
            });
          }
          if ( Math.abs(position) > 150 && position > 0) {
            console.log('is it ok')
            _this.$data.eq(index).animate({
              top:  135 + 'px'
            }, 200, function() {
              // position =  speed * 100;
              _this.$mask.eq(index).data('top', 135);
            });
          }
        }

        console.log('after up top:', _this.$mask.eq(index).data('top'))
        console.log('after up top css:', _this.$data.eq(index).css('top'))
      });

      // 只有在 mousedown 后才能绑定 mouseout 事件
      _this.$mask.on('mouseout', function(e) {
        console.log('move outtttttttttttt: %s', e.offsetY);
        _this.$mask.off('mousemove');
        // _this.$mask.trigger('mouseup', e.offsetY, Date.now());

          if (Math.abs(position) < 750) {
            _this.$data.eq(index).css('top', getInteger(position, 30) + 15);
          }
          if ( Math.abs(position) > 750 && position < 0) {
            _this.$data.eq(index).animate({
              top:  -765 + 'px'
            }, 200, function() {
              // position =  speed * 100;
              _this.$mask.eq(index).data('top', -765);
            });
          }
          if ( Math.abs(position) > 150 && position > 0) {
            _this.$data.eq(index).animate({
              top:  135 + 'px'
            }, 200, function() {
              // position =  speed * 100;
              _this.$mask.eq(index).data('top', 135);
            });
          }

      });


    },

    // IScroll 的源码中对多种事件支持的实现
    // 需要节流函数，防止调用过快导致的卡顿
    touchMove: function() {

      var _this = this;
      var position = 0;  // 表示节点当前位置
      var index = 0; // 在多个col下的序列值维护
      var duration = 0; // the time when mousedown and mouseup
      var distance = 0; // the distance when mousedown and mouseup
      var startTime = 0;
      var startPoint = 0;
      var kRecord = [];

      this.$mask.on('touchstart', function(e) {

        var self = this;

        console.log('touch', e.changedTouches)

        e = e.changedTouches[0];

        startPoint = e.clientY;
        index = _this.$mask.index(this);
        console.log('current index:', index);
        position = $(this).data('top') || Number(_this.$data.eq(index).css('top').slice(0, -2));
        console.log('touchstart physic posiiton: ', startPoint);
        console.log('css: %s', 'data-top: %s', $(this).data('top'), Number(_this.$data.eq(index).css('top').slice(0, -2)));

        // e.preventDefault();

        var old = startPoint;
        var direction = 1;
        startTime = Date.now();

        // if mousedown, on mousemove; if mouseup, off mousemove
        _this.$mask.on('touchmove', function(e) {

          // console.log(e.clientY, e.pageY, e.clientY)
          e.preventDefault();

          // if (old === 0) {
          //   old = e.clientY;
          // }
          e = e.changedTouches[0];



          console.log('move clientY: ', e.clientY)

          var replacement = e.clientY - old;
          if (old === e.clientY) {
            return true;
          }
          if (replacement > 1) {
            direction = 0.7;
          } else if (replacement < -1) {
            direction  = -0.7;
          } else {
            return true;
          }
          old = e.clientY;
          position += direction;
          console.log('POS ', old, e.clientY, position, direction, replacement)
          // console.log('direction: %s, position: %s', direction, position);

          _this.$data.eq(index).css('top', position);  // 不需要动画

        });
      });

      // 目前需要处理： 快速点击移动，然后放开的一个动画效果
      this.$mask.on('touchend', function(e, outPosition, outTime) {
        console.log('touchend happing');

        e = e.changedTouches[0];
        // Need off mousemove， 注意兄弟元素之间的值设置
        _this.$mask.off('mousemove');

        duration = (outTime || Date.now()) - startTime;
        distance = (outPosition || e.clientY) - startPoint;

        var k = distance / duration; // a quick event, so set it as a speed;
        kRecord.push(k);
        console.log(kRecord)
        console.log('duration: %s', 'startPoint: %s', 'speed: %s',duration, distance, k);
        console.log('index up:', index);

        // var ter = getInteger(position, 30);
        _this.$mask.eq(index).data('top', position);
        // _this.$data.eq(index).css('top', ter);

        // if a quick move happening, animate it
        var speed = k ; // 通过速度决定移动的距离
        console.log('speed quadratic:', 'kkkkkkkk:', speed, k)

        if (Math.abs(speed) > 0.9) {

          _this.$data.eq(index).animate({
            top: '+=' + speed * 150 + 'px'
          }, 300, function() {

            position +=  speed * 150;
            _this.$mask.eq(index).data('top', position);

            console.log('animate move after:', position)

            if (Math.abs(position) < 750) {
              _this.$data.eq(index).css('top', getInteger(position, 30) + 15);
            }
            if ( Math.abs(position) > 750 && position < 0) {
              _this.$data.eq(index).animate({
                top:  -765 + 'px'
              }, 200, function() {
                // position =  speed * 100;
                _this.$mask.eq(index).data('top', -765);
              });
            }
            if ( Math.abs(position) > 150 && position > 0) {
              _this.$data.eq(index).animate({
                top:  135 + 'px'
              }, 200, function() {
                // position =  speed * 100;
                _this.$mask.eq(index).data('top', 135);
              });
            }
          });

        } else if (Math.abs(speed) < 0.9) {
          if (Math.abs(position) < 750) {
            _this.$data.eq(index).css('top', getInteger(position, 30) + 15);
          }
          if ( Math.abs(position) > 750 && position < 0) {
            _this.$data.eq(index).animate({
              top:  -765 + 'px'
            }, 200, function() {
              // position =  speed * 100;
              _this.$mask.eq(index).data('top', -765);
            });
          }
          if ( Math.abs(position) > 150 && position > 0) {
            _this.$data.eq(index).animate({
              top:  135 + 'px'
            }, 200, function() {
              // position =  speed * 100;
              _this.$mask.eq(index).data('top', 135);
            });
          }
        }

        console.log('after up top:', _this.$mask.eq(index).data('top'))
        console.log('after up top css:', _this.$data.eq(index).css('top'))
      });

      // 只有在 mousedown 后才能绑定 mouseout 事件
      _this.$mask.on('touchcancel', function(e) {
        e = e.changedTouches[0];
        console.log('move outtttttttttttt: %s', e.clientY);
        _this.$mask.off('mousemove');
        // _this.$mask.trigger('mouseup', e.offsetY, Date.now());

        if (Math.abs(position) < 750) {
          _this.$data.eq(index).css('top', getInteger(position, 30) + 15);
        }
          if ( Math.abs(position) > 750 && position < 0) {
            _this.$data.eq(index).animate({
              top:  -765 + 'px'
            }, 200, function() {
              // position =  speed * 100;
              _this.$mask.eq(index).data('top', -765);
            });
          }
          if ( Math.abs(position) > 750 && position > 0) {
            _this.$data.eq(index).animate({
              top:  135 + 'px'
            }, 200, function() {
              // position =  speed * 100;
              _this.$mask.eq(index).data('top', 135);
            });
          }

      });

  }



};


  // private function

  /**
   * input a number to get a number which is integral multiple of base
   */
  function getInteger(origin, base) {
    var remainder = origin % base;
    if (remainder < (base / 2)) {
      return origin - remainder;
    } else {
      return origin - remainder + (remainder < 0 ? -base : base);
    }
  }



var aa = new Picker();


// 时间支持
// me.extend(me.eventType = {}, {
//   touchstart: 1,
//   touchmove: 1,
//   touchend: 1,
//
//   mousedown: 2,
//   mousemove: 2,
//   mouseup: 2,
//
//   pointerdown: 3,
//   pointermove: 3,
//   pointerup: 3,
//
//   MSPointerDown: 3,
//   MSPointerMove: 3,
//   MSPointerUp: 3
// });


// Array[25]0: 01: -0.57971014492753632: -0.88405797101449283: -0.86206896551724134: -0.92307692307692315: -1.1086956521739136: -1.38757: -1.31258: -1.87323943661971839: -0.882352941176470610: -1.697368421052631611: -1.139784946236559212: -1.538461538461538513: -1.679487179487179514: -1.277777777777777715: -1.69662921348314616: -0.89655172413793117: -0.864197530864197518: -0.694117647058823519: -0.834951456310679620: -0.911764705882352921: -0.90551181102362222: -0.666666666666666623: -0.809090909090909124: -0.793478260869565225: -0.0323446517246007226: -0.0323272971160295127: -0.03230563002680965428: -0.0322796678274846length: 2

// Array[25]0: 01: -0.57971014492753632: -0.88405797101449283: -0.86206896551724134: -0.92307692307692315: -1.1086956521739136: -1.38757: -1.31258: -1.87323943661971839: -0.882352941176470610: -1.697368421052631611: -1.139784946236559212: -1.538461538461538513: -1.679487179487179514: -1.277777777777777715: -1.69662921348314616: -0.89655172413793117: -0.864197530864197518: -0.694117647058823519: -0.834951456310679620: -0.911764705882352921: -0.90551181102362222: -0.666666666666666623: -0.809090909090909124: -0.793478260869565225: -0.0323446517246007226: -0.0323272971160295127: -0.03230563002680965428: -0.0322796678274846length: 29__proto__: Array[0]
// index.js:121 duration: startPoint: %s speed: %s 184 -146 -0.7934782608695652

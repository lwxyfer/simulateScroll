'use strict';

/**
 * scroll picker
 * customize data: such as time and city
 */

  var Picker = function(element, options) {
    console.log('init')
    this.$element = $('.picker');
    this.options = $.extend({}, Picker.DEFAULTS, options);

    this.init();
  };

  Picker.DEFAULTS = {
    width: '100%',
    height: 200,
    data: [
      {
        value: function() {
          var a = [];
          for (var i=24; i>0; i--) {
            a.push(2000 + i)
          };
          return a;
        },
        unit: '年'
      },
      {
        value: function() {
          var a = [];
          for (var i=12; i>0; i--) {
            a.push(i)
          }
          return a;
        },
        unit: '月'
      },
      {
        value: function() {
          var a = [];
          for (var i=31; i>0; i--) {
            a.push(i)
          }
          return a;
        },
        unit: '日'
      }
    ],
    // momentumRatio:
  };

  Picker.prototype.init = function() {
    var _this = this;
    var options = this.options;
    this.originData = null;
    this.wrapHeight = this.$element.height();

    //  generate DOM
    this.prepareDOM();

    this.$col = this.$element.find('.col');
    this.$col.css('width', 100 / this.$col.length + '%')

    // store picked data
    this.pickerData = [];

    // create instance for every col
    this.$col.each(function(){
      _this.pickerData.push(0);
      new Col(this, _this.wrapHeight, _this);
    });
  };

  Picker.prototype.prepareDOM = function() {
    var _this = this;
    var options = this.options;

    options.data.forEach(function(data, index) {
      var colTpl = $('<div class="col"><div class="mask"></div><div class="bgtop"></div><div class="bgbot"></div></div>');
      var dataTpl = $('<div class="data"></div>');
      var unit = '';
      var datasTpl = '';

      if ($.type(data.value) === 'function') {
        console.log('value is function')

        var dd = data.value();
        console.log('返回的数据', dd);

        dd.forEach(function(domContent){
          datasTpl += '<div class="item">' + domContent +'</div>';
        });

        options.data[index].value = dd; // if function, replacing it

      } else {
        data.value.forEach(function(item) {
          datasTpl += '<div class="data">' + data +'</div>';
        });
      }

      if (data.unit) {
        unit = '<div class="unit">'+ data.unit +'</div>'
        colTpl.append(unit);
      }
      dataTpl.append(datasTpl);
      colTpl.append(dataTpl);
      _this.$element.append(colTpl);
    })
  }

  Picker.prototype.getDate = function() {
    var ii = this.pickerData;
    ii.forEach(function(i) {

    })
  }

  // col function
  // =====================================================================
  var Col = function(ele, height, that) {
    console.log(ele)
    this.thisPicker = that;
    this.fullHeight = height;
    this.$eleCol = ele;
    this.$mask = $(ele).find('.mask');
    this.$data = $(ele).find('.data');
    this.$item = $(ele).find('.item');
    this.$item.eq(0).addClass('am-picker-active')

    this.init();
  }

  Col.prototype = {

    // init col
    init: function() {
      this.length = this.$item.length; // item length
      this.height = this.$item.height(); // get item height

      this.wrapHeight = this.fullHeight; // col height

      this.initPosition = this.wrapHeight/2 - this.height/2;
      this.maxTranslate = (this.length -1) * this.height;

      console.log(this.height, this.wrapHeight, this.initPosition);

      // init promary position
      this.$data.css('top', this.initPosition + 'px');

      this.smoothMove();
    },

    smoothMove: function() {
      var _ = this;

      // avoid every time to declare this variable

      var startPosition = 0;  // primary position: when mousedown to update this
      var duration = 0; // the time when mousedown and mouseup
      var startTime = 0; // every mousedown to update this time
      var direction;
      var position = 0; // mouse position in mask DOM
      var translatePosition = 0; // scroll-layer's translateY value

      // 一个是mask上面鼠标的位置，一个是滚动层的位置

      this.$mask.on('mousedown', function(e) {
        console.log('click');

        startPosition = e.offsetY;
        position = e.offsetY;
        startTime = Date.now();

        console.log('start position', startPosition);

        _.$mask.on('mousemove', function(e) {
          e.preventDefault();
          _.$data.css('transition-duration', '0ms');

          if (e.offsetY - position > 0) {
            direction = 3; // Maybe use Golden ratio
          } else if (e.offsetY - position < 0) {
            direction  = -3;
          }
          position = e.offsetY;
          translatePosition += direction;

          _.$data.css('transform', 'translate3d(0,' + translatePosition +'px,0)');

        });

        _.$mask.on('mouseup mouseout', function(e) {
          _.$mask.off('mousemove');
          // console.log('up to off mousemove');

          // Momentum
          if (Date.now() - startTime < 100 && e.offsetY - startPosition !== 0) {
            console.log('时间差',Date.now() - startTime);
            duration = Date.now() - startTime;
            var speed = (e.offsetY - startPosition) / duration;
            console.log('SPEED ============', speed, speed*speed*speed*80);

            translatePosition = translatePosition + speed*speed*speed*80;

            _.$data.css('transition-duration', '200ms');
            _.$data.css('transform', 'translate3d(0,' + translatePosition +'px,0)');
          }

          // click and no move
          if (e.offsetY - startPosition === 0) {
            console.log('区域点击', e.offsetY);
            var autoNum = 0;
            _.$data.css('transition-duration', '200ms');
            if (e.offsetY < _.wrapHeight/2) {
              autoNum = Math.round((_.wrapHeight/2 - e.offsetY) / _.height);

              translatePosition = translatePosition + _.height * autoNum;
              _.$data.css('transform', 'translate3d(0,' + translatePosition +'px,0)');
            } else {
              autoNum = Math.round((e.offsetY - _.wrapHeight/2) / _.height);

              translatePosition = translatePosition - _.height * autoNum;
              _.$data.css('transform', 'translate3d(0,' + translatePosition +'px,0)');
            }
          }

          if (translatePosition > 0) {
            translatePosition = 0;
          }

          if (translatePosition < -_.maxTranslate) {
            translatePosition = -_.maxTranslate;
          }

          translatePosition = getInteger(translatePosition, _.height);

          console.log('处理后的值', translatePosition);
          _.$data.css('transform', 'translate3d(0,' + translatePosition +'px,0)');

          _.getIndex(translatePosition);

          _.$mask.off('mouseup mouseout');
        });
      });
    },

    getIndex: function(pos) {
      var i = Math.abs(pos / this.height);
      this.$item.removeClass('am-picker-active').eq(i).addClass('am-picker-active');
      this.thisPicker.pickerData[this.thisPicker.$col.index(this.$eleCol)] = i;
      console.log(this.thisPicker.pickerData)
    }

  };


  // private function

  /**
   * input a number to get a number which is integral multiple of base
   */
  function getInteger(origin, base) {
    console.log(origin)
    var remainder = origin % base;
    if (Math.abs(remainder) < (base / 2)) {
      return origin - remainder;
    } else {
      return origin - remainder + (remainder < 0 ? -base : base);
    }
  }



var aa = new Picker();

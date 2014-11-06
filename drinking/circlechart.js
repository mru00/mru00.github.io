
/*
* Copyright (C) 2014 mru@sisyphus.teil.cc
*/

// requires gradient.js

(function( factory ) {
  factory( jQuery );
}(function( $ ) {

  'use strict';

  $.widget('ui.circlechart', {

    version: '0.1',
    defaultElement: '<div>',
    options: {
      width: 300,
      height: 300,
      value: null,
      color_empty: 'white',
      color_filled: 'yellow_red',
      color_border: '#879694',
      color_text: '#111',
      font: 'normal 60pt Verdana'
    },

    _create: function() {
      var canvas = $('<canvas width="'+this.options.width+'px" height="'+this.options.height+'px" class="circlechart-canvas">');
      this.element.addClass("circlechart");
      this.element.append(canvas);
      this.options.canvas = canvas;
      this.ready = false;
      var that = this;

      this.palette = $.colorgradient({stops: this.options.gradient, nvalues: 150});
      this.element.css('width', this.options.width);

      // wait for webfont load etc...
      $(window).on('load', function() {
        that.ready = true;
        that.draw();
      });
    },

    get_filled_color: function(value) {
      return this.palette.toRGB(value);
    },

    get_text_color: function(value) {
      return this.options.color_text;
    },

    format_number: function(value) {
      if (this.options.value == null) {
        return "?%";
      }
      return Math.floor(this.options.value) + "%";
    },

    widget: function() {
      return this.element;
    },

    _setOption: function(key, value) {
      this._super(key, value);
      this.draw();
    },

    refresh: function() {
      this.draw();
    },

    draw: function() {

      if (!this.ready) return;

      var xc = this.options.width/2;
      var yc = this.options.height/2;
      var r = Math.min(this.options.width, this.options.height) * 0.4;

      var canvas = this.element.find('canvas').get(0);
      var ctx = canvas.getContext('2d');

      ctx.fillStyle = this.options.color_empty;
      ctx.beginPath();
      ctx.arc(xc, yc, r, 0, 2*Math.PI, false);
      ctx.fill();

      var phi_0 = Math.PI/2;

      var text = this.format_number(this.options.value);
      if (this.options.value == null) {
        ctx.fillStyle=this.get_text_color(0);
      }
      else {
        var phi = Math.acos(1 - 2*(Math.min(this.options.value, 100)/100));

        ctx.fillStyle = this.get_filled_color(this.options.value);
        ctx.beginPath();
        ctx.arc(xc, yc, r, phi_0 - phi, phi_0 + phi);
        ctx.fill();


        ctx.fillStyle = this.get_text_color(this.options.value);
      }
      ctx.font = this.options.font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText (text, xc, yc);

      ctx.strokeStyle = this.options.color_border;
      ctx.lineWidth = r/10;
      ctx.beginPath();
      ctx.arc(xc, yc, r, 0, 2*Math.PI, false);
      ctx.stroke();
    }
  });


  return $.ui.circlechart;
}));


/*
 * jTinder v.1.0.0
 * https://github.com/do-web/jTinder
 * Requires jQuery 1.7+, jQuery transform2d
 *
 * Copyright (c) 2014, Dominik Weber
 * Licensed under GPL Version 2.
 * https://github.com/do-web/jTinder/blob/master/LICENSE
 */
;(function ($, window, document, undefined) {
	var pluginName = "jTinder",
		defaults = {
			onDislike: null,
			onLike: null,
			animationRevertSpeed: 200,
			animationSpeed: 400,
			threshold: 1,
			likeSelector: '.like',
			dislikeSelector: '.dislike'
		};

	function Plugin(element, options) {
		this.element = element;
		this.settings = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.init(element);
	}

	Plugin.prototype = {

		init: function (element) {
			this.pane = $(element);
			this.pane_width = this.pane.width();
			this.touchStart = false;
			this.xStart = 0;
			this.yStart = 0;
			this.lastPosX = 0;
			this.lastPosY = 0;
			this.posX = 0;
			this.posY = 0;

			$(element).bind('touchstart', $.proxy(this.handler, this));
			$(element).bind('touchmove', $.proxy(this.handler, this));
			$(element).bind('touchend', $.proxy(this.touchEndHandler, this));
		},

		next: function () {
			this.pane.animate({"opacity": "0"}, 1);
			this.pane.animate({"transform": "none"}, 1);
			this.pane.animate({"opacity": "1"}, this.settings.animationRevertSpeed);
		},

		dislike: function() {
			var self = this;
			this.pane.animate({"transform": "translate(-" + (this.pane_width) + "px," + (this.pane_width*-1.5) + "px) rotate(-60deg)"}, this.settings.animationSpeed, function () {
				if(self.settings.onDislike) {
					self.settings.onDislike(self.pane);
				}
				self.next();
			});
		},

		like: function() {
			var self = this;
			this.pane.animate({"transform": "translate(" + (this.pane_width) + "px," + (this.pane_width*-1.5) + "px) rotate(60deg)"}, this.settings.animationSpeed, function () {
				if(self.settings.onLike) {
					self.settings.onLike(self.pane);
				}
				self.next();
			});
		},

		calcPos: function (pageX, pageY) {
			var delta = {
				x: parseInt(pageX) - parseInt(this.xStart),
				y: parseInt(pageY) - parseInt(this.yStart)
			};
			this.posX = delta.x + this.lastPosX;
			this.posY = delta.y + this.lastPosY;
			return delta;
		},

		calcOpacity: function (delta) {
			var opa = (Math.abs(delta.x) / this.settings.threshold) / 100;
			if(opa > 1.0) {
				opa = 1.0;
			}
			return opa;
		},

		handler: function (ev) {
			switch (ev.type) {
				case 'touchstart':
					if(this.touchStart === false) {
						this.touchStart = true;
						this.xStart = ev.originalEvent.touches[0].pageX;
						this.yStart = ev.originalEvent.touches[0].pageY;
					}
				case 'mousedown':
					if(this.touchStart === false) {
						ev.preventDefault();
						this.touchStart = true;
						this.xStart = ev.pageX;
						this.yStart = ev.pageY;
					}
				case 'mousemove':
				case 'touchmove':
					if(this.touchStart === true) {
						if(ev.type == 'mousemove')
							ev.preventDefault();
						var pageX = typeof ev.pageX == 'undefined' ? ev.originalEvent.touches[0].pageX : ev.pageX;
						var pageY = typeof ev.pageY == 'undefined' ? ev.originalEvent.touches[0].pageY : ev.pageY;
						var delta = this.calcPos(pageX, pageY);

						var percent = delta.x * 100 / this.pane_width;

						this.pane.css("transform", "translate(" + this.posX + "px," + this.posY + "px) rotate(" + (percent / 2) + "deg)");

						var opa = this.calcOpacity(delta);
						if (this.posX >= 0) {
							this.pane.find(this.settings.likeSelector).css('opacity', opa);
							this.pane.find(this.settings.dislikeSelector).css('opacity', 0);
						} else if (this.posX < 0) {

							this.pane.find(this.settings.dislikeSelector).css('opacity', opa);
							this.pane.find(this.settings.likeSelector).css('opacity', 0);
						}
					}
					break;
			}
		},

		touchEndHandler: function (ev) {
			if(ev.type == 'mouseup')
				ev.preventDefault();

			this.touchStart = false;
      var pageX = (typeof ev.pageX == 'undefined') ? ev.originalEvent.changedTouches[0].pageX : ev.pageX;
      var pageY = (typeof ev.pageY == 'undefined') ? ev.originalEvent.changedTouches[0].pageY : ev.pageY;
			var delta = this.calcPos(pageX, pageY);
			var opa = this.calcOpacity(delta);

			var self = this;
			if (opa >= 1) {
				if (this.posX > 0) {
					this.pane.animate({"transform": "translate(" + (this.pane_width) + "px," + (this.posY + this.pane_width) + "px) rotate(60deg)"}, this.settings.animationSpeed, function () {
						if(self.settings.onLike) {
							self.settings.onLike(self.pane);
						}
						self.next();
					});
				} else {
					this.pane.animate({"transform": "translate(-" + (this.pane_width) + "px," + (this.posY + this.pane_width) + "px) rotate(-60deg)"}, this.settings.animationSpeed, function () {
						if(self.settings.onDislike) {
							self.settings.onDislike(self.pane);
						}
						self.next();
					});
				}
			} else {
				this.lastPosX = 0;
				this.lastPosY = 0;
				this.pane.animate({"transform": "translate(0px,0px) rotate(0deg)"}, this.settings.animationRevertSpeed);
				this.pane.find(this.settings.likeSelector).animate({"opacity": 0}, this.settings.animationRevertSpeed);
				this.pane.find(this.settings.dislikeSelector).animate({"opacity": 0}, this.settings.animationRevertSpeed);
			}
		}
	};

	$.fn[ pluginName ] = function (options) {
		this.each(function () {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName, new Plugin(this, options));
			}
			else if ($.isFunction(Plugin.prototype[options])) {
				$.data(this, 'plugin_' + pluginName)[options]();
		    }
		});

		return this;
	};

})(jQuery, window, document);

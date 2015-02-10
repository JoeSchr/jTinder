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

	var xStart = 0;
	var yStart = 0;
	var touchStart = false;
	var posX = 0, posY = 0, lastPosX = 0, lastPosY = 0;

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

			$(element).bind('touchstart mousedown', $.proxy(this.handler, this));
			$(element).bind('touchmove mousemove', $.proxy(this.handler, this));
			$(element).bind('touchend mouseup', $.proxy(this.touchEndHandler, this));
		},

		next: function () {
			this.pane.animate({"opacity": "0"});
			this.pane.animate({"transform": "none"});
			this.pane.animate({"opacity": "1"});
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

		handler: function (ev) {
			switch (ev.type) {
				case 'touchstart':
					if(touchStart === false) {
						touchStart = true;
						xStart = ev.originalEvent.touches[0].pageX;
						yStart = ev.originalEvent.touches[0].pageY;
					}
				case 'mousedown':
					if(touchStart === false) {
						ev.preventDefault();
						touchStart = true;
						xStart = ev.pageX;
						yStart = ev.pageY;
					}
				case 'mousemove':
				case 'touchmove':
					if(touchStart === true) {
						if(ev.type == 'mousemove')
							ev.preventDefault();
						var pageX = typeof ev.pageX == 'undefined' ? ev.originalEvent.touches[0].pageX : ev.pageX;
						var pageY = typeof ev.pageY == 'undefined' ? ev.originalEvent.touches[0].pageY : ev.pageY;
						var deltaX = parseInt(pageX) - parseInt(xStart);
						var deltaY = parseInt(pageY) - parseInt(yStart);
						var percent = deltaX * 100 / this.pane_width;
						posX = deltaX + lastPosX;
						posY = deltaY + lastPosY;

						this.pane.css("transform", "translate(" + posX + "px," + posY + "px) rotate(" + (percent / 2) + "deg)");

						var opa = (Math.abs(deltaX) / this.settings.threshold) / 100;
						if(opa > 1.0) {
							opa = 1.0;
						}
						if (posX >= 0) {
							this.pane.find(this.settings.likeSelector).css('opacity', opa);
							this.pane.find(this.settings.dislikeSelector).css('opacity', 0);
						} else if (posX < 0) {

							this.pane.find(this.settings.dislikeSelector).css('opacity', opa);
							this.pane.find(this.settings.likeSelector).css('opacity', 0);
						}
						if (Math.abs(deltaY) >= 25 && opa < 1.0)
							this.touchEndHandler(ev);
					}
					break;
			}
		},

		touchEndHandler: function (ev) {
			if(ev.type == 'mouseup')
				ev.preventDefault();

			touchStart = false;
			var pageX = (typeof ev.pageX == 'undefined') ? ev.originalEvent.changedTouches[0].pageX : ev.pageX;
			var pageY = (typeof ev.pageY == 'undefined') ? ev.originalEvent.changedTouches[0].pageY : ev.pageY;
			var deltaX = parseInt(pageX) - parseInt(xStart);
			var deltaY = parseInt(pageY) - parseInt(yStart);

			posX = deltaX + lastPosX;
			posY = deltaY + lastPosY;
			var opa = Math.abs((Math.abs(deltaX) / this.settings.threshold) / 100);

			var self = this;
			if (opa >= 1) {
				if (posX > 0) {
					this.pane.animate({"transform": "translate(" + (this.pane_width) + "px," + (posY + this.pane_width) + "px) rotate(60deg)"}, this.settings.animationSpeed, function () {
						if(self.settings.onLike) {
							self.settings.onLike(self.pane);
						}
						self.next();
					});
				} else {
					this.pane.animate({"transform": "translate(-" + (this.pane_width) + "px," + (posY + this.pane_width) + "px) rotate(-60deg)"}, this.settings.animationSpeed, function () {
						if(self.settings.onDislike) {
							self.settings.onDislike(self.pane);
						}
						self.next();
					});
				}
			} else {
				lastPosX = 0;
				lastPosY = 0;
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

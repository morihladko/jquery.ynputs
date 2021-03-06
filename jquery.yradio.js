(function($) {
	var radio_boxes = {};

	function add_box_to_list(yradio) {
		var list = radio_boxes[yradio.form_id] || {};

		if (list[yradio.name]) {
			list[yradio.name] = list[yradio.name].add(yradio.$el);
		} else {
			list[yradio.name] = yradio.$el;
		}

		radio_boxes[yradio.form_id] = list;
	}

	function Yradio($radio_btn) {

		var self = this;

		this.$original = $radio_btn;

		this.form_id = $radio_btn.closest('form').attr('id');

		this.name = $radio_btn.attr('name');

		$radio_btn.hide();

		if (!$radio_btn.prop('tabindex')) {
			$radio_btn.prop('tabindex',  0);
		}

		this.$el = $("<span class='yradio' />")
			.prop('tabindex', $radio_btn.prop('tabindex'))
			.data('yradio', this);

		if( $radio_btn.is(':checked') ) {
			this.$el.addClass('checked');
		} else {
			this.$el.addClass('unchecked');
		}

		$radio_btn.after(this.$el);

		this.$el.click(function(ev) {
			self.change();

			ev.preventDefault();
		})
		.keydown(function(ev) {
			// spacebar
			if (ev.keyCode == 32) {
				self.change();

				ev.preventDefault();
			}
		})

		$radio_btn.change(function() {
			if($radio_btn.is(':checked') && self.$el.is(':not(.checked)') ) {
				self.check();
			}
		});

		this.change = function() {
			if (!this.$original.is(':checked')) {
				this.check();
			}
		}

		this.check = function() {
			radio_boxes[this.form_id][this.name].filter('.checked')
				.addClass('unchecked').removeClass('checked');

			this.$el.addClass('checked').removeClass('unchecked')
			this.$original.prop('checked', true);
			this.$original.change();
		}

		add_box_to_list(this);
	}

	$.fn.yradio = function() {
		return $(this).each(function() {
			var $checkbox = $(this);

			if( ! $checkbox.is('input[type="radio"]') ) {
				return;
			}

			new Yradio($checkbox);
		});
	}

}(jQuery));

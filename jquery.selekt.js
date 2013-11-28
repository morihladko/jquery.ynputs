(function( $ ) {
	$.selekt = { 
		count: 0, 
	};

	/**
	 * Create the html for the selekt and attach it to the DOM
	 *
	 * @param selekt selekt object
	 * @return selekt and selektRoullout jQuery objects
	 */
	function createSelektHTML( selekt ) {
		var selectId = selekt.$sourceSelect.attr('id');
		var value = $( "option:selected", selekt.$sourceSelect ).val();

		// create the selekt 
		var $selekt = $("<div class='selekt selekt-el' id='" + selectId + "-selekt' data-value='" + value + "'/>");
		$selekt
			.css( 'z-index', 99 )
			.append( $( 'option:selected', selekt.$sourceSelect ).text() )
			.prop( 'tabindex', selekt.$sourceSelect.prop('tabindex') )
			.data( 'selekt', selekt );

		// create the rollout
		var $selektRollout = $("<div class='selekt-rollout selekt-el' style='display: none;overflow: auto;' id='" + selectId + "-selekt-rollout'>");
		$selektRollout.append("<ul></ul>");

		// copy the options as list
		$( "option", selekt.$sourceSelect ).each( function(index) { 
			var $el = $(this);
			var selected =	$el.is(':selected') ? 'hover selected ' : '';
			value = $el.val() != '' ? $el.val() : $el.text();
		
			$li = $( "<li class='" + selected +"selekt-option selekt-el' id='"+ selectId +"-selekt-option-" + index + "' data-value='" + value + "'>" + $el.text() + "</li>" );
			$( "ul", $selektRollout ).append( $li );
			$li.data( 'index', index )
			
		} )

		$selektWrap = $("<div class='selekt-el selekt-wrap' style='position: relative; overflow: visible; display: inline-block' id='" + selectId + "-selekt-wrap'/>")
			.append( $selekt )
			.append( $selektRollout );

		// attach to DOM, after the original selectbox
		selekt.$sourceSelect.before( $selektWrap ).hide();

		$selektRollout.css( {
			position: 'absolute', 
			left: '0px',
			top: $selekt.outerHeight() + 'px',
			zIndex: 100
		} );

		// we need the relative position of li elements
		$selektRollout.children('ul').css( 'position', 'relative' );

		return { $selekt: $selekt, $rollout: $selektRollout };
	}

	/**
	 * Create and attach events for user interaction 
	 *
	 * @param selekt the selekt object
	 */
	function attachEventsToSelekt( selekt ) {

		selekt.shouldBlur = false;
		selekt.$self
			// selekt on click
			.click( function() {
				if( selekt.$rollout.is( ":hidden" ) ) {
					selekt.rollDown();
				} else {
					selekt.rollUp();
				}
			} )
			// quick jump by first letter, if keyCode is defined
			.keypress( function( ev ) {
				var charCode = ev.charCode === undefined ? ev.keyCode : ev.charCode;
				if( charCode && (  ev.keyCode == 0 
					|| (ev.keyCode >= 48 && ev.keyCode <= 90) 
					|| (ev.keyCode >= 97 && ev.keyCode <= 172) )
				) {
					selekt.jumpByLetter( String.fromCharCode( charCode ) );
					ev.preventDefault();
				}
			} )
			.keydown( function( ev ) {
				switch( ev.keyCode ) {
					case 13: // enter
						if( selekt.$self.is('.rollout') ) {
							selekt.rollUp();
						}
						selekt.pushChangeIfDifferent();
						ev.preventDefault();
						break;

					case 38: // up arrow
						selekt.keyArrowUp();
						ev.preventDefault();
						break;

					case 40: // down arrow
						selekt.keyArrowDown();
						ev.preventDefault();
						break;
				}

			} )
			.blur(function() {
				var scrollTop = selekt.$rollout.scrollTop() + selekt.$rollout_ul.scrollTop();

				if( scrollTop == selekt.$rollout.scrollTop() + selekt.$rollout_ul.scrollTop() ) {
					if( selekt.$rollout.is(':hidden') ) {
						selekt.pushChangeIfDifferent();
					} else {
						selekt.rollUpTimeout = setTimeout( function(sel) { sel.rollUpAndFocus() }, 250, selekt );
					}

					selekt.shouldBlur = true;
				} else {
					selekt.$self.focus();
				}

			});

		// selekt option on click 
		$( 'ul li', selekt.$rollout ).click( function( ev ) {
			var selekt = $(this).parent().parent().prev().data('selekt');

			if( selekt.rollUpTimeout ) {
				clearTimeout( selekt.rollUpTimeout );
				selekt.rollUpTimeout = null;
			}

			$this = $(this);
			$this.addClass("selected").siblings(".selected").removeClass('selected')

			selekt.change( $this.data('index') );
			selekt.pushChangeIfDifferent();
			selekt.rollUpAndFocus();
		} ).mouseover( function() {
			$( 'li.hover', selekt.$rollout ).removeClass('hover');
			$(this).addClass('hover');
		} );
	}
	
	/**
	 * Create the selekt
	 *
	 * @param $selekt jQuery object of a select element
	 */
	function Selekt($select) {
		this.$sourceSelect = $select;
		this.selectedIndex = $select.prop('selectedIndex');
		this.maxIndex      = $('option', $select).length - 1;
		this.searchPattern = { prefix: '', timestamp: 0 };
		this.rollUpTimeout = null;

		var result = createSelektHTML(this);

		this.$self         = result.$selekt;
		this.$rollout      = result.$rollout;
		this.$rollout_ul   = result.$rollout.children('ul');
	
		attachEventsToSelekt(this);

		/**
		 * Roll down the list
		 */
		this.rollDown = function() {
			var 
				height = this.$rollout.height(),
				offset = this.$self.offset().top + this.$self.outerHeight();

			if (height + offset < $(window).height()) {
				this.$rollout.slideDown("fast");

			} else {
				this.$rollout.addClass('selekt-rollout-up');
				this.$rollout.css('top', -height + 'px')
				this.$rollout.show();
			}

			offset = this.$rollout.offset(); // je to az za slideDown, el musi byt visible

			
			this.$self.addClass('rollout');

			this.$rollout.scrollTop(
				$('li.selected', this.$rollout).position().top
			);
		}
	
		/**
		 * Roll up and hide the options.
		 */
		this.rollUp = function() {
			$("li.hover",this.$rollout).removeClass("hover");
			$("li.selected",this.$rollout).addClass("hover");

			if (this.$rollout.is('.selekt-rollout-up')) {
				this.$rollout.hide();
				this.$rollout.removeClass('selekt-rollout-up');
			} else {
				this.$rollout.slideUp('fast');
			}
			this.$self.removeClass('rollout');

			$.selekt.last = null;
		};
		
		/**
		 * Roll up and focus.
		 */
		this.rollUpAndFocus = function() {
			this.rollUp();
			this.$self.focus();
		}

		/**
		 * Handle the up arrow key Select previous item.
		 */
		this.keyArrowUp = function() {
			if( this.$rollout.is(':not(:hidden)') && $('li.hover:not(.selected)', this.$rollout).length ) {
				this.selectedIndex = $('li.hover:not(.selected)', this.$rollout).data('index');
			}

			this.change( this.selectedIndex - 1 );
			this.showSelectedUp();
		};

		/**
		 * Handle down arrow key. Select the next item.
		 */
		this.keyArrowDown = function() {
			if( this.$rollout.is(':not(:hidden)') && $('li.hover:not(.selected)', this.$rollout).length ) {
				this.selectedIndex = $('li.hover:not(.selected)', this.$rollout).data('index');
			}

			this.change( this.selectedIndex + 1 );
			this.showSelectedDown();
		};

		/**
		 * Change the selected item.
		 *
		 * @param index new selected index
		 */
		this.change = function( index ) {
			if( index < 0 || index > this.maxIndex ) {
				return;
			}

			this.selectedIndex = index;

			$li = this.$rollout.children().children().eq(index);
			$li.addClass('hover').siblings('.hover').removeClass('hover');
			$li.addClass("selected").siblings(".selected").removeClass('selected');

			this.$self.html( $li.html() ).data('value', $li.data('value') );
		};

		/**
		 * Change the selected value in the oroginal select box. Also Call its 
		 * change handler.
		 */
		this.pushChange = function() {
			this.$sourceSelect
				.prop( 'selectedIndex', this.selectedIndex )
				.change();
		};

		/**
		 * Change the original selected value, if user has selected a new one.
		 */
		this.pushChangeIfDifferent = function() {
			if( this.$sourceSelect.prop('selectedIndex') != this.selectedIndex ) {
				this.$sourceSelect
					.prop( 'selectedIndex', this.selectedIndex )
					.change();
			}
		};

		/**
		 * Jump to item by a prefix captured from user input.
		 */
		this.jumpByLetter = function( letter ) {
			var prefix = this.searchPattern.prefix;
			var currentTime = (new Date).getTime();

			if( currentTime - this.searchPattern.timestamp < 250 ) {
				prefix = prefix + letter;
			} else {
				prefix = letter;
			}
			this.searchPattern.timestamp = currentTime;
			this.searchPattern.prefix = prefix;

			var options = this.$sourceSelect.get(0).options;
			var patt = new RegExp( '^' + prefix, 'i' );

			for( var i = this.selectedIndex + 1; i < options.length; ++i ) {
				if( patt.test( options[i].text ) ) {
					this.change( i );
					this.showSelectedDown();
					return;
				}
			}

			for( var i = 0; i < this.selectedIndex; ++i ) {
				if( patt.test( options[i].text ) ) {
					this.change( i );
					this.showSelectedUp();
					return;
				}
			}
		}

		/**
		 * Ensure that selected item is still visible on top.
		 */
		this.showSelectedUp = function() {
			if( this.$rollout.is(':not(:hidden)') ) {
				var liTop = $('li.selected', this.$rollout).position().top;

				if( liTop < this.$rollout.scrollTop() ) {
					this.$rollout.scrollTop( liTop );
				}
			}
		}

		/**
		 * Ensure that selected item is still visible on bottom.
		 */
		this.showSelectedDown = function() {
			if( this.$rollout.is(':not(:hidden)') ) {
				var $li = $('li.selected', this.$rollout);
				var liTop = $li.position().top + $li.outerHeight();

				if( liTop > this.$rollout.scrollTop() + this.$rollout.height() ) {
					this.$rollout.scrollTop( liTop - this.$rollout.height() );
				}
			}
		}
	}

	$.fn.selekt = function() {

		return $(this).each( function() {
			var $el = $(this);

			// check for id, if not present make one
			if( this.id == '' ) {
				this.id = 'selekt-select-' + $.selekt.count++;
			}
			var elId = this.id;

			if( $el.is("select") ) {
				// make the tabindex
				if( ! $el.prop('tabindex') ) {
					$el.prop('tabindex',  0);
				}

				new Selekt( $el );
			}
		});
	} ;

})( jQuery );

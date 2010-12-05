(function( $ ) {
	$.selekt = { count: 0, last: null };

	/**
	 * Event callback for clicking outside the select box to roll in the options.
	 *
	 * @param ev event object
	 */
	function bodyClick( ev ) {
		if( ! $(ev.target).hasClass( "selekt-el" ) && ev.data.rollout ) {
			rollUp( $(ev.data.rollout) );
		}
	}

	/**
	 * Roll up and hide the options.
	 *
	 * @param $selekt selekt jquery object
	 */
	function rollUp( $selektRollout ) {
		$( "li.hover", $selektRollout ).removeClass( "hover" );
		$( "li.selected", $selektRollout ).addClass( "hover" );

		$( "body" ).unbind( 'click.selekt', bodyClick );

		$selektRollout.slideUp( 'fast' );
		$( '#' + $selektRollout.attr('id').replace( /-rollout$/,'')  ).removeClass( 'rollout' );

		$.selekt.last = null;
	}


	/**
	 * Resize the select rollout
	 */
	function selektReposition( $selekt ) {
		var offset = $selekt.offset();

		$("#" + $selekt.attr('id') + "-rollout" ).css( { 
			position: 'absolute', 
			top: offset.top + $selekt.outerHeight(), 
			left: offset.left 
		} );
	}

	$.fn.selekt = function() {

		return $(this).each( function () {
			var $select = $(this);

			// check for id, if not present make one
			if( this.id == '' ) {
				this.id = 'selekt-select-' + $.selekt.count++;
			}
			var selectId = this.id;

			if( $select.is("select") ) {
				// create the selekt 
				var $selekt = $("<div class='selekt selekt-el' id='" + this.id + "-selekt'>");
				$selekt.css( 'z-index', 123546 );
				$selekt.append( "<span style='display:none' class='selekt-val'>" + $( "option:selected", $select ).val() + "</span>" + $( 'option:selected', $select ).text() );

				var $selektRollout = $("<div class='selekt-rollout selekt-el' style='display: none' id='" + this.id + "-selekt-rollout'>");
				$selektRollout.append("<ul></ul>");

				// copy the options as list
				$( "option", $select ).each( function(index) { 
					var selected = "";
					var $select = $(this);
					if( $select.is(':selected') ) {
						selected = 'hover selected ';
					}

					$( "ul", $selektRollout ).append( "<li class='" + selected +"selekt-option selekt-el' id='"+ selectId +"-selekt-option-" + index + "'><span style='display: none' class='selekt-val'>" + ( $select.val() != '' ? $select.val() : $select.text() ) + "</span>" + $select.text() + "</li>" );
				} );

				$select.before( $selekt ).hide();
				$('body').append( $selektRollout );

				selektReposition( $selekt );	

				// selekt on click
				$selekt.click( function() {
					if( $selektRollout.is( ":hidden" ) ) {
						// check for other opened selectboxes
						if( $.selekt.last ) {
							rollUp( $.selekt.last );
						}

						$(document.body).bind( 'click.selekt', { rollout: $selektRollout }, bodyClick );
						$selektRollout.slideDown( "fast" );
						$selekt.addClass( 'rollout' );

						$.selekt.last = $selektRollout;
					} else {
						rollUp( $selektRollout );
					}
				} );

				// selekt option on click 
				$( 'ul li', $selektRollout ).click( function( ev ) {
					$(this).siblings(".selected").removeClass('selected');
					$(this).addClass("selected");
					
					// $select is the original select as jquery object
					$select.val( $('span.selekt-val',this).text() )
						.trigger('change'); 
					
					$selekt.html( $(this).html() );

					rollUp( $selektRollout );

				} ).mouseover( function() {
					$( 'li.hover', $selektRollout ).removeClass('hover');
					$(this).addClass('hover');
				} );

			}
		
		});
	};

})( jQuery );

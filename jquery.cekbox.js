(function( $ ) {

	function change( $cekbox, $checkbox ) {
		if( $checkbox.is(':checked') ) {
			$cekbox.addClass('unchecked').removeClass('checked');
			$checkbox.attr('checked', false); 
		} else {
			$cekbox.addClass('checked').removeClass('unchecked')
			$checkbox.attr('checked', true);
		}
	}

	$.fn.cekbox = function() {
		return $(this).each( function() {
			var $checkbox = $(this);

			if( ! $checkbox.is('input[type="checkbox"]') ) {
				return;
			}

			$checkbox.hide();
			if( ! $checkbox.attr('tabindex') ) {
				$checkbox.attr('tabindex',	0);
			}

			var $cekbox = $("<span class='cekbox' />")
				.attr('tabindex', $checkbox.attr('tabindex'));

			if( $checkbox.is(':checked') ) {
				$cekbox.addClass('checked');
			} else {
				$cekbox.addClass('unchecked');
			}

			$checkbox.after( $cekbox );

			$cekbox.click( function(ev) {
				change($cekbox, $checkbox);
				ev.preventDefault();
			} )
			.keydown( function(ev) {
				// spacebar
				if( ev.keyCode == 32 ) { 
					change($cekbox, $checkbox);
					ev.preventDefault();
				}
			} );

			$checkbox.change( function() {
				if( $checkbox.is(':checked') && $cekbox.is(':not(.checked)') ) {
					$cekbox.addClass( 'checked' ).removeClass('unchecked');

				} else if( $checkbox.is(':not(:checked)') && $cekbox.is(':not(.unchecked)') ) {
					$cekbox.addClass('unchecked').removeClass('checked');
				}
			} ); 
		} );
	}

})( jQuery );

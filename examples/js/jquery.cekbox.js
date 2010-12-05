(function( $ ) {

	$.fn.cekbox = function() {

		return $(this).each( function() {
			var $checkbox = $(this);

			if( ! $checkbox.is('input[type="checkbox"]') ) {
				return;
			}

			$checkbox.hide();

			var $cekbox = $("<span class='cekbox' />");

			if( $checkbox.is(':checked') ) {
				$cekbox.addClass( 'checked' );
			} else {
				$cekbox.addClass( 'unchecked' );
			}

			$checkbox.after( $cekbox );

			$cekbox.click( function() {
				if( $checkbox.is(':checked') ) {
					$cekbox.addClass( 'unchecked' ).removeClass('checked');
					$checkbox.attr( 'checked', false ); 
				} else {
					$cekbox.addClass( 'checked' ).removeClass('unchecked')
					$checkbox.attr( 'checked', true );
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

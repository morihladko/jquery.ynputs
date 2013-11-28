all: minimize

combine: jquery.ynputs.js
	cat jquery.selekt.js jquery.cekbox.js jquery.yradio.js > jquery.ynputs.js

minimize: combine
	uglifyjs jquery.ynputs.js > jquery.ynputs.min.js
	uglifyjs jquery.selekt.js > jquery.selekt.min.js
	uglifyjs jquery.yradio.js > jquery.yradio.min.js
	uglifyjs jquery.cekbox.js > jquery.cekbox.min.js


//form8
$('.form8__btncircle').click(function () {
	$(this).toggleClass('active');
	$('.form8').toggleClass('register__bg');
	$('.form8__log, .form8__reg').toggleClass('slided');
	if ($('.form8__reg').hasClass("slided")) {
		$('.form8').animate({
				'height': $('.form8__reg').height()
			}, 10);
	} else if (!$('.form8__reg').hasClass("slided")) {
		$('.form8').animate({
				'height': $('.form8__log').height()
			}, 10);
	}
});
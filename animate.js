function animate(timePerFrame, xfromt, duration, xToMovement, cleanup) {
	var t0 = new Date;

	var _animate = setInterval(function () {
		var t = (new Date - t0)/duration;				
		if (t>1)
			t=1;

		var x = xfromt(t);

		xToMovement(x);
		
		if (t==1) {
			clearInterval(_animate);
			cleanup()
		}
	}, timePerFrame);
	return _animate;
}
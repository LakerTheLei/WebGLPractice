function main() {

	var canvas = document.getElementById('example');
	if(!canvas) {
		console.log('Failed to retrieve the <canvas> element');
		return;
	}
	var ctx = canvas.getContext('2d');
	ctx.fillStyle = 'rgba(0,0,225,1.0)';
	ctx.fillRect(120,10,150,150);
	}
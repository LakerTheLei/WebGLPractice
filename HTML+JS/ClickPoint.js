var VSHADER_SOURCE = 
`attribute vec4 a_Position;
void main() {
    gl_Position = a_Position;
    gl_PointSize = 10.0;
    }`;

var FSHADER_SOURCE = 
`void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;
function main() {
    var canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas);
    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Filed to initialize shaders.');
        return;
    }

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position < 0){
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    //使用了匿名函数
    canvas.onmousedown = function(ev) { click(ev,gl,canvas,a_Position);};
    gl.clear(gl.COLOR_BUFFER_BIT);
    }
    //鼠标点击坐标的数组
    var g_points = [];
    //点击函数,动态创建
    function click(ev,gl,canvas,a_Position){
        var x = ev.clientX;
        var y = ev.clientY;
        var rect = ev.target.getBoundingClientRect();
        x = ((x - rect.left) - canvas.width / 2)/(canvas.height/2);
        y = (canvas.width/2 - (y - rect.top))/(canvas.height/2);
        g_points.push(x);
        g_points.push(y);

        gl.clear(gl.COLOR_BUFFER_BIT);
        var len = g_points.length;
        for(var i=0;i<len;i+=2){
            gl.vertexAttrib3f(a_Position,g_points[i],g_points[i+1],0.0);
            gl.drawArrays(gl.POINTS,0,1);
        }
    }
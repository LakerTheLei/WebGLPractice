var VSHADER_SOURCE = 
`void main() {
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
    gl_PointSize = 10.0;
}`;
var FSHADER_SOURCE = 
`precision mediump float;
uniform vec4 u_FragColir;
void main() {
    gl_FragColor = u_FragColir;
}`;

function main(){
    var canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas);
    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
    console.log('Filed to initialize shaders.');
        return;
    }
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position < 0){
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    canvas.onmousedown = function(ev) { click(ev,gl,canvas,a_Position,u_FragColor);};
    gl.clear(gl.COLOR_BUFFER_BIT);
}
var g_points = [];
var g_colors = [];
function click(ev,gl,canvas,a_Position,u_FragColor){
    var x = ev.clientX;
        var y = ev.clientY;
        var rect = ev.target.getBoundingClientRect();
        x = ((x - rect.left) - canvas.width / 2)/(canvas.height/2);
        y = (canvas.width/2 - (y - rect.top))/(canvas.height/2);
        g_points.push(x);
        g_points.push(y);

        if(x >=0.0 && y > 0.0){//第一象限
            g_colors.push(1.0,0.0,0.0,1.0);
        }
        else if( x <0.0 && y < 0.0)//第三象限
            g_colors.push(0.0,1.0,0.0,1.0);
        else{
            g_colors.push(0.0,1.0,1.0,1.0);//白色
        }

        gl.clear(gl.COLOR_BUFFER_BIT);
        var len = g_points.length;
        for(var i=0;i<len;i+=2){
            var xy = g_points[i];
            gl.vertexAttrib3f(a_Position,g_points[i],g_points[i+1],0.0);
            gl.uniform4f(u_FragColor,rgba[0],rgba[1],rgba[2],rgba[3]);
            gl.drawArrays(gl.POINTS,0,1);
        }
}
var VSHADER_SOURCE = 
`attribute vec4 a_Position;
void main() {
    gl_Position = a_Position;
    gl_PointSize = 10.0;
    }`;

var FSHADER_SOURCE = 
`precision mediump float;
uniform vec4 u_FragColor;
void main() {
    gl_FragColor = u_FragColor;
}`;

function main(){
    var canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas);
    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
        console.log('Failed to initialize shaders.');
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

    x = ((x - rect.left) - canvas.width / 2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    g_points.push([x,y]);

    if(x >=0.0 && y > 0.0){//第一象限
        g_colors.push([1.0,0.0,0.0,1.0]);
    }
    else if( x <0.0 && y < 0.0){//第三象限
        g_colors.push([0.0,1.0,0.0,1.0]);
    }
    else{
        g_colors.push([1.0,1.0,1.0,1.0]);//白色
    }

    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_points.length;
    for(var i = 0; i < len; i += 2){
        var xy = g_points[i];
        var rgba = g_colors[i];
        //把点的位置传输到u_Position中
        gl.vertexAttrib3f(a_Position,xy[0],xy[1],0.0);
        //把点的颜色传输到u_FragColor中
        gl.uniform4f(u_FragColor,rgba[0],rgba[1],rgba[2],rgba[3]);
        gl.drawArrays(gl.POINTS,0,1);
    }
}

//知识点.
//1.类似于attribute的变量，uniform变量是全局变量，在着色器中可以访问，可以被修改。
//2.uniform变量的格式是 uniform vect4 u_FragColor;
//3.`precision mediump float;这是精度限定词
//4.使用gl.vertexAttrib3f向向量中写入数据
//5.gl.uniform4f有几个重载函数，分别可传入1,2,3,4个参数
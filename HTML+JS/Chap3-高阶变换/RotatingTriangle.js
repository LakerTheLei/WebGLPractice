var VSHADER_SOURCE = 
`attribute vec4 a_Position;
uniform mat4 u_ModelMatrix;
void main() {
    gl_Position = u_ModelMatrix * a_Position;
}`;
 
var FSHADER_SOURCE = 
`void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;

var ANGLE_STEP = 45.0;
var currentAngle = 0.0;


function main() {
    var canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas);
    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Filed to initialize shaders.');
        return;
    }
    var n = initVertexBuffers(gl);
    if(n < 0)
    {
        console.log('Failed to set the positions of vertices');
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);//设置背景色

    //获取着色器程序中名为u_xformMatrix的uniform变量的位置
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    var modelMatrix = new Matrix4();

    //使用了匿名函数，循环调用tick函数
    var tick = function(){
        currentAngle = animate(currentAngle);//更新旋转角
        draw(gl, n, modelMatrix, u_ModelMatrix);
        requestAnimationFrame(tick); //调用tick
    }
    tick();
}
function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        0.0, 0.3, -0.3, -0.3, 0.3, -0.3
    ]);
    var n = 3;
    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    return n;
}
//绘制图形
function draw(gl, n, modelMatrix, u_ModelMatrix) {
    modelMatrix.setRotate(currentAngle, 0, 0, 1);//设置旋转矩阵
    modelMatrix.translate(0.35, 0.0, 0.0);//设置平移矩阵
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);//将旋转矩阵传给着色器
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

var g_last = Date.now();
function animate(angle) {
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle %= 360;
}
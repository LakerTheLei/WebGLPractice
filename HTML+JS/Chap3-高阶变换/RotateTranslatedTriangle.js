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
    var modelMatrix = new Matrix4();
    //旋转角度
    var ANGLE = 60.0;
    var Tx = 0.5;//平移距离

    //旋转矩阵和平移矩阵
    modelMatrix.setRotate(ANGLE, 0, 0, 1);
    modelMatrix.translate(Tx,0,0);

    //获取着色器程序中名为u_xformMatrix的uniform变量的位置
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    //变换
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
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

//变化矩阵的说明.
//1.var u_xformMatrix = new Float32Array([
//    cosB, -sinB, 0.0, 0.0,
//    sinB, cosB, 0.0, 0.0,
//    0.0, 0.0, 1.0, 0.0,
//    0.0, 0.0, 0.0, 1.0
//]);,表示了
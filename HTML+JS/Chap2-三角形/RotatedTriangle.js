var VSHADER_SOURCE = 
`attribute vec4 a_Position;
uniform float u_CosB,u_SinB;
void main() {
    gl_Position.x = a_Position.x * u_CosB - a_Position.y * u_SinB;
    gl_Position.y = a_Position.x * u_SinB + a_Position.y * u_CosB;
    gl_Position.z = a_Position.z;
    gl_Position.w = 1.0;
}`;
 
var FSHADER_SOURCE = 
`void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;
//旋转角度
var ANGLE = 90.0;
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
    //本旋转文件新增的
    var radian = Math.PI * ANGLE / 180.0;//转换为弧度
    var cosB = Math.cos(radian);
    var sinB = Math.sin(radian);
    
    //通过UniformLocation设置uniform变量
    var u_CosB = gl.getUniformLocation(gl.program, 'u_CosB');
    var u_SinB = gl.getUniformLocation(gl.program, 'u_SinB');

    //通过向顶点着色器传递余弦和正弦值，允许在绘制过程中实现对三角形的旋转.
    gl.uniform1f(u_CosB, cosB);
    gl.uniform1f(u_SinB, sinB);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}
function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        0.0, 0.5, -0.5, -0.5, 0.5, -0.5
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
//说明.
//1.x = rcosα, y = rsinα, x' = rcos(α+β), y' = rsin(α+β) ,x' = r(cosαcosβ−sinαsinβ), y' = r(sinαcosβ+cosαsinβ), 带入消除得到
//x' = xcosβ−ysinβ, y' = xsinβ+ycosβ, z' = z
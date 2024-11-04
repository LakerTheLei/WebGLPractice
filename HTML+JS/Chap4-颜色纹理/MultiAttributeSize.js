var VSHADER_SOURCE = 
`attribute vec4 a_Position;
attribute float a_PointSize;
void main() {
    gl_Position = a_Position;
    gl_PointSize = a_PointSize;
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
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, n);

    }
    //创建顶点缓冲区对象，并将顶点数据写入缓冲区对象,然后缓冲区给顶点着色器
    function initVertexBuffers(gl) {
        //类型化数组，用于存放顶点坐标,和普通数组一样，可以直接使用new Float32Array([...])创建
        var vertices = new Float32Array([
            0.0, 0.5, -0.5, -0.5, 0.5, -0.5
        ]);
        var n = 3;

        var sizes = new Float32Array([
            10.0,20.0,30.0
        ]);
        var vertexBuffer = gl.createBuffer();
        var sizeBuffer = gl.createBuffer();
        if(!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);//第三个参数指定缓冲区数据如何在显存中映射
        var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);//将整个缓冲区对象分配给attribute变量
        gl.enableVertexAttribArray(a_Position);//正式连接了缓冲区对象和attribute变量

        gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
        var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
        gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_PointSize);
        return n;
    }
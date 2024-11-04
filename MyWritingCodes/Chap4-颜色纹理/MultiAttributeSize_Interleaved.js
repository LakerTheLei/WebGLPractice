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
        var verticesSizes = new Float32Array([
            0.0, 0.5, 10.0,
            -0.5, -0.5, 20.0,
            0.5,-0.5,30.0
        ]);
        var n = 3;
        //创建缓冲区对象
        var VertexSizeBuffer = gl.createBuffer();
        //绑定缓冲区对象
        gl.bindBuffer(gl.ARRAY_BUFFER, VertexSizeBuffer);
        //写入缓冲区对象
        gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW);

        //把verticesSize数组中的每个元素大小（字节数）存储起来
        var FSIZE = verticesSizes.BYTES_PER_ELEMENT;
        var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 3, 0);
        gl.enableVertexAttribArray(a_Position);

        var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
        gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 3, FSIZE * 2);
        gl.enableVertexAttribArray(a_PointSize);

        return n;
    }
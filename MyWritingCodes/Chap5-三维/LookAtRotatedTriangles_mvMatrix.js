var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ModelViewMatrix;//视图模型矩阵
    varying vec4 v_Color;
    void main() {
        gl_Position = u_ModelViewMatrix * a_Position;//将顶点坐标变换到视口坐标系
        v_Color = a_Color;
    }
    `;

var FSHADER_SOURCE = `
    precision mediump float;
    varying vec4 v_Color;
    void main() {
        gl_FragColor = v_Color;
    }
    `;

function main() {
    var canvas = document.getElementById('webgl');
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
    var u_ModelViewMatrix = gl.getUniformLocation(gl.program, 'u_ModelViewMatrix');
    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(0.25, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
    var modelMatrix = new Matrix4();
    modelMatrix.setRotate(-10, 0, 1, 0);

    var modelViewMatrix = viewMatrix.multiply(modelMatrix);//两个矩阵相乘
    //设置视点、视线和上方向到着色器中
    gl.uniformMatrix4fv(u_ModelViewMatrix, false, modelViewMatrix.elements);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
    function initVertexBuffers(gl) {
        var verticesColors = new Float32Array([
            //顶点坐标和颜色
            0.0, 0.5, -0.4, 0.4, 1.0, 0.4,
             -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
             0.5,  -0.5, -0.4, 1.0, 0.4, 0.4,

             0.5,0.4,-0.2, 1.0, 0.4, 0.4,
             -0.5,0.4,-0.2, 1.0, 1.0, 0.4,
             0.0,-0.6,-0.2, 1.0, 1.0, 0.4,

             0.0,0.5,0.0,0.4,0.4,1.0,
             -0.5,-0.5,0.0,0.4,0.4,1.0,
             0.5,-0.5,0.0,1.0,0.4,0.4,
        ]);
        var n = 9; //顶点数量
        //创建缓冲区对象
        var vertexColorBuffer = gl.createBuffer();
        if(!vertexColorBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }    
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

        var FSIZE = verticesColors.BYTES_PER_ELEMENT;

        var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        //顶点位置
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
        gl.enableVertexAttribArray(a_Position);

        var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
        //顶点颜色
        gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
        gl.enableVertexAttribArray(a_Color);
        return n;
    }
}
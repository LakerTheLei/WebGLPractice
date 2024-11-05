//本例用于验证近裁剪面的宽高比与<canvas>不一致，物体变形，所以更改projMatrix.setOrthi()的参数,本例改变了宽度比而导致拉伸变形
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ViewMatrix;//视图矩阵
    uniform mat4 u_ProjMatrix;//投影矩阵
    varying vec4 v_Color;
    void main() {
        gl_Position =  u_ProjMatrix *u_ViewMatrix * a_Position;//将顶点坐标变换到视口坐标系
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
    gl.clearColor(0, 0, 0, 1);
    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');

    if(!u_ViewMatrix) { 
        console.log('Failed to get the storage locations of u_ViewMatrix');
        return;
      }
    //设置视点、视线和上方向
    var viewMatrix = new Matrix4();
    document.onkeydown = function(ev) { keydown(ev, gl,n, u_ViewMatrix, viewMatrix); };

    var projMatrix = new Matrix4();
    projMatrix.setOrtho(-0.3, 0.3, -1, 1., 0, 0.5);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
    
    draw(gl, n, u_ViewMatrix, viewMatrix);

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
    if(a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
        }
    //顶点位置
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if(a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
        }
    //顶点颜色
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);
    return n;
}

var g_eyeX = 0.20, g_eyeY = 0.25, g_eyeZ = 0.25;
function keydown(ev, gl,n, u_ViewMatrix,viewMatrix) {
    if(ev.keyCode == 39) { // right
        g_eyeX += 0.01;
    }else if(ev.keyCode == 37) { // left
        g_eyeX -= 0.01;
    }
    else{return;}
    draw(gl, n, u_ViewMatrix, viewMatrix);//绘制
}
function draw(gl, n, u_ViewMatrix, viewMatrix) {
    //设置视点、视线和上方向
    viewMatrix.setLookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0);
    //设置视点、视线和上方向到着色器中
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}
}
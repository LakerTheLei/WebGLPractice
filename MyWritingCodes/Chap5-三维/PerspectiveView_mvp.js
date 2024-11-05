//这里只定义了三个三角形，中心都在Z轴，出来6个是平移的结果
//只使用了一套数据就画出了两套图形，这样较少了顶点的个数，但是增加了调用gl.drawArrays的次数，哪种效率更高，也根据实际情况去选择
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    //MVP矩阵
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_ViewMatrix;//视图矩阵
    uniform mat4 u_ProjMatrix;//投影矩阵
    varying vec4 v_Color;
    void main() {
        gl_Position =  u_ProjMatrix *u_ViewMatrix * u_ModelMatrix * a_Position;//将顶点坐标变换到视口坐标系
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
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');

    //设置视点、视线和上方向
    var modelMatrix = new Matrix4();
    var viewMatrix = new Matrix4();
    var projMatrix = new Matrix4();

    modelMatrix.setTranslate(0.75, 0, 0);
    viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
    projMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);

    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);//绘制一侧的三角形

    modelMatrix.setTranslate(-0.75, 0, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, n);//绘制另一侧的三角形

function initVertexBuffers(gl) {
    var verticesColors = new Float32Array([
        // Vertex coordinates and color
         0.0,  1.0,  -4.0,  0.4,  1.0,  0.4, // The back green one
        -0.5, -1.0,  -4.0,  0.4,  1.0,  0.4,
         0.5, -1.0,  -4.0,  1.0,  0.4,  0.4, 
    
         0.0,  1.0,  -2.0,  1.0,  1.0,  0.4, // The middle yellow one
        -0.5, -1.0,  -2.0,  1.0,  1.0,  0.4,
         0.5, -1.0,  -2.0,  1.0,  0.4,  0.4, 
    
         0.0,  1.0,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
        -0.5, -1.0,   0.0,  0.4,  0.4,  1.0,
         0.5, -1.0,   0.0,  1.0,  0.4,  0.4, 
      ]);
    var n = 18; //顶点数量
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
}
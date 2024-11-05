//视点(ViewPoint)：视点就是观察者的位置，它决定了观察者看到的世界的样子。(eyeX, eyeY, eyeZ)
//观察目标点：被观察目标所在的点，只有同时知道观察目标点和视点算出视线方向。(AtX, AtY, AtZ)
//上方向：最终绘制在屏幕上的影像中的向上方向（以防止观察者旋转）。(upX, upY, upZ)，比如上方向是Y正方向，就是（0, 1, 0）
//我们可以用如上三个矢量创建一个视图矩阵（View matrix)。然后把矩阵传给顶点着色器
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ViewMatrix;//视图矩阵
    varying vec4 v_Color;
    void main() {
        gl_Position = u_ViewMatrix * a_Position;//将顶点坐标变换到视口坐标系
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
    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if(!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }
    //设置视点、视线和上方向
    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(0.25, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
    //设置视点、视线和上方向到着色器中
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
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
//2.四棱锥投影，也称金字塔可视空间，由透视投影产生（Perspective Projection），我们平时观察真实世界用的就是透视投影，会近大远小
//透视投影可视空间有视点、视线、近裁剪面和远裁剪面
//Matrix4.setPerspective(fov, aspect, near, far)
//fov：视角，单位为弧度，一般取值在0.1到179.9之间，越小越近，越大越远
//aspect：近裁剪面的宽高比
//near：近裁剪面距离，即摄像机到近裁剪面的距离，小于此距离的物体不会被渲染
//far：远裁剪面距离，即摄像机到远裁剪面的距离，大于此距离的物体不会被渲染

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
    var projMatrix = new Matrix4();

    viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
    projMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);

function initVertexBuffers(gl) {
    var verticesColors = new Float32Array([
        // Three triangles on the right side
        //x/yz   r/g/b
        0.75,  1.0,  -4.0,  0.4,  1.0,  0.4, // The back green one
        0.25, -1.0,  -4.0,  0.4,  1.0,  0.4,
        1.25, -1.0,  -4.0,  1.0,  0.4,  0.4, 
    
        0.75,  1.0,  -2.0,  1.0,  1.0,  0.4, // The middle yellow one
        0.25, -1.0,  -2.0,  1.0,  1.0,  0.4,
        1.25, -1.0,  -2.0,  1.0,  0.4,  0.4, 
    
        0.75,  1.0,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
        0.25, -1.0,   0.0,  0.4,  0.4,  1.0,
        1.25, -1.0,   0.0,  1.0,  0.4,  0.4, 
    
        // Three triangles on the left side
       -0.75,  1.0,  -4.0,  0.4,  1.0,  0.4, // The back green one
       -1.25, -1.0,  -4.0,  0.4,  1.0,  0.4,
       -0.25, -1.0,  -4.0,  1.0,  0.4,  0.4, 
    
       -0.75,  1.0,  -2.0,  1.0,  1.0,  0.4, // The middle yellow one
       -1.25, -1.0,  -2.0,  1.0,  1.0,  0.4,
       -0.25, -1.0,  -2.0,  1.0,  0.4,  0.4, 
    
       -0.75,  1.0,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
       -1.25, -1.0,   0.0,  0.4,  0.4,  1.0,
       -0.25, -1.0,   0.0,  1.0,  0.4,  0.4, 
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
//在透视投影下，距离较远的三角形看上去变小了，其实这些三角形的大小是完全相同的，透视投影矩阵对三角形进行了两次变换
//变换1.根据三角形与视点的距离，按比例对三角形进行缩小变换
//变换2.对三角形进行平移变换，使其贴近视线
//可视空间有两种,一种是盒装空间，一种是四棱锥空间,也称为正射投影和透视投影
//1.一种是长方体的可视空间，也称盒装空间，由正射投影产生（Orthographic Projection），该投影模式下，用户可以方便比较场景中大小，比如两个模型大小，不会产生近大远小
///////盒装可视空间又前后两个矩形表面确定，分别称为近裁剪面(near clipping plane)和远裁剪面(far clipping plane),即深度，宽度，高度
//////前者的四个顶点为(right,top,-near),(-left,-bottom,-near),(-left,-bottom,-near),(right,-bottom,-near)
//////后者的四个顶点为(right,top,far),(-left,top,far),(-left,-bottom,far),(right,-bottom,far)、

var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ProjMatrix;//视图矩阵
    varying vec4 v_Color;
    void main() {
        gl_Position = u_ProjMatrix * a_Position;//将顶点坐标变换到视口坐标系
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
    var nf = document.getElementById('nearFar');
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
    var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    //设置视点、视线和上方向
    var projMatrix = new Matrix4();
    document.onkeydown = function(ev){keydown(ev,gl,n,u_ProjMatrix,projMatrix,nf)}
    draw(gl,n,u_ProjMatrix,projMatrix,nf);
    }
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
var g_near = 0.0,g_far = 0.5;//默认近裁剪面和远裁剪面

function keydown(ev,gl,n,u_ProjMatrix,projMatrix,nf) {
    switch(ev.keyCode){
        case 39: g_near += 0.1; break; //右
        case 37: g_near -= 0.1; break; //左
        case 38: g_far += 0.1; break; //上
        case 40: g_far -= 0.1; break; //下
    }
    draw(gl,n,u_ProjMatrix,projMatrix,nf);
}

function draw(gl,n,u_ProjMatrix ,projMatrix,nf) {
    projMatrix.setOrtho(-1, 1, -1, 1, g_near, g_far);//使用矩阵设置可视空间
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT);
    nf.innerHTML = 'near:' + Math.round(g_near * 100)/100 + ', far:' + Math.round(g_far * 100)/100;
    gl.drawArrays(gl.TRIANGLES, 0, n);
}
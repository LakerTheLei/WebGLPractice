var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec2 a_TexCoord;
    varying vec2 v_TexCoord;
    void main() {
        gl_Position = a_Position;
        v_TexCoord = a_TexCoord;
    }
`;

var FSHADER_SOURCE = `
    precision mediump float;
    uniform sampler2D u_Sampler;
    varying vec2 v_TexCoord;
    void main() {
        gl_FragColor = texture2D(u_Sampler, v_TexCoord);
    }
`;

function main(){
    var canvas = document.getElementById("webgl");
    var gl = canvas.getWebGLContext(canvas);
    if (!gl) {
        console.log("Failed to get WebGL context");
        return;
    }
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Failed to initialize shaders.");
        return;
    }
    var n = initVertexBuffers(gl);
    if(n < 0)
    {
        console.log('Failed to set the positions of vertices');
        return;
    }
    if(!initTextures(gl, n))
    {
        console.log('Failed to init textures');
        return;
    }
}
function initVertexBuffers(gl) {
    var verticesTexCoords = new Float32Array([
        // 顶点坐标和纹理坐标
        -0.5, 0.5, 0.0, 1.0,
        -0.5, -0.5, 0.0, 0.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, -0.5, 1.0, 0.0,
    ]);
    var n = 4; // 顶点数量
    var vertexTexCoordsBuffer = gl.createBuffer();
    if (!vertexTexCoordsBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);
    var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');

    if (a_TexCoord < 0) {
        console.log('Failed to get the storage location of a_TexCoord');
        return -1;
    }
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);
    return n;
}

function initTextures(gl, n) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    // 加载图片
    var image = new Image();
    image.onload = function() {
        console.log('Image loaded successfully');
        loadTexture(gl, n, texture, u_Sampler, image)};
    image.src = '../../resources/sky.jpg';
    return true;
}

//配置纹理
function loadTexture(gl, n, texture, u_Sampler, image) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // 纹理坐标翻转
    gl.activeTexture(gl.TEXTURE0);//激活纹理单元0
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler, 0); // 设置纹理单元

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}

//该程序分为五个部分
//1.顶点着色器中接收顶点的纹理坐标，光栅化后传递给片元着色器
//2.片元着色器根据片元的纹理坐标，从纹理图像中抽取纹素颜色，赋给当前片元
//3.设置顶点的纹理坐标
//4.准备待加的纹理图片，让浏览器读取
//5.监听纹理图像的加载事件，一旦完成，就在WebGL中使用(LoadTexture)
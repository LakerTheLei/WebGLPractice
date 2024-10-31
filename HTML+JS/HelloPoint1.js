//顶点着色器程序
var VSHADER_SOURCE = 
`void main() {
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
    gl_PointSize = 10.0;
}`;
//片元着色器程序
var FSHADER_SOURCE = 
`void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;

function main() {
    var canvas = document.getElementById('webgl');
    
    var gl = getWebGLContext(canvas);
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Filed to initialize shaders.');
        return;
    }

    //设置canvas的背景色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, 1);
}

//知识点：
//1.WebGL的坐标系映射到Canvas坐标系，对于WebGL的(x,y,z,w)，对应Canvas上，y轴向上，x轴向右。
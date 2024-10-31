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

function main(){
    var canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas);
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    
    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
        console.log('Filed to initialize shaders.');
        return;
    }
    //gl.getAttribLocation()方法可以获取attribute变量的存储位置
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    if(a_Position < 0){
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    //gl.vertexAttribPointer()方法可以将缓冲区中的数据分配给attribute变量
    gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
    gl.vertexAttrib1f(a_PointSize, 30.0);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, 1);
}

//知识点.
//1.attribute变量被称为存储限定符，格式为attribute 类型 变量名
//attribute变量以a_前缀开始,uniform变量以u_前缀开始
//它的作用是用来从外部向顶点着色器内传输数据，只有顶点着色器可以使用它
//你可以动态的设置a_Position，而不是静态写在顶点着色器中

//2.使用attribute改变点的大小
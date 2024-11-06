//主要的差别在于initVertexBuffer中，把arm1和arm2数据写入了对应的缓冲区
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Normal;
    uniform mat4 u_MvpMatrix;
    uniform mat4 u_NormalMatrix;
    varying vec4 v_Color;
    void main() {
        gl_Position = u_MvpMatrix * a_Position;
        vec3 lightDirection = normalize(vec3(0.0,0.5,0.7));
        vec4 color = vec4(1.0, 0.4, 0.0, 1.0);
        vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);
        float nDotL = max(dot(normal, lightDirection), 0.0);
    v_Color = vec4(color.rgb * nDotL + vec3(0.1), color.a);
    }`;
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec4 v_Color;
    void main() {
        gl_FragColor = v_Color;
    }`;
function main(){
    var canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas);
    if(!gl){
        console.log("Failed to get the rendering context for WebGL");
        return;
    }

    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
        console.log("Failed to initialize shaders.");
        return;
    }

    var n = initVertexBuffers(gl);
    if(n < 0){
        console.log("Failed to set the vertex information.");
        return;
    }

gl.clearColor(0.0, 0.0, 0.0, 1.0);//黑色背景
gl.enable(gl.DEPTH_TEST);//启用深度测试

var u_MvpMatrix = gl.getUniformLocation(gl.program, "u_MvpMatrix");//获取MvpMatrix的存储位置
var u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");//获取NormalMatrix的存储位置
if (!u_MvpMatrix || !u_NormalMatrix) {
    console.log('Failed to get the storage location');
    return;
  }

var viewProjMatrix = new Matrix4();
viewProjMatrix.setPerspective(50.0,canvas.width/canvas.height,1.0,100.0)
viewProjMatrix.lookAt(20.0,10.0,30.0,0.0,0.0,0.0,0.0,1.0,0.0);

document.onkeydown = function(ev){keydown(ev,gl,n,viewProjMatrix,u_MvpMatrix,u_NormalMatrix);};

draw(gl,n,viewProjMatrix,u_MvpMatrix,u_NormalMatrix);
}

var ANGLE_STEP = 3.0;
var g_arm1Angle = -90.0;
var g_joint1Angle = 0.0;

function keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
    switch (ev.keyCode) {
      case 38: // Up arrow key -> the positive rotation of joint1 around the z-axis
        if (g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP;
        break;
      case 40: // Down arrow key -> the negative rotation of joint1 around the z-axis
        if (g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP;
        break;
      case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
        g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360;
        break;
      case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
        g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360;
        break;
      default: return; // Skip drawing at no effective action
    }
    // Draw the robot arm
    draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  }

function initVertexBuffers(gl) {
var vertices = new Float32Array([
    1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5,  0.0, 1.5,  1.5,  0.0, 1.5, // v0-v1-v2-v3 front
    1.5, 10.0, 1.5,  1.5,  0.0, 1.5,  1.5,  0.0,-1.5,  1.5, 10.0,-1.5, // v0-v3-v4-v5 right
    1.5, 10.0, 1.5,  1.5, 10.0,-1.5, -1.5, 10.0,-1.5, -1.5, 10.0, 1.5, // v0-v5-v6-v1 up
    -1.5, 10.0, 1.5, -1.5, 10.0,-1.5, -1.5,  0.0,-1.5, -1.5,  0.0, 1.5, // v1-v6-v7-v2 left
    -1.5,  0.0,-1.5,  1.5,  0.0,-1.5,  1.5,  0.0, 1.5, -1.5,  0.0, 1.5, // v7-v4-v3-v2 down
    1.5,  0.0,-1.5, -1.5,  0.0,-1.5, -1.5, 10.0,-1.5,  1.5, 10.0,-1.5  // v4-v7-v6-v5 back
    ]);

    // Normal
    var normals = new Float32Array([
    0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
    ]);

    // Indices of the vertices
    var indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
    ]);

    if(!initArrayBuffer(gl,'a_Position',vertices,gl.FLOAT,3))return -1;
    if(!initArrayBuffer(gl, 'a_Normal', normals, gl.FLOAT, 3)) return -1;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
      }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, attribute, data, type, num) {
 var buffer = gl.createBuffer();
 if (!buffer) {
   console.log('Failed to create the buffer object');
   return false;
 }
 gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
 gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

 var a_attribute = gl.getAttribLocation(gl.program, attribute);
 if (a_attribute < 0) { // Do not use this attribute
   console.log('Failed to get the storage location of ' + attribute);
   return false;
 }
 gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
 gl.enableVertexAttribArray(a_attribute);

 return true;
}

var g_modelMatrix = new Matrix4(),g_mvpMatrix = new Matrix4();

function draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var arm1Length = 10.0;
    g_modelMatrix.setTranslate(0.0, -12.0, 0.0);
    g_modelMatrix.rotate(g_arm1Angle, 0.0, 1.0, 0.0);
    drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

    g_modelMatrix.translate(0.0, arm1Length, 0.0);
    g_modelMatrix.rotate(g_joint1Angle, 0.0, 0.0, 1.0);
    g_modelMatrix.scale(1.3, 1.0, 1.3);
    drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

var g_normalMatrix = new Matrix4();

function drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);

    g_normalMatrix.setInverseOf(g_modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}
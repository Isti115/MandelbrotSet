"use strict";

window.addEventListener("load", load, false);

var examples = [
  //Always TRUE
  "{A} or not {A}",
  
  //Mixed
  "{this} or {that}",
  
  //Always FALSE
  "{A} and not {A}"
];

var currentExample = -1;

var output;
var drag;

var canvas, context;

var workerCount = 1;
var maxIterations = 30;
var maxLength = 4;
var scale = 2;

var area = {};
area.top = 1.5, area.right = 1.5, area.bottom = -1.5, area.left = -2;
area = {left: -1.5, right: -0.5, top: 1.5, bottom: 0.5};
area = {left: -3, right: 3, top: -3, bottom: 3};

var tempImage = new Image();

function load() {  
  var configDiv = document.getElementById("config");
  
  configDiv.addEventListener("mouseover", function(){
    configDiv.style.transition = "width 0.3s, height 0.7s ease 0.3s";
  }, false);
  
  configDiv.addEventListener("mouseout", function(){
    configDiv.style.transition = "height 0.7s, width 0.3s ease 0.7s";
  }, false);
  
  document.getElementById("processButton").addEventListener("click", process, false);
  document.getElementById("exampleButton").addEventListener("click", example, false);
  
  var configInputs = document.getElementsByClassName("configInput");
  
  for (var i = 0; i < configInputs.length; i++) {
    configInputs[i].addEventListener("change", configUpdate, false);
  }
  
  output = document.getElementById("output");
  output.addEventListener("mousedown", dragStart, false);
  
  canvas = document.getElementById("outputCanvas");
  
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  
  context = canvas.getContext("2d");
}

function configUpdate() {
  workerCount = parseInt(document.getElementById("workerCountInput").value);
  maxIterations = parseInt(document.getElementById("maxIterationsInput").value);
  maxLength = parseInt(document.getElementById("maxLengthInput").value);
  scale = parseInt(document.getElementById("scaleInput").value);
}

function dragStart(e) {
  if (e.button != 0) {
    return;
  }
  
  tempImage.src = canvas.toDataURL();
  
  output.addEventListener("mousemove", dragMove, false);
  output.addEventListener("mouseup", dragEnd, false);
  drag = {left: e.clientX, top: e.clientY};
}

function dragMove(e) {
  drag.right = e.clientX;
  drag.bottom = e.clientY;
  context.drawImage(tempImage, 0, 0, canvas.width, canvas.height);
  context.strokeRect(drag.left, drag.top, drag.right - drag.left, drag.bottom - drag.top);
}

function dragEnd(e) {
  output.removeEventListener("mousemove", dragMove, false);
  output.removeEventListener("mouseup", dragEnd, false);
  
  // console.log(drag);
  
  if (Math.abs(drag.right - drag.left) < 25 || Math.abs(drag.bottom - drag.top) < 25) {
    return;
  }
  
  var dragResults = {};
  dragResults.left = drag.left < drag.right ? drag.left : drag.right;
  dragResults.right = drag.left < drag.right ? drag.right : drag.left;
  dragResults.top = drag.top < drag.bottom ? drag.top : drag.bottom;
  dragResults.bottom = drag.top < drag.bottom ? drag.bottom : drag.top;
  
  // console.log(dragResults);
  
  var newArea = {};
  
  newArea.left = area.left + ((area.right - area.left) * (dragResults.left / canvas.width));
  newArea.right = area.left + ((area.right - area.left) * (dragResults.right / canvas.width));
  newArea.top = area.top + ((area.bottom - area.top) * (dragResults.top / canvas.height));
  newArea.bottom = area.top + ((area.bottom - area.top) * (dragResults.bottom / canvas.height));
  
  area = newArea;
  
  console.log(area);
  process();
}

function example() {
  var input = document.getElementById("inputField");
  
  var random = -1;
  
  do {
    random = Math.floor(Math.random() * examples.length);
  } while (random == currentExample)
  
  currentExample = random;
  input.value = examples[random];
}

function validate() {
  
}

function process() {
  // console.log(workerCount);
  
  console.log(area);
  
  context.font = "15px Consolas";
  // context.fillStyle = "#6ae786";
  // context.fillStyle = "#0000ee";
  context.fillRect(0, 0, canvas.width, canvas.height);
    
  for (var y = 0; y < canvas.height; y += scale) {
    for (var x = 0; x < canvas.width; x += scale) {
      
      var currentPosition = {};
      currentPosition.x = area.left + ((area.right - area.left) * (x / canvas.width));
      currentPosition.y = area.top  + ((area.bottom - area.top) * (y / canvas.height));
      
      // console.log(currentPosition);
      
      var currentValue = getValue(currentPosition.x, currentPosition.y);
      
      // context.fillStyle = "#" + Math.floor((currentValue / maxIterations * 999999));
      // context.fillStyle = "#ee" + Math.floor((currentValue / maxIterations * 99)) + "00";
      
      // context.fillStyle = "hsl(" + 180 + (currentValue / maxIterations) * 180 + ", 50%, 30%)";
      context.fillStyle = "hsl(" + (currentValue / maxIterations) * 360 + ", 75%, 50%)";
      
      // if (context.fillStyle == "#000000") {
      //   console.log(currentValue + "|" + context.fillStyle);
      // }
      
      // if (true || x < 50 && y < 50) {
        // console.log(x + " " + y + " | " + currentValue);
      // }
      // context.fillText(currentValue, x, y);
      
      context.fillRect(x, y, scale, scale);
    }
  }
  
  // context.fillRect(10, 10, 30, 30);
}

function getValue(x, y) {  
  var baseNumber = new Complex(x, y);
  var number = new Complex(x, y);
  
  var iterations = 0;
  
  while (number.length() < maxLength && iterations < maxIterations) {
    // console.log(number.length());
    
    number = number.square().add(baseNumber);
    
    iterations++;
  }
  
  return iterations;
}

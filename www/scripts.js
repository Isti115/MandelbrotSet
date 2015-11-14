"use strict";

window.addEventListener("load", load, false);

var examples = [
  //Always TRUE
  "{A} or not {A}",
  "({A} or {B}) and (not {B}) => {A}",
  "(not ({A} <-> {B})) <-> (({A} or {B}) and not ({A} and {B}))",
  "(({A} <-> {B}) and ({B} <-> {C})) => (    {A} <-> {C})",
  
  //Mixed
  "{this} or {that}",
  
  //Always FALSE
  "{A} and not {A}"
];

var currentExample = -1;

var output;
var drag;

var canvas, context;

var scale = 1;

var area = {};
area.top = 1.5, area.right = 1.5, area.bottom = -1.5, area.left = -2;
area = {left: -1.5, right: -0.5, top: 1.5, bottom: 0.5};
area = {left: -3, right: 3, top: -3, bottom: 3};

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
  
  output = document.getElementById("output");
  output.addEventListener("mousedown", dragStart, false);
  
  canvas = document.getElementById("outputCanvas");
  
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  
  context = canvas.getContext("2d");
}

function dragStart(e) {
  if (e.button != 0) {
    return;
  }
  
  output.addEventListener("mousemove", dragMove, false);
  output.addEventListener("mouseup", dragEnd, false);
  drag = {left: e.clientX, top: e.clientY};
}

function dragMove(e) {
  drag.right = e.clientX;
  drag.bottom = e.clientY;
  context.strokeRect(drag.left, drag.top, drag.right - drag.left, drag.bottom - drag.top);
}

function dragEnd(e) {
  output.removeEventListener("mousemove", dragMove, false);
  output.removeEventListener("mouseup", dragEnd, false);
  
  // console.log(drag);
  
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
  var workerCount = document.getElementById("workerCountInput").value;
  // console.log(workerCount);
  
  console.log(area);
  
  for (var y = 0; y < canvas.height; y += scale) {
    for (var x = 0; x < canvas.width; x += scale) {
      
      var currentPosition = {};
      currentPosition.x = area.left + ((area.right - area.left) * (x / canvas.width));
      currentPosition.y = area.top  + ((area.bottom - area.top) * (y / canvas.height));
      
      // console.log(currentPosition);
      
      var currentValue = getValue(currentPosition.x, currentPosition.y);
      
      context.fillStyle = "#" + Math.floor((currentValue / 30 * 999999));
      
      context.fillRect(x, y, scale, scale);
    }
  }
  
  context.fillRect(10, 10, 30, 30);
}

function getValue(x, y) {
  var maxIterations = 30;
  
  var baseNumber = new Complex(x, y);
  var number = new Complex(x, y);
  
  var iterations = 0;
  
  while (number.real + number.imag < 4 && iterations < maxIterations) {
    number = number.square().add(baseNumber);
    
    iterations++;
  }
  
  return iterations;
}

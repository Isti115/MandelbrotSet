"use strict";

window.addEventListener("load", load, false);

var examples = [
  {
    maxIterations: 100,
    maxLength: 4,
    scale: 1,
    area: {
      "left":-0.4010416,
      "right":0.1276041,
      "top":-1.1306532,
      "bottom":-0.6301507
    }
  },
  {
    maxIterations: 100,
    maxLength: 4,
    scale: 1,
    area: {
      "left":-1.815625,
      "right":-1.709374,
      "top":-0.069164,
      "bottom":0.077809
    }
  }
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
area.top = 1.5; area.right = 1.5; area.bottom = -1.5; area.left = -2;
area = {left: -1.5, right: -0.5, top: 1.5, bottom: 0.5};
area = {left: -3, right: 3, top: -3, bottom: 3};

var tempImage = new Image();

function load() {
  var doProcess = false;
  
  if (location.hash != "") {
    var raw = location.hash.substr(1);
    var splitted = raw.split(';');
    
    maxIterations = parseInt(splitted[0]);
    maxLength = parseInt(splitted[1]);
    scale = parseInt(splitted[2]);
    area = JSON.parse(splitted[3]);
    
    // doProcess = true;
  }
  
  var configDiv = document.getElementById("config");
  
  configDiv.addEventListener("mouseover", function(){
    configDiv.style.transition = "width 0.3s, height 0.7s ease 0.3s";
  }, false);
  
  configDiv.addEventListener("mouseout", function(){
    configDiv.style.transition = "height 0.7s, width 0.3s ease 0.7s";
  }, false);
  
  document.getElementById("processButton").addEventListener("click", process, false);
  document.getElementById("exampleButton").addEventListener("click", example, false);
  document.getElementById("configShare").addEventListener("click", share, false);
  
  output = document.getElementById("output");
  output.addEventListener("mousedown", dragStart, false);
  
  canvas = document.getElementById("outputCanvas");
  
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  
  context = canvas.getContext("2d");
  
  var configInputs = document.getElementsByClassName("configInput");
  
  for (var i = 0; i < configInputs.length; i++) {
    configInputs[i].addEventListener("change", configUpdate, false);
  }
  
  document.getElementById("areaInput").value = JSON.stringify(area);
  
  if (doProcess) {
    process();
  }
}

function share() {
  alert("Feature under development.\nTo share the current view, copy and paste the link from the browser!");
}

function configUpdate() {
  workerCount = parseInt(document.getElementById("workerCountInput").value);
  maxIterations = parseInt(document.getElementById("maxIterationsInput").value);
  maxLength = parseInt(document.getElementById("maxLengthInput").value);
  scale = parseInt(document.getElementById("scaleInput").value);
  area = JSON.parse(document.getElementById("areaInput").value);
  
  document.getElementById("scaleCounter").innerHTML = "Scale (" + scale + "):";
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
  
  if (Math.abs(drag.right - drag.left) < 10 || Math.abs(drag.bottom - drag.top) < 10) {
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
  
  document.getElementById("areaInput").value = JSON.stringify(area);
  
  console.log(area);
  process();
}

function example() {
  // alert("This function is under construction.");
  // return;

  var random = -1;
  
  do {
    random = Math.floor(Math.random() * examples.length);
  } while (random == currentExample)
  
  currentExample = random;
  
  document.getElementById("maxIterationsInput").value = examples[currentExample].maxIterations;
  document.getElementById("maxLengthInput").value = examples[currentExample].maxLength;
  document.getElementById("scaleInput").value = examples[currentExample].scale;
  document.getElementById("areaInput").value = JSON.stringify(examples[currentExample].area);
  
  configUpdate();
}

function validate() {
  
}

function process() {
  // console.log(workerCount);
  
  location.hash = maxIterations + ";" + maxLength + ";" + scale + ";" + JSON.stringify(area);
  
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

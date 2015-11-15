"use strict";

importScripts("complex.js");

self.addEventListener("message", message, false);

var x, y, width, height, area, maxLength, maxIterations;

function message(e) {
  // console.log("worker created at:" + e.data.x + " | " + e.data.y);
  // console.log(e.data);
  
  var data = e.data;
  
  x = data.x;
  y = data.y;
  width = data.width;
  height = data.height;
  area = data.area;
  maxLength = data.maxLength;
  maxIterations = data.maxIterations;
  
  processData();
  
  // console.log("can I even haz this in worker??? :D");
  // self.postMessage(data);
}

function processData() {
  for (var y = 0; y < height; y++) {
    var values = [];
    var currentY = area.top + (((area.bottom - area.top) / height) * y);
    for (var x = 0; x < width; x++) {
      var currentX = area.left + (((area.right - area.left) / width) * x);
      
      values[x] = getValue(currentX, currentY) / maxIterations;
    }
    
    var toSend = {type: "results", data: {x: self.x, startY: self.y, currentY: y, results: values}};

    self.postMessage(toSend);
  }
  
  self.postMessage({type: "finished"});
}

function getValue(x, y) {
  var baseNumber = new Complex(x, y);
  var number = new Complex(x, y);
  
  var iterations = 0;
  
  while (number.length() < maxLength && iterations < maxIterations) {    
    number = number.square().add(baseNumber);
    
    iterations++;
  }
  
  // console.log(x + "|" + y + " --> " + iterations);
  return iterations;
}

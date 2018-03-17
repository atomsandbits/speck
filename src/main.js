"use strict";

import dat from 'dat.gui/build/dat.gui';

import Renderer from './renderer';
import View from './view';
import System from './system';
import xyz from './xyz';

import datGUISettings from './config/dat-gui';
import {caffeine} from './molecules/caffeine';

class Speck {
  constructor({canvasContainerID, canvasID, options}) {
    this.canvasContainer = document.getElementById(canvasContainerID);
    this.canvas = document.getElementById(canvasID);
    this.system = System.new();
    this.view = View.new();
    const defaultOptions = {
      zoomRatio: 1
    };
    this.options = {
      ...defaultOptions,
      ...options
    };
    this.gui = new dat.GUI({load: datGUISettings});

    this.renderer = new Speck.Renderer({canvas: this.canvas, canvasContainer: this.canvasContainer, system: this.system, view: this.view, options: this.options});

    this._init();
    this.loadStructure(caffeine);
    this.renderer.init();
  }

  setOptions(options) {
    const newOptions = {
      ...this.options,
      ...options
    }
    this.options = newOptions;
    this.renderer.options = newOptions;
  }
  getOptions() {
    return this.options;
  }
  _init() {
    let speck = this.renderer;
    this.gui.remember(speck);
    let controllers = [];

    let atomsFolder = this.gui.addFolder('Atoms');
    controllers.push(atomsFolder.add(speck, 'atomRadius', 0, 100));
    controllers.push(atomsFolder.add(speck, 'relativeAtomRadius', 0, 100));
    controllers.push(atomsFolder.add(speck, 'atomShade', 0, 100));

    let bondsFolder = this.gui.addFolder('Bonds');
    controllers.push(bondsFolder.add(speck, 'displayBonds'));
    controllers.push(bondsFolder.add(speck, 'bondRadius', 0, 100));
    controllers.push(bondsFolder.add(speck, 'bondThreshold').min(0));
    controllers.push(bondsFolder.add(speck, 'bondShade', 0, 100));

    let shadingFolder = this.gui.addFolder('Shading');
    controllers.push(shadingFolder.add(speck, 'ambientOcclusion', 0, 100));
    controllers.push(shadingFolder.add(speck, 'brightness', 0, 100));
    controllers.push(shadingFolder.add(speck, 'AOResolution', [
      16,
      64,
      128,
      256,
      512,
      1024,
      2048
    ]));
    controllers.push(shadingFolder.add(speck, 'samplesPerFrame', [
      0,
      1,
      2,
      4,
      8,
      16,
      32,
      64,
      128
    ]));

    let depthOfFieldFolder = this.gui.addFolder('Depth of Field');
    controllers.push(depthOfFieldFolder.add(speck, 'depthOfFieldStrength', 0, 100));
    controllers.push(depthOfFieldFolder.add(speck, 'depthOfFieldPosition', 0, 100));

    let detailFolder = this.gui.addFolder('Detail');
    controllers.push(detailFolder.add(speck, 'outlineStrength', 0, 100));
    controllers.push(detailFolder.add(speck, 'antialiasingPasses').min(1).step(1));
    controllers.push(detailFolder.add(speck, 'resolution', [
      64,
      128,
      256,
      512,
      1024,
      2048
    ]));

    this.gui.add(speck, 'center');
    this.gui.add(speck, 'downloadImage');

    for (let i = 0, len = controllers.length; i < len; i++) {
      let controller = controllers[i];
      controller.onChange((value) => {
        switch (controller.property) {
          case "atomRadius":
            this.renderer.view.atomScale = value / 100;
            break;
          case "relativeAtomRadius":
            this.renderer.view.relativeAtomScale = value / 100;
            break;
          case "atomShade":
            this.renderer.view.atomShade = value / 100;
            break;
          case "displayBonds":
            this.renderer.view.bonds = value;
            this.renderer.renderer.setSystem(this.renderer.system, this.renderer.view);
            break;
          case "bondRadius":
            this.renderer.view.bondScale = value / 100;
            break;
          case "bondThreshold":
            this.renderer.view.bondThreshold = value;
            this.renderer.renderer.setSystem(this.renderer.system, this.renderer.view);
            break;
          case "bondShade":
            this.renderer.view.bondShade = value / 100;
            break;
          case "ambientOcclusion":
            this.renderer.view.ao = value / 100;
            break;
          case "brightness":
            this.renderer.view.brightness = value / 100;
            break;
          case "AOResolution":
            this.renderer.renderer.setResolution(speck.resolution, value);
            break;
          case "samplesPerFrame":
            this.renderer.view.spf = value;
            break;
          case "depthOfFieldStrength":
            this.renderer.view.dofStrength = value / 100;
            break;
          case "depthOfFieldPosition":
            this.renderer.view.dofPosition = value / 100;
            break;
          case "outlineStrength":
            this.renderer.view.outline = value / 100;
            break;
          case "antialiasingPasses":
            this.renderer.view.fxaa = value;
            break;
          case "resolution":
            this.renderer.renderer.setResolution(value, speck.AOResolution);
            break;
        }
        View.resolve(this.renderer.view);
        this.renderer.reset();
      });
    }

    this.gui.closed = true;
  }
  loadStructure(molecule) {
    let structure = xyz(molecule)[0]
    this.system = System.new();
    for (let i = 0; i < structure.length; i++) {
      let a = structure[i];
      let x = a.position[0];
      let y = a.position[1];
      let z = a.position[2];
      System.addAtom(this.system, a.symbol, x, y, z);
    }
    System.center(this.system);
    System.calculateBonds(this.system);
    this.renderer.system = this.system;
    this.renderer.renderer.setSystem(this.system, this.view);
    View.center(this.view, this.system, this.options.zoomRatio);

    this.renderer.reset();
  }
  destroy() {
    this.gui.destroy();
    this.renderer.destroy();
  }
}

Speck.Renderer = class {
  constructor({canvas, canvasContainer, system, view, options}) {
    this.atomRadius = 60
    this.relativeAtomRadius = 100
    this.atomShade = 50

    this.displayBonds = true
    this.bondRadius = 50
    this.bondThreshold = 1.2
    this.bondShade = 50

    this.ambientOcclusion = 75
    this.brightness = 50
    this.AOResolution = 512
    this.samplesPerFrame = 32

    this.depthOfFieldStrength = 0
    this.depthOfFieldPosition = 50

    this.outlineStrength = 0
    this.antialiasingPasses = 1
    this.resolution = 512

    this.lastX = 0.0;
    this.lastY = 0.0;
    this.mouseDown = false;
    this.needReset = false;

    this.system = system;
    this.view = view;
    this.canvas = canvas;
    this.canvasContainer = canvasContainer;
    this.options = options;
    this.renderer = new Renderer(this.canvas, this.view.resolution, this.view.aoRes);
  }
  init() {
    this._createListeners();
    this._loop();
    this.view.atomScale = this.atomRadius / 100;
    this.view.relativeAtomScale = this.relativeAtomRadius / 100;
    this.view.atomShade = this.atomShade / 100;
    this.view.bonds = this.displayBonds;
    this.view.bondScale = this.bondRadius / 100;
    this.view.bondThreshold = this.bondThreshold;
    this.view.bondShade = this.bondShade / 100;
    this.view.ao = this.ambientOcclusion / 100;
    this.view.brightness = this.brightness / 100;
    this.view.spf = this.samplesPerFrame;
    this.view.dofStrength = this.depthOfFieldStrength / 100;
    this.view.dofPosition = this.depthOfFieldPosition / 100;
    this.view.outline = this.outlineStrength / 100;
    this.view.fxaa = this.antialiasingPasses;
    this.renderer.setSystem(this.system, this.view);
    this.renderer.setResolution(this.resolution, this.AOResolution);
    View.resolve(this.view);
    this.reset();
  }
  get dataURL() {
    this.renderer.render(this.view);
    return this.canvas.toDataURL("image/png");
  }
  reset() {
    this.needReset = true;
  }
  center() {
    View.center(this.view, this.system, this.options.zoomRatio);
    this.needReset = true;
  }
  downloadImage() {
    this.renderer.render(this.view);
    let imgURL = this.canvas.toDataURL("image/png");
    let iframe = "<iframe width='100%' height='100%' style={border: none, overflow: auto} src='" + imgURL + "'></iframe>"
    let x = window.open();
    x.document.open();
    x.document.write(iframe);
    x.document.body.style.margin = "0";
    x.document.body.style.height = "100%";
    x.document.body.style.width = "100%";
    x.document.close();
  }
  destroy() {
    this._destroyListeners();
    this._endLoop();
  }

  _canvasScrollListener(event) {
    let wd = 0;
    if (event.deltaY < 0) {
      wd = 1;
    } else {
      wd = -1;
    }
    this.view.zoom = this.view.zoom * (
      wd === 1
      ? 1 / 0.9
      : 0.9);
    this.needReset = true;
    event.preventDefault();
  }
  _canvasMousedownListener(event) {
    document.body.style.cursor = "none";
    this.mouseDown = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }
  _windowMouseupListener(event) {
    document.body.style.cursor = "default";
    this.mouseDown = false;
  }
  _windowMousemoveListener(event) {
    if (!this.mouseDown) {
      return;
    }
    let dx = event.clientX - this.lastX;
    let dy = event.clientY - this.lastY;
    if (dx == 0 && dy == 0) {
      return;
    }
    if (event.shiftKey) {
      View.translate(this.view, dx, dy);
    } else {
      View.rotate(this.view, dx, dy);
    }
    this.needReset = true;

    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }
  _createListeners() {
    this.canvasContainer.addEventListener("wheel", this._canvasScrollListener.bind(this));
    this.canvasContainer.addEventListener("mousedown", this._canvasMousedownListener.bind(this));
    window.addEventListener("mouseup", this._windowMouseupListener.bind(this));
    window.addEventListener("mousemove", this._windowMousemoveListener.bind(this));

    this.mouseCheckInterval = setInterval(function() {
      if (!this.mouseDown) {
        document.body.style.cursor = "default";
      }
    }, 20);
  }
  _destroyListeners() {
    this.canvasContainer.removeEventListener("wheel", this._canvasScrollListener.bind(this));
    this.canvasContainer.removeEventListener("mousedown", this._canvasMousedownListener.bind(this));
    window.removeEventListener("mouseup", this._windowMouseupListener.bind(this));
    window.removeEventListener("mousemove", this._windowMousemoveListener.bind(this));

    clearInterval(this.mouseCheckInterval);
  }
  _loop() {
    // document.getElementById("ao-indicator").style.width = Math.min(100, (renderer.getAOProgress() * 100)) + "%";
    if (this.needReset) {
      this.renderer.reset();
    }
    this.needReset = false;
    this.renderer.render(this.view);
    this.reqAnimationFrame = requestAnimationFrame(this._loop.bind(this));
  }
  _endLoop() {
    cancelAnimationFrame(this.reqAnimationFrame)
  }
}

export default Speck;

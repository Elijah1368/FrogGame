import World from "./Game/World.js";
import Display from "./Display.js";
import Controller from "./Controller.js";
import Engine from "./Engine.js";
import SoundPlayer from "./SoundPlayer.js";

/*
Load the files before starting the game
*/
window.addEventListener("load", function(event) {

  "use strict";
  //Json file of the game
  const ZONE_PREFIX = "Source/zone";
  const ZONE_SUFFIX = ".json";

      /////////////////
    //// CLASSES ////
  /////////////////


  /*
  Is in charged of loading game assets 
  */
  const AssetsManager = function() {

    this.tile_set_image = undefined;
    this.audio_urls = ["Assets/Sound/Music.mp3", "Assets/Sound/EnemyDamage.mp3", "Assets/Sound/Walk.mp3",
                "Assets/Sound/Jump.mp3", "Assets/Sound/Lose.mp3", "Assets/Sound/Win.mp3", 
                "Assets/Sound/PlayerDamage.mp3", "Assets/Sound/Appear.mp3"];
  };

  AssetsManager.prototype = {

    constructor: AssetsManager,


    requestJSON:function(url, callback) {
      
      //XMLHttpRequest is a request when trying to transfer files
      let request = new XMLHttpRequest();

      //Will wait until files are loaded
      request.addEventListener("load", function(event) {
        
        callback(JSON.parse(this.responseText));

      }, { once:true });

      //Get method url
      request.open("GET", url);
      request.send();

    },

    //same as top but loads image
    requestImage:function(url, callback) {

      let image = new Image();

      image.addEventListener("load", function(event) {

        callback(image);

      }, { once:true });

      image.src = url;

    },

    loadAudioFiles:function(){
      let audioFiles = {};
      for (let url of this.audio_urls){
        let name = url.match(/(\w*)\.mp3/)[1].toLowerCase();
        let audio = new Audio(url);
        audioFiles[name] = audio;
      }

      let soundPlayer = new SoundPlayer(audioFiles);
      soundPlayer.adjustSpeed("walk", 2.5);
      soundPlayer.adjustSpeed("music", 1.3);
      soundPlayer.adjustVolume("music", .8);
      soundPlayer.adjustVolume("jump", .8);
      return soundPlayer;
    }

  };

      ///////////////////
    //// FUNCTIONS ////
  ///////////////////
  
  //calls the controller keydownup and passes in event type and code
  var keyDownUp = function(event) {

    controller.keyDownUp(event.type, event.keyCode);

  };

  //jsut resizes the canvas to fit world
  var resize = function(event) {

    display.resize(document.documentElement.clientWidth, document.documentElement.clientHeight, world.height / world.width);
    display.render();

    var rectangle = display.context.canvas.getBoundingClientRect();

  };

  //very important as it is part of the engine
  var render = function() {


    var frame = undefined;
    
    display.drawMap   (assets_manager.tile_set_image,
    world.tile_set.columns, world.graphical_map, world.columns,  world.tile_set.tile_size);
     
    for (let i = 0; i < world.saws.length; i++) {

      let saw = world.saws[i];
      frame = world.tile_set.frames[saw.frame_value];

      display.drawObject(assets_manager.tile_set_image,
      frame.x, frame.y,
      saw.x,
      saw.y, frame.width, frame.height);

    }

       /*
    for (let index = game.world.carrots.length - 1; index > -1; -- index) {

      let carrot = game.world.carrots[index];

      frame = game.world.tile_set.frames[carrot.frame_value];

      display.drawObject(assets_manager.tile_set_image,
      frame.x, frame.y,
      carrot.x + Math.floor(carrot.width * 0.5 - frame.width * 0.5) + frame.offset_x,
      carrot.y + frame.offset_y, frame.width, frame.height);

    }

    */
    frame = world.tile_set.frames[world.player.frame_value];

    display.drawObject(assets_manager.tile_set_image,
    frame.x, frame.y,
    world.player.x + Math.floor(world.player.width * 0.5 - frame.width * 0.5) + frame.offset_x,
    world.player.y + frame.offset_y, frame.width, frame.height);

    display.render();

  };

  var update = function() {

    if (controller.left.active ) { 
      world.player.moveLeft ();
    }
    if (controller.right.active) { 
      world.player.moveRight();
    }
    if (controller.up.active) { 
      world.player.jump();
      controller.up.active = false;
    }

    world.update();

    if (world.door) {

      engine.stop();

      assets_manager.requestJSON(ZONE_PREFIX + world.door.destination_zone + ZONE_SUFFIX, (zone) => {

        world.setup(zone);

        engine.start();

      });

      return;

    }

  };

      /////////////////
    //// OBJECTS ////
  /////////////////

  var assets_manager = new AssetsManager();
  var soundPlayer = assets_manager.loadAudioFiles();
  var controller     = new Controller();
  var display        = new Display(document.querySelector("canvas"));
  var world         = new World(soundPlayer);
  var engine         = new Engine(1000/30, render, update);

      ////////////////////
    //// INITIALIZE ////
  ////////////////////

  display.buffer.canvas.height = world.height;
  display.buffer.canvas.width  = world.width;
  display.buffer.imageSmoothingEnabled = false;



  

  assets_manager.requestJSON(ZONE_PREFIX + world.zone_id + ZONE_SUFFIX, (zone) => {

    world.setup(zone);
    assets_manager.requestImage("./Assets/SpriteSheet2.png", (image) => {

      assets_manager.tile_set_image = image;

      resize();
      engine.start();

    });

  });

  window.addEventListener("keydown", keyDownUp);
  window.addEventListener("keyup"  , keyDownUp);
  window.addEventListener("resize" , resize);

});

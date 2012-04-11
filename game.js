$(function() {
  var canvas = document.getElementById('game-canvas');
  var context = canvas.getContext('2d');

  var spriteSheet;
  var spriteSheetFrequency = 4;

  var image = new Image();
  image.src = 'character.png';

  image.onload = function() {
    spriteSheet = new SpriteSheet({
      images: [image],

      frames: { width: 96, height: 96 },

      animations: {
        walkLeft: { frames: [5, 6, 7, 8], frequency: spriteSheetFrequency },
        walkRight: { frames: [20, 21, 22, 23], frequency: spriteSheetFrequency },
        walkUp: { frames: [35, 36, 37, 38], frequency: spriteSheetFrequency },
        walkDown: { frames: [50, 51, 52, 53], frequency: spriteSheetFrequency },

        idleLeft: { frames: [10, 11], frequency: spriteSheetFrequency },
        idleRight: { frames: [25, 26], frequency: spriteSheetFrequency },
        idleUp: { frames: [40, 41], frequency: spriteSheetFrequency },
        idleDown: { frames: [55, 56], frequency: spriteSheetFrequency }
      }
    });

    var bitmapAnimation = new BitmapAnimation(spriteSheet);

    var Character = Backbone.Model.extend({
      movementSpeed: 5,

      move: function(direction) {
        if (direction === 'left') {
          this.set('x', this.get('x') - this.movementSpeed);
        } else if (direction === 'up') {
          this.set('y', this.get('y') - this.movementSpeed);
        } else if (direction === 'right') {
          this.set('x', this.get('x') + this.movementSpeed);
        } else if (direction === 'down') {
          this.set('y', this.get('y') + this.movementSpeed);
        }
      },

      idle: function() {
        this.trigger('idle', this);
      }
    });

    var CharacterView = Backbone.View.extend({
      initialize: function() {
        _.bindAll(this);
        this.ele = this.options.ele;

        this.ele.x = this.model.get('x');
        this.ele.y = this.model.get('y');

        this.ele.gotoAndPlay('idleDown');

        this.model.on('idle', this.showCharacterIdleAnimation);
        this.model.on('change:x change:y', this.updateCharacterPositionAndAnimation);
      },

      updateCharacterPositionAndAnimation: function() {
        this.ele.x = this.model.get('x');
        this.ele.y = this.model.get('y');

        if (this.model.get('x') > this.model.previous('x')) {
          if (this.ele.currentAnimation !== 'walkRight') {
            this.ele.gotoAndPlay('walkRight');
          }
        } else if (this.model.get('x') < this.model.previous('x')) {
          if (this.ele.currentAnimation !== 'walkLeft') {
            this.ele.gotoAndPlay('walkLeft');
          }
        }

        if (this.model.get('y') > this.model.previous('y')) {
          if (this.ele.currentAnimation !== 'walkDown') {
            this.ele.gotoAndPlay('walkDown');
          }
        } else if (this.model.get('y') < this.model.previous('y')) {
          if (this.ele.currentAnimation !== 'walkUp') {
            this.ele.gotoAndPlay('walkUp');
          }
        }
      },

      showCharacterIdleAnimation: function() {
        this.ele.paused = true;
        this.ele.gotoAndPlay(this.ele.currentAnimation.replace('walk', 'idle'));
      }
    });

    var character = new Character({ x: 50, y: 50 });

    var characterView = new CharacterView({
      ele: bitmapAnimation,
      model: character
    });

    var stage = new Stage(canvas);
    stage.addChild(characterView.ele);
    Ticker.addListener(stage);
    Ticker.setFPS(24);

    var DocumentView = Backbone.View.extend({
      el: document,

      initialize: function() {
        _.bindAll(this);
        this.character = this.options.character;

        this.$el.on('keydown', this.onKeyDown);
        this.$el.on('keyup', this.onKeyUp);
      },

      onKeyDown: function(event) {
        if (event.which === 65) {
          this.character.move('left');
        } else if (event.which === 87) {
          this.character.move('up');
        } else if (event.which === 68) {
          this.character.move('right');
        } else if (event.which === 83) {
          this.character.move('down');
        }
      },

      onKeyUp: function(event) {
        this.character.idle();
      }
    });

    var documentView = new DocumentView({ character: character });
  };
});

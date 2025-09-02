class Sprite {
  constructor(config) {

    //Set up the image
    this.image = new Image();
    this.image.src = config.src;
    this.image.onload = () => {
      const dimensions = utils.calculateSpriteSize(
        this.image,
        config.rows || 8,
        config.cols || 12,
      );

      this.spriteWidth = dimensions.spriteWidth;
      this.spriteHeight = dimensions.spriteHeight;
      this.isLoaded = true;
    }


    //Configure Animation & Initial State
    this.animations = config.animations || {
      "idle-down": [[1, 0]],
      "idle-left": [[1, 1]],
      "idle-right": [[1, 2]],
      "idle-up": [[1, 3]],
      "walk-down": [[0, 0], [1, 0], [2, 0], [1, 0]],
      "walk-left": [[0, 1], [1, 1], [2, 1], [1, 1]],
      "walk-right": [[0, 2], [1, 2], [2, 2], [1, 2]],
      "walk-up": [[0, 3], [1, 3], [2, 3], [1, 3]],
    }
    this.currentAnimation = config.currentAnimation || "idle-down";
    this.currentAnimationFrame = 0;

    this.animationFrameLimit = config.animationFrameLimit || 38;
    this.animationFrameProgress = this.animationFrameLimit;

    //Reference the game object
    this.gameObject = config.gameObject;
  }

  get frame() {
    return this.animations[this.currentAnimation][this.currentAnimationFrame]
  }

  setAnimation(key) {
    if (this.currentAnimation !== key) {
      this.currentAnimation = key;
      this.currentAnimationFrame = 0;
      this.animationFrameProgress = this.animationFrameLimit;
    }
  }

  updateAnimationProgress() {
    //Downtick frame progress
    if (this.animationFrameProgress > 0) {
      this.animationFrameProgress -= 1;
      return;
    }

    //Reset the counter
    this.animationFrameProgress = this.animationFrameLimit;
    this.currentAnimationFrame += 1;

    if (this.frame === undefined) {
      this.currentAnimationFrame = 0
    }


  }


  draw(ctx) {
    const x = this.gameObject.x - 8;
    const y = this.gameObject.y;

    const [frameX, frameY] = this.frame;

    // this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);

    this.isLoaded && ctx.drawImage(this.image,
      frameX * this.spriteWidth, frameY * this.spriteHeight,
      this.spriteWidth, this.spriteHeight,
      x, y,
      this.spriteWidth,
      this.spriteHeight,
    );

    this.updateAnimationProgress();
  }

}
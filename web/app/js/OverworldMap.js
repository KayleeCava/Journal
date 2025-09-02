class OverworldMap {
  constructor(config) {
    this.id = null;

    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || [];
    this.walls = config.walls || {};
    this.staticWallKeys = new Set(Object.keys(config.walls || {}));

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
    this.isCutsceneCancelled = false;

    this.isPaused = false;
  }

  drawLowerImage(ctx) {
    ctx.drawImage(this.lowerImage, 0, 0, ctx.canvas.width, ctx.canvas.height)
  }

  drawUpperImage(ctx) {
    ctx.drawImage(this.upperImage, 0, 0, ctx.canvas.width, ctx.canvas.height)
  }


  isSpaceTaken(currentX, currentY, direction) {
    const { x, y } = utils.nextPosition(currentX, currentY, direction);

    // const snappedX = Math.round(x / 38) * 38;
    // const snappedY = Math.round(y / 65) * 65;
    // const snappedKey = `${snappedX},${snappedY}`;

    // // If it's a static wall, use snapped position
    // if (this.staticWallKeys.has(snappedKey)) {
    //   return this.walls[snappedKey] || false;
    // }

    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach(key => {
      let object = this.gameObjects[key];
      object.id = key
      console.log(object.id)
      object.mount(this);
    })
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;
    this.isCutsceneCancelled = false; // Reset cancel flag

    for (let i = 0; i < events.length; i++) {
      // Check if cutscene was cancelled before processing next event
      if (this.isCutsceneCancelled) {
        console.log(`Cutscene cancelled at event ${i}/${events.length}`);
        break; // Exit the loop, stopping all remaining events
      }

      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      });

      try {
        await eventHandler.init();
      } catch (error) {
        console.log("Event cancelled or errored:", error);
        break; // Stop on any error or cancellation
      }
    }

    // Only set to false if not already cancelled
    if (!this.isCutsceneCancelled) {
      this.isCutscenePlaying = false;
      // Resume NPC behaviors only if cutscene completed normally
      Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this));
    }
  }
  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    });

    if (!this.isCutscenePlaying && match && match.talking.length) {
      // Get the normal list of events for this NPC
      const talkingEvents = match.talking[0].events;

      // Define the mapping from your 'level_' keys to the numeric IDs
      const quizKeyToIdMap = {
        level_1: 2,
        level_2: 3,
        level_3: 4,
        level_4: 5,
        level_5: 6,
      };

      // Find all quiz IDs this NPC requires by looking through its events
      const requiredQuizIds = talkingEvents
        .filter(event => event.type === 'quizChoice')
        .map(event => {
          const correctChoice = event.choices.find(c => c.answer_key.startsWith("level_"));
          return correctChoice ? quizKeyToIdMap[correctChoice.answer_key] : null;
        })
        .filter(id => id !== null); // Clean up list to remove any nulls

      // Get the player's solved quiz IDs from the profile data
      const playerSolvedIds = this.overworld.playerInfo?.answer_keys || [];

      // Check if the NPC has quizzes AND if the player has solved all of them
      const allQuizzesSolved = requiredQuizIds.length > 0 && requiredQuizIds.every(id => playerSolvedIds.includes(id));

      if (allQuizzesSolved) {
        // If all quizzes are solved, start a special cutscene with a "well done" message
        this.startCutscene([
          { type: "textMessage", text: "Ngươi đã vượt qua thử thách tốt lắm", faceHero: match.id },
        ]);
      } else {
        // Otherwise, start the normal cutscene with the unsolved quizzes
        this.startCutscene(talkingEvents);
      }
    }
  }
  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
    console.log(match)
    if (!this.isCutscenePlaying && match) {
      this.startCutscene(match[0].events)
    }
  }
  cancelCutscene() {
    // Flag to stop processing remaining events
    this.isCutsceneCancelled = true;
    this.isCutscenePlaying = false;

    // Reset any NPCs back to their behavior loops
    Object.values(this.gameObjects).forEach(object => {
      if (object.behaviorLoop && object.behaviorLoop.length > 0) {
        setTimeout(() => {
          object.doBehaviorEvent(this);
        }, 100);
      }
    });

    console.log("Cutscene cancelled - all remaining events stopped");
  }
  addWall(x, y) {
    this.walls[`${x},${y}`] = true;
  }
  removeWall(x, y) {
    delete this.walls[`${x},${y}`]
  }
  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const { x, y } = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x, y);
  }
}

window.OverworldMaps = {
  OutsideShack: {
    lowerSrc: "/images/maps/ShackExteriorLower.png",
    upperSrc: "/images/maps/ShackExteriorUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(10),
        y: utils.withGrid(13),
        // src: "/images/characters/stan.png"
      }),
      npc1: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(12),
        src: "/images/characters/gnome.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Ta cảm nhận được ngọn lửa hiếu học trong ngươi. Nhưng con đường của một 'Kage' không chỉ là sức mạnh, mà còn là sự khiêm nhường. Hãy nhận thử thách và vượt qua nó.",
                faceHero: "npc1"
              },
              {
                type: "textMessage",
                text: "Tôi đã sẵn sàng cho thử thách.",
              },
              {
                type: "textMessage",
                text: "Tốt. Hãy cho ta thấy sự hiểu biết của ngươi.",
              },
              {
                type: "quizChoice",
                successMessage: "Câu trả lời chính xác. Đây là phần thưởng của ngươi",
                question: "Khóa học nào vẫn chưa được mở tại CyberJutsu?",
                choices: [
                  { text: "RedTeam", answer_key: "incorrect_1" },
                  { text: "Web Pentest", answer_key: "incorrect_2" },
                  { text: "1 day", answer_key: "incorrect_3" },
                  { text: "Assembly", answer_key: "level_1" }
                ],
              },
            ]
          }
        ],
      }),
      npc2: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(2),
        src: "/images/characters/bill.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Thế giới này tràn ngập kẻ thù. Muốn sống sót, ngươi phải di chuyển nhanh, hành động bất ngờ. Ta có thể dạy cho ngươi, nhưng trước hết, ngươi phải chứng minh sự tập trung của mình.",
                faceHero: "npc2"
              },
              {
                type: "textMessage",
                text: "Tôi sẵn sàng. Hãy cho tôi biết thử thách.",
              },
              {
                type: "textMessage",
                text: "Mỗi 2 tuần, chúng ta đều có một buổi Flipped đặc biệt để thực chiến, nơi mà mọi sự bảo vệ đều bị phá vỡ.",
              },
              {
                type: "quizChoice",
                successMessage: "Tốt. Hãy nhận phần thưởng của ta",
                question: "Ngươi có nhớ buổi Flipped diễn ra vào thứ mấy không? Nhanh lên, nếu không, ngươi sẽ bị tụt lại phía sau đấy.",
                choices: [
                  { text: "Thứ 2", answer_key: "incorrect_1" },
                  { text: "Thứ 3", answer_key: "incorrect_2" },
                  { text: "Thứ 4", answer_key: "level_2" },
                  { text: "Thứ 5", answer_key: "incorrect_3" }
                ],
              },
            ]
          }
        ],
      }),
    },
    walls: {
      // "16,16": true
      [utils.asGridCoord(23, 7)]: true,
      [utils.asGridCoord(24, 7)]: true,
      [utils.asGridCoord(23, 8)]: true,
      [utils.asGridCoord(24, 8)]: true,
      [utils.asGridCoord(23, 10)]: true,
      [utils.asGridCoord(24, 10)]: true,
      [utils.asGridCoord(23, 11)]: true,
      [utils.asGridCoord(24, 11)]: true,
      [utils.asGridCoord(23, 12)]: true,

      [utils.asGridCoord(24, 2)]: true,
      [utils.asGridCoord(24, 1)]: true,
      [utils.asGridCoord(25, 1)]: true,
      [utils.asGridCoord(26, 1)]: true,
      [utils.asGridCoord(27, 1)]: true,
      [utils.asGridCoord(27, 2)]: true,
      [utils.asGridCoord(28, 1)]: true,
      [utils.asGridCoord(28, 2)]: true,
      [utils.asGridCoord(28, 3)]: true,
      [utils.asGridCoord(28, 4)]: true,
      [utils.asGridCoord(28, 5)]: true,
      [utils.asGridCoord(28, 6)]: true,
      [utils.asGridCoord(28, 7)]: true,
      [utils.asGridCoord(28, 8)]: true,
      [utils.asGridCoord(28, 9)]: true,
      [utils.asGridCoord(28, 10)]: true,
      [utils.asGridCoord(28, 11)]: true,
      [utils.asGridCoord(28, 12)]: true,
      [utils.asGridCoord(28, 13)]: true,
      [utils.asGridCoord(28, 14)]: true,
      [utils.asGridCoord(28, 15)]: true,
      [utils.asGridCoord(28, 16)]: true,
      [utils.asGridCoord(28, 17)]: true,
      [utils.asGridCoord(18, 17)]: true,
      [utils.asGridCoord(19, 17)]: true,
      [utils.asGridCoord(20, 17)]: true,
      [utils.asGridCoord(21, 17)]: true,
      [utils.asGridCoord(22, 17)]: true,
      [utils.asGridCoord(23, 17)]: true,
      [utils.asGridCoord(24, 17)]: true,
      [utils.asGridCoord(25, 17)]: true,
      [utils.asGridCoord(26, 17)]: true,
      [utils.asGridCoord(27, 17)]: true,
      [utils.asGridCoord(0, 16)]: true,
      [utils.asGridCoord(1, 16)]: true,
      [utils.asGridCoord(2, 16)]: true,
      [utils.asGridCoord(3, 16)]: true,
      [utils.asGridCoord(4, 16)]: true,
      [utils.asGridCoord(5, 16)]: true,
      [utils.asGridCoord(6, 16)]: true,
      [utils.asGridCoord(7, 16)]: true,
      [utils.asGridCoord(8, 16)]: true,
      [utils.asGridCoord(9, 16)]: true,
      [utils.asGridCoord(10, 16)]: true,
      [utils.asGridCoord(11, 16)]: true,
      [utils.asGridCoord(12, 16)]: true,
      [utils.asGridCoord(13, 16)]: true,
      [utils.asGridCoord(14, 16)]: true,
      [utils.asGridCoord(15, 16)]: true,
      [utils.asGridCoord(16, 16)]: true,
      [utils.asGridCoord(17, 16)]: true,
      [utils.asGridCoord(0, 15)]: true,
      [utils.asGridCoord(0, 14)]: true,
      [utils.asGridCoord(0, 13)]: true,
      [utils.asGridCoord(0, 12)]: true,
      [utils.asGridCoord(1, 12)]: true,
      [utils.asGridCoord(2, 12)]: true,
      [utils.asGridCoord(2, 9)]: true,
      [utils.asGridCoord(2, 10)]: true,
      [utils.asGridCoord(2, 11)]: true,
      [utils.asGridCoord(3, 8)]: true,
      [utils.asGridCoord(4, 2)]: true,
      [utils.asGridCoord(3, 3)]: true,
      [utils.asGridCoord(3, 4)]: true,
      [utils.asGridCoord(3, 5)]: true,
      [utils.asGridCoord(3, 6)]: true,
      [utils.asGridCoord(3, 7)]: true,
      [utils.asGridCoord(5, 2)]: true,
      [utils.asGridCoord(6, 2)]: true,
      [utils.asGridCoord(7, 1)]: true,
      [utils.asGridCoord(8, 1)]: true,
      [utils.asGridCoord(9, 1)]: true,
      [utils.asGridCoord(10, 1)]: true,
      [utils.asGridCoord(11, 1)]: true,
      [utils.asGridCoord(12, 1)]: true,
      [utils.asGridCoord(13, 1)]: true,
      [utils.asGridCoord(14, 1)]: true,
      [utils.asGridCoord(15, 1)]: true,
      [utils.asGridCoord(16, 1)]: true,

      [utils.asGridCoord(21, 3)]: true,
      [utils.asGridCoord(21, 4)]: true,
      [utils.asGridCoord(21, 5)]: true,
      [utils.asGridCoord(21, 6)]: true,
      [utils.asGridCoord(21, 7)]: true,
      [utils.asGridCoord(21, 8)]: true,
      [utils.asGridCoord(21, 9)]: true,
      [utils.asGridCoord(21, 10)]: true,
      [utils.asGridCoord(21, 11)]: true,
      [utils.asGridCoord(21, 12)]: true,
      [utils.asGridCoord(21, 13)]: true,
      [utils.asGridCoord(22, 2)]: true,
      [utils.asGridCoord(22, 3)]: true,
      [utils.asGridCoord(22, 4)]: true,
      [utils.asGridCoord(22, 5)]: true,
      [utils.asGridCoord(23, 2)]: true,
      [utils.asGridCoord(23, 5)]: true,
      [utils.asGridCoord(25, 2)]: true,
      [utils.asGridCoord(22, 6)]: true,
      [utils.asGridCoord(22, 7)]: true,
      [utils.asGridCoord(22, 8)]: true,
      [utils.asGridCoord(22, 9)]: true,
      [utils.asGridCoord(22, 10)]: true,
      [utils.asGridCoord(22, 11)]: true,
      [utils.asGridCoord(22, 12)]: true,
      [utils.asGridCoord(22, 13)]: true,

      [utils.asGridCoord(20, 10)]: true,
      [utils.asGridCoord(20, 11)]: true,
      [utils.asGridCoord(20, 12)]: true,

      [utils.asGridCoord(17, 2)]: true,
      // [utils.asGridCoord(17, 3)]: true,
      [utils.asGridCoord(18, 3)]: true,
      [utils.asGridCoord(19, 3)]: true,
      [utils.asGridCoord(20, 3)]: true,
      [utils.asGridCoord(20, 4)]: true,
      [utils.asGridCoord(20, 5)]: true,

      [utils.asGridCoord(4, 12)]: true,
      [utils.asGridCoord(17, 12)]: true,
      [utils.asGridCoord(18, 12)]: true,
      [utils.asGridCoord(17, 11)]: true,
      [utils.asGridCoord(18, 11)]: true,

      //house
      [utils.asGridCoord(7, 8)]: true,
      [utils.asGridCoord(8, 8)]: true,
      [utils.asGridCoord(9, 8)]: true,
      [utils.asGridCoord(10, 8)]: true,
      [utils.asGridCoord(11, 8)]: true,
      [utils.asGridCoord(12, 8)]: true,
      [utils.asGridCoord(13, 8)]: true,
      [utils.asGridCoord(14, 8)]: true,
      [utils.asGridCoord(15, 8)]: true,
      [utils.asGridCoord(16, 8)]: true,

      [utils.asGridCoord(7, 7)]: true,
      [utils.asGridCoord(8, 7)]: true,
      [utils.asGridCoord(9, 7)]: true,
      [utils.asGridCoord(10, 7)]: true,
      [utils.asGridCoord(11, 7)]: true,
      [utils.asGridCoord(12, 7)]: true,
      [utils.asGridCoord(13, 7)]: true,
      [utils.asGridCoord(14, 7)]: true,
      [utils.asGridCoord(15, 7)]: true,
      [utils.asGridCoord(16, 7)]: true,

      [utils.asGridCoord(9, 10)]: true,
      [utils.asGridCoord(14, 10)]: true,
      [utils.asGridCoord(14, 9)]: true,

      [utils.asGridCoord(10, 9)]: true,
      [utils.asGridCoord(11, 9)]: true,
      [utils.asGridCoord(12, 9)]: true,
      [utils.asGridCoord(13, 9)]: true,

      [utils.asGridCoord(1, 13)]: true,
      [utils.asGridCoord(2, 13)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11, 10)]: [
        {
          events: [
            { type: "changeMap", map: "InsideShack" },
          ]
        }
      ],
      [utils.asGridCoord(12, 10)]: [
        {
          events: [
            { type: "changeMap", map: "InsideShack" },
          ]
        }
      ],
      [utils.asGridCoord(1, 14)]: [
        {
          events: [
            { type: "changeMap", map: "Grave", isAdmin: true },
          ]
        }
      ],
      [utils.asGridCoord(26, 2)]: [
        {
          events: [
            { type: "changeMap", map: "Chest" },
          ]
        }
      ],
    }
  },
  InsideShack: {
    lowerSrc: "/images/maps/ShackInteriorMAP-V2Lower.png",
    upperSrc: "/images/maps/ShackInteriorMAP-V2Upper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(14),
      }),
      npc1: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(11),
        direction: "right",
        src: "/images/characters/stan.png",
      }),
      item: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(11),
        // direction: "right",
        // src: "/images/characters/stan.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Hừm... Ngươi muốn học về tấn công sao? Ta có thể dạy cho ngươi, nhưng trước hết, ngươi phải hiểu bản chất của lỗ hổng. Có một loại lỗ hổng có thể tiêm nhiễm vào hệ thống để thao túng nó, biến nó thành công cụ của ngươi.",
                faceHero: "item"
              },
              {
                type: "textMessage",
                text: "Tôi muốn biết rõ hơn về lỗ hổng đó.",
              },
              {
                type: "quizChoice",
                successMessage: "Tốt. Hãy nhận phần thưởng và tìm hiểu kĩ hơn về lỗ hổng trên",
                question: "Được. Trước tiên hãy cho ta biết trong số những lỗ hổng sau, lỗ hổng nào KHÔNG thuộc chủng lỗi Injection? Trả lời đi, và ta sẽ cho ngươi thấy cách tấn công.",
                choices: [
                  { text: "HTML Injection", answer_key: "incorrect_1" },
                  { text: "SSRF", answer_key: "level_3" },
                  { text: "CMD Injection", answer_key: "incorrect_2" },
                  { text: "SQL Injection", answer_key: "incorrect_3" }
                ],
              },
            ]
          }
        ],
      }),
      npc2: new Person({
        x: utils.withGrid(14),
        y: utils.withGrid(5),
        src: "/images/characters/soos.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Ta là người tạo ra những lỗi lầm, và cũng là người sửa chữa chúng. Ngươi đến đây để học hỏi từ sai lầm của ta sao? Tốt. Ngươi phải hiểu được sức mạnh hủy diệt của nó để có thể phòng thủ.",
                faceHero: "npc2"
              },
              {
                type: "textMessage",
                text: "Tôi muốn học về cách phòng thủ.",
              },
              {
                type: "quizChoice",
                successMessage: "Ngươi đã trả lời đúng. Hãy nhận phần thưởng. Lần tới ta sẽ chỉ cho ngươi",
                question: "Được. Trước tiên ta hỏi ngươi: Khi một kẻ tấn công bằng lỗ hổng Broken Access Control, hắn có thể gây ra những gì? Hãy trả lời, và ta sẽ chỉ cho ngươi cách để không phạm phải sai lầm đó.",
                choices: [
                  { text: "Remote Code Execution", answer_key: "incorrect_1" },
                  { text: "Information Disclosure", answer_key: "incorrect_2" },
                  { text: "Privilege Escalation", answer_key: "incorrect_3" },
                  { text: "All of them", answer_key: "level_4" }
                ],
              },
            ]
          }
        ],
      })
    },
    walls: {
      [utils.asGridCoord(7, 8)]: true,
      [utils.asGridCoord(7, 9)]: true,
      [utils.asGridCoord(7, 10)]: true,
      [utils.asGridCoord(7, 12)]: true,
      [utils.asGridCoord(7, 13)]: true,
      [utils.asGridCoord(7, 14)]: true,
      [utils.asGridCoord(7, 15)]: true,
      [utils.asGridCoord(8, 14)]: true,
      [utils.asGridCoord(8, 15)]: true,
      [utils.asGridCoord(9, 14)]: true,
      [utils.asGridCoord(9, 15)]: true,
      [utils.asGridCoord(10, 15)]: true,
      [utils.asGridCoord(10, 16)]: true,
      [utils.asGridCoord(10, 17)]: true,
      [utils.asGridCoord(11, 17)]: true,
      [utils.asGridCoord(12, 17)]: true,
      [utils.asGridCoord(13, 17)]: true,
      [utils.asGridCoord(13, 15)]: true,
      [utils.asGridCoord(13, 16)]: true,
      [utils.asGridCoord(14, 15)]: true,
      [utils.asGridCoord(15, 15)]: true,
      [utils.asGridCoord(16, 15)]: true,
      [utils.asGridCoord(17, 14)]: true,
      [utils.asGridCoord(18, 14)]: true,
      [utils.asGridCoord(19, 14)]: true,
      [utils.asGridCoord(20, 14)]: true,
      [utils.asGridCoord(21, 14)]: true,
      [utils.asGridCoord(22, 14)]: true,
      [utils.asGridCoord(23, 14)]: true,
      [utils.asGridCoord(24, 13)]: true,
      [utils.asGridCoord(21, 12)]: true,
      [utils.asGridCoord(22, 12)]: true,
      [utils.asGridCoord(23, 12)]: true,
      [utils.asGridCoord(21, 11)]: true,
      [utils.asGridCoord(21, 10)]: true,
      [utils.asGridCoord(22, 10)]: true,
      [utils.asGridCoord(23, 6)]: true,
      [utils.asGridCoord(23, 7)]: true,
      [utils.asGridCoord(23, 8)]: true,
      [utils.asGridCoord(23, 9)]: true,
      [utils.asGridCoord(24, 5)]: true,

      [utils.asGridCoord(19, 4)]: true,
      [utils.asGridCoord(20, 4)]: true,
      [utils.asGridCoord(21, 4)]: true,
      [utils.asGridCoord(22, 4)]: true,
      [utils.asGridCoord(23, 4)]: true,

      [utils.asGridCoord(16, 3)]: true,
      [utils.asGridCoord(17, 3)]: true,
      [utils.asGridCoord(18, 3)]: true,
      [utils.asGridCoord(13, 4)]: true,
      [utils.asGridCoord(15, 4)]: true,

      [utils.asGridCoord(10, 4)]: true,
      [utils.asGridCoord(11, 5)]: true,
      [utils.asGridCoord(12, 5)]: true,

      [utils.asGridCoord(8, 4)]: true,
      [utils.asGridCoord(9, 4)]: true,

      [utils.asGridCoord(7, 5)]: true,
      [utils.asGridCoord(7, 6)]: true,
      [utils.asGridCoord(6, 7)]: true,
      [utils.asGridCoord(6, 8)]: true,


    },
    cutsceneSpaces: {
      [utils.asGridCoord(11, 16)]: [
        {
          events: [
            { type: "changeMap", map: "OutsideShack" },
          ]
        }
      ],
      [utils.asGridCoord(12, 16)]: [
        {
          events: [
            { type: "changeMap", map: "OutsideShack" },
          ]
        }
      ],
    }
  },
  Grave: {
    requiresAdmin: true,
    lowerSrc: "/images/maps/GraveLower.png",
    upperSrc: "/images/maps/GraveUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(28),
        y: utils.withGrid(10),
        // src: "/images/characters/stan.png"
      }),
      item: new Person({
        x: utils.withGrid(16),
        y: utils.withGrid(5),
        talking: [
          {
            events: [
              { type: "textMessage", text: "I'm busy...", faceHero: "item" },
              { type: "textMessage", text: "Go away!" },
            ]
          }
        ],
      }),
      item_2: new Person({
        x: utils.withGrid(18),
        y: utils.withGrid(5),
        talking: [
          {
            events: [
              { type: "textMessage", text: "I'm busy...", faceHero: "item_2" },
              { type: "textMessage", text: "Go away!" },
            ]
          }
        ],
      }),
      item_3: new Person({
        x: utils.withGrid(17),
        y: utils.withGrid(5),
        talking: [
          {
            events: [
              { type: "textMessage", text: "I'm busy...", faceHero: "item_3" },
              { type: "textMessage", text: "Go away!" },
            ]
          }
        ],
      }),
      item_4: new Person({
        x: utils.withGrid(14),
        y: utils.withGrid(5),
        talking: [
          {
            events: [
              { type: "textMessage", text: "I'm busy...", faceHero: "item_4" },
              { type: "textMessage", text: "Go away!" },
            ]
          }
        ],
      }),
      item_5: new Person({
        x: utils.withGrid(15),
        y: utils.withGrid(5),
        talking: [
          {
            events: [
              { type: "textMessage", text: "I'm busy...", faceHero: "item_5" },
              { type: "textMessage", text: "Go away!" },
            ]
          }
        ],
      }),
    },
    walls: {
      // "16,16": true
      [utils.asGridCoord(3, 8)]: true,
      [utils.asGridCoord(4, 8)]: true,
      [utils.asGridCoord(7, 8)]: true,
      [utils.asGridCoord(8, 8)]: true,
      [utils.asGridCoord(8, 11)]: true,
      [utils.asGridCoord(20, 10)]: true,
      [utils.asGridCoord(21, 10)]: true,
      [utils.asGridCoord(22, 7)]: true,
      [utils.asGridCoord(25, 7)]: true,
      [utils.asGridCoord(26, 7)]: true,
      [utils.asGridCoord(24, 10)]: true,
      [utils.asGridCoord(25, 10)]: true,
      [utils.asGridCoord(11, 8)]: true,
      [utils.asGridCoord(12, 8)]: true,
      [utils.asGridCoord(12, 11)]: true,
      [utils.asGridCoord(11, 11)]: true,
      [utils.asGridCoord(7, 11)]: true,
      [utils.asGridCoord(3, 11)]: true,
      [utils.asGridCoord(4, 11)]: true,

      [utils.asGridCoord(2, 15)]: true,
      [utils.asGridCoord(3, 15)]: true,
      [utils.asGridCoord(4, 15)]: true,
      [utils.asGridCoord(5, 15)]: true,
      [utils.asGridCoord(6, 15)]: true,
      [utils.asGridCoord(7, 15)]: true,
      [utils.asGridCoord(8, 15)]: true,
      [utils.asGridCoord(9, 15)]: true,
      [utils.asGridCoord(10, 15)]: true,
      [utils.asGridCoord(11, 15)]: true,
      [utils.asGridCoord(12, 15)]: true,
      [utils.asGridCoord(13, 15)]: true,
      [utils.asGridCoord(14, 15)]: true,
      [utils.asGridCoord(15, 15)]: true,
      [utils.asGridCoord(16, 15)]: true,
      [utils.asGridCoord(17, 15)]: true,
      [utils.asGridCoord(18, 15)]: true,
      [utils.asGridCoord(19, 15)]: true,
      [utils.asGridCoord(20, 15)]: true,
      [utils.asGridCoord(21, 15)]: true,
      [utils.asGridCoord(22, 15)]: true,
      [utils.asGridCoord(23, 15)]: true,
      [utils.asGridCoord(24, 15)]: true,
      [utils.asGridCoord(25, 15)]: true,
      [utils.asGridCoord(26, 15)]: true,
      [utils.asGridCoord(27, 15)]: true,
      [utils.asGridCoord(28, 15)]: true,

      [utils.asGridCoord(29, 15)]: true,
      [utils.asGridCoord(29, 14)]: true,
      [utils.asGridCoord(29, 13)]: true,
      [utils.asGridCoord(30, 13)]: true,
      [utils.asGridCoord(31, 13)]: true,

      [utils.asGridCoord(2, 3)]: true,
      [utils.asGridCoord(2, 4)]: true,
      [utils.asGridCoord(2, 5)]: true,
      [utils.asGridCoord(2, 6)]: true,
      [utils.asGridCoord(2, 7)]: true,
      [utils.asGridCoord(2, 8)]: true,
      [utils.asGridCoord(2, 9)]: true,
      [utils.asGridCoord(2, 10)]: true,
      [utils.asGridCoord(2, 11)]: true,
      [utils.asGridCoord(2, 12)]: true,
      [utils.asGridCoord(2, 13)]: true,
      [utils.asGridCoord(2, 14)]: true,
      [utils.asGridCoord(2, 15)]: true,

      [utils.asGridCoord(3, 3)]: true,
      [utils.asGridCoord(4, 3)]: true,
      [utils.asGridCoord(5, 3)]: true,
      [utils.asGridCoord(6, 3)]: true,

      [utils.asGridCoord(7, 4)]: true,
      [utils.asGridCoord(8, 4)]: true,
      [utils.asGridCoord(11, 4)]: true,
      [utils.asGridCoord(9, 3)]: true,
      [utils.asGridCoord(10, 3)]: true,
      [utils.asGridCoord(12, 3)]: true,


      [utils.asGridCoord(13, 6)]: true,
      [utils.asGridCoord(13, 5)]: true,
      [utils.asGridCoord(13, 4)]: true,

      [utils.asGridCoord(20, 4)]: true,
      [utils.asGridCoord(20, 5)]: true,
      [utils.asGridCoord(20, 6)]: true,
      [utils.asGridCoord(19, 6)]: true,

      [utils.asGridCoord(21, 3)]: true,
      [utils.asGridCoord(22, 4)]: true,
      [utils.asGridCoord(23, 3)]: true,
      [utils.asGridCoord(24, 4)]: true,
      [utils.asGridCoord(25, 4)]: true,
      [utils.asGridCoord(27, 4)]: true,
      [utils.asGridCoord(26, 3)]: true,
      [utils.asGridCoord(28, 3)]: true,

      [utils.asGridCoord(29, 3)]: true,
      [utils.asGridCoord(29, 4)]: true,
      [utils.asGridCoord(29, 5)]: true,
      [utils.asGridCoord(29, 6)]: true,
      [utils.asGridCoord(29, 7)]: true,
      [utils.asGridCoord(30, 7)]: true,
      [utils.asGridCoord(31, 7)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(30, 9)]: [
        {
          events: [
            { type: "changeMap", map: "OutsideShack" },
          ]
        }
      ],
      [utils.asGridCoord(30, 10)]: [
        {
          events: [
            { type: "changeMap", map: "OutsideShack" },
          ]
        }
      ],
      [utils.asGridCoord(30, 11)]: [
        {
          events: [
            { type: "changeMap", map: "OutsideShack" },
          ]
        }
      ],
      [utils.asGridCoord(30, 12)]: [
        {
          events: [
            { type: "changeMap", map: "OutsideShack" },
          ]
        }
      ],
    }
  },
  Chest: {
    lowerSrc: "/images/maps/TeleportRoomLower.png",
    upperSrc: "/images/maps/TeleportRoomUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(16),
        y: utils.withGrid(15),
        // src: "/images/characters/stan.png"
      }),
      npc1: new Person({
        x: utils.withGrid(22),
        y: utils.withGrid(6),
        src: "/images/characters/ford.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Ngươi đã đi qua những người khác và giờ đây ngươi tìm đến ta. Cuộc hành trình này không chỉ là chiến đấu, mà còn là học cách ghi chép lại mọi thứ một cách tinh gọn.",
                faceHero: "npc1"
              },
              {
                type: "textMessage",
                text: "Tôi muốn biết đâu là điều quan trọng.",
              },
              {
                type: "textMessage",
                text: "Đúng vậy. Ngươi phải biết lọc bỏ những thứ không cần thiết.",
              },
              {
                type: "quizChoice",
                successMessage: "Ngươi đã biết cần phải làm gì rồi chứ. Hãy nhận phần thưởng và tiếp tục hành trình",
                question: "Ngươi có biết, trong một bản báo cáo Vunlerable Report, phần nào không cần thiết? Trả lời chính xác, và ta sẽ cho ngươi thấy con đường tiếp theo.",
                choices: [
                  { text: "Giới thiệu bản thân", answer_key: "level_5" },
                  { text: "Root cause", answer_key: "incorrect_1" },
                  { text: "Reproduce", answer_key: "incorrect_2" },
                  { text: "Recommend", answer_key: "incorrect_3" }
                ],
              },
            ]
          }
        ],
      }),
      item: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(11),
        talking: [
          {
            events: [
              { type: "textMessage", text: "You open the chest..." },
              { type: "showInventory" },
              { type: "textMessage", text: "You close the chest." },
            ]
          }
        ],
      }),
      item2: new Person({
        x: utils.withGrid(16),
        y: utils.withGrid(4),
        talking: [
          {
            events: [
              {
                type: "fetchAdminFlag",
                // Provide the message for non-admin users
                lockedMessage: "A strange energy blocks you from interacting with this object."
              },
            ]
          }
        ],
      }),
      item3: new Person({
        x: utils.withGrid(16),
        y: utils.withGrid(11),
        talking: [
          {
            events: [
              { type: "textMessage", text: "You open the chest..." },
              { type: "textMessage", text: "But nothing in there" },
            ]
          }
        ],
      }),
      item4: new Person({
        x: utils.withGrid(25),
        y: utils.withGrid(11),
        talking: [
          {
            events: [
              { type: "textMessage", text: "You open the chest..." },
              { type: "textMessage", text: "But nothing in there" },
            ]
          }
        ],
      }),
    },
    walls: {
      // "16,16": true
      [utils.asGridCoord(2, 17)]: true,
      [utils.asGridCoord(3, 17)]: true,
      [utils.asGridCoord(4, 17)]: true,
      [utils.asGridCoord(5, 17)]: true,
      [utils.asGridCoord(6, 17)]: true,
      [utils.asGridCoord(7, 17)]: true,
      [utils.asGridCoord(8, 17)]: true,
      [utils.asGridCoord(9, 17)]: true,
      [utils.asGridCoord(10, 17)]: true,
      [utils.asGridCoord(11, 17)]: true,
      [utils.asGridCoord(12, 17)]: true,
      [utils.asGridCoord(13, 17)]: true,
      [utils.asGridCoord(14, 17)]: true,
      [utils.asGridCoord(1, 15)]: true,
      [utils.asGridCoord(1, 16)]: true,

      [utils.asGridCoord(2, 10)]: true,
      [utils.asGridCoord(2, 11)]: true,
      [utils.asGridCoord(2, 12)]: true,
      [utils.asGridCoord(2, 13)]: true,
      [utils.asGridCoord(2, 14)]: true,
      [utils.asGridCoord(3, 10)]: true,
      [utils.asGridCoord(4, 10)]: true,
      [utils.asGridCoord(5, 10)]: true,
      [utils.asGridCoord(6, 10)]: true,
      [utils.asGridCoord(7, 10)]: true,
      [utils.asGridCoord(8, 10)]: true,

      [utils.asGridCoord(3, 14)]: true,
      [utils.asGridCoord(4, 14)]: true,

      [utils.asGridCoord(8, 11)]: true,
      [utils.asGridCoord(8, 12)]: true,
      [utils.asGridCoord(8, 13)]: true,
      [utils.asGridCoord(7, 14)]: true,
      [utils.asGridCoord(8, 14)]: true,



      [utils.asGridCoord(14, 14)]: true,
      [utils.asGridCoord(13, 10)]: true,
      [utils.asGridCoord(13, 11)]: true,
      [utils.asGridCoord(13, 12)]: true,
      [utils.asGridCoord(13, 13)]: true,
      [utils.asGridCoord(13, 14)]: true,

      [utils.asGridCoord(14, 10)]: true,
      [utils.asGridCoord(15, 10)]: true,
      [utils.asGridCoord(16, 10)]: true,
      [utils.asGridCoord(17, 10)]: true,
      [utils.asGridCoord(18, 10)]: true,
      [utils.asGridCoord(19, 10)]: true,
      [utils.asGridCoord(19, 11)]: true,
      [utils.asGridCoord(19, 12)]: true,
      [utils.asGridCoord(19, 13)]: true,
      [utils.asGridCoord(19, 14)]: true,
      [utils.asGridCoord(18, 14)]: true,
      [utils.asGridCoord(17, 14)]: true,

      [utils.asGridCoord(22, 10)]: true,
      [utils.asGridCoord(23, 10)]: true,
      [utils.asGridCoord(24, 10)]: true,
      [utils.asGridCoord(25, 10)]: true,
      [utils.asGridCoord(26, 10)]: true,
      [utils.asGridCoord(27, 10)]: true,
      [utils.asGridCoord(28, 10)]: true,

      [utils.asGridCoord(22, 11)]: true,
      [utils.asGridCoord(22, 12)]: true,
      [utils.asGridCoord(22, 13)]: true,

      [utils.asGridCoord(22, 14)]: true,
      [utils.asGridCoord(23, 14)]: true,
      [utils.asGridCoord(24, 14)]: true,

      [utils.asGridCoord(28, 11)]: true,
      [utils.asGridCoord(28, 12)]: true,
      [utils.asGridCoord(28, 13)]: true,
      [utils.asGridCoord(28, 14)]: true,
      [utils.asGridCoord(27, 14)]: true,

      [utils.asGridCoord(3, 13)]: true,
      [utils.asGridCoord(7, 13)]: true,
      [utils.asGridCoord(14, 13)]: true,
      [utils.asGridCoord(18, 13)]: true,
      [utils.asGridCoord(23, 13)]: true,
      [utils.asGridCoord(24, 13)]: true,
      [utils.asGridCoord(27, 13)]: true,

      [utils.asGridCoord(14, 7)]: true,
      [utils.asGridCoord(13, 3)]: true,
      [utils.asGridCoord(13, 4)]: true,
      [utils.asGridCoord(13, 5)]: true,
      [utils.asGridCoord(13, 6)]: true,
      [utils.asGridCoord(13, 7)]: true,

      [utils.asGridCoord(14, 3)]: true,
      [utils.asGridCoord(15, 3)]: true,
      [utils.asGridCoord(16, 3)]: true,
      [utils.asGridCoord(17, 3)]: true,
      [utils.asGridCoord(18, 3)]: true,

      [utils.asGridCoord(19, 4)]: true,
      [utils.asGridCoord(19, 5)]: true,
      [utils.asGridCoord(19, 6)]: true,
      [utils.asGridCoord(19, 7)]: true,

      [utils.asGridCoord(18, 17)]: true,
      [utils.asGridCoord(19, 17)]: true,
      [utils.asGridCoord(20, 17)]: true,
      [utils.asGridCoord(21, 17)]: true,
      [utils.asGridCoord(22, 17)]: true,
      [utils.asGridCoord(23, 17)]: true,
      [utils.asGridCoord(24, 17)]: true,
      [utils.asGridCoord(25, 17)]: true,
      [utils.asGridCoord(26, 17)]: true,
      [utils.asGridCoord(27, 17)]: true,
      [utils.asGridCoord(28, 17)]: true,
      [utils.asGridCoord(29, 17)]: true,

      [utils.asGridCoord(18, 7)]: true,
      [utils.asGridCoord(17, 7)]: true,

      [utils.asGridCoord(14, 6)]: true,
      [utils.asGridCoord(18, 6)]: true,

      [utils.asGridCoord(30, 3)]: true,
      [utils.asGridCoord(30, 4)]: true,
      [utils.asGridCoord(30, 5)]: true,
      [utils.asGridCoord(30, 6)]: true,
      [utils.asGridCoord(30, 7)]: true,
      [utils.asGridCoord(30, 8)]: true,
      [utils.asGridCoord(30, 9)]: true,
      [utils.asGridCoord(30, 10)]: true,
      [utils.asGridCoord(30, 11)]: true,
      [utils.asGridCoord(30, 12)]: true,
      [utils.asGridCoord(30, 13)]: true,
      [utils.asGridCoord(30, 14)]: true,
      [utils.asGridCoord(30, 15)]: true,
      [utils.asGridCoord(30, 16)]: true,

      [utils.asGridCoord(29, 3)]: true,

      [utils.asGridCoord(20, 4)]: true,
      [utils.asGridCoord(21, 4)]: true,
      [utils.asGridCoord(22, 4)]: true,
      [utils.asGridCoord(23, 4)]: true,
      [utils.asGridCoord(24, 4)]: true,
      [utils.asGridCoord(25, 4)]: true,
      [utils.asGridCoord(26, 4)]: true,
      [utils.asGridCoord(27, 4)]: true,
      [utils.asGridCoord(28, 4)]: true,

      [utils.asGridCoord(23, 9)]: true,
      [utils.asGridCoord(24, 9)]: true,

      [utils.asGridCoord(25, 8)]: true,
      [utils.asGridCoord(26, 8)]: true,
      [utils.asGridCoord(27, 8)]: true,
      [utils.asGridCoord(28, 8)]: true,
      [utils.asGridCoord(29, 8)]: true,
      [utils.asGridCoord(29, 9)]: true,
      [utils.asGridCoord(29, 10)]: true,

      [utils.asGridCoord(2, 9)]: true,
      [utils.asGridCoord(3, 9)]: true,
      [utils.asGridCoord(4, 9)]: true,
      [utils.asGridCoord(5, 9)]: true,
      [utils.asGridCoord(6, 9)]: true,
      [utils.asGridCoord(7, 9)]: true,
      [utils.asGridCoord(8, 9)]: true,
      [utils.asGridCoord(9, 9)]: true,

      [utils.asGridCoord(1, 3)]: true,
      [utils.asGridCoord(1, 4)]: true,
      [utils.asGridCoord(1, 5)]: true,
      [utils.asGridCoord(1, 6)]: true,
      [utils.asGridCoord(1, 7)]: true,
      [utils.asGridCoord(1, 8)]: true,

      [utils.asGridCoord(2, 3)]: true,
      [utils.asGridCoord(3, 3)]: true,
      [utils.asGridCoord(4, 3)]: true,
      [utils.asGridCoord(5, 3)]: true,
      [utils.asGridCoord(6, 3)]: true,
      [utils.asGridCoord(7, 3)]: true,
      [utils.asGridCoord(8, 3)]: true,
      [utils.asGridCoord(9, 3)]: true,
      [utils.asGridCoord(10, 3)]: true,
      [utils.asGridCoord(11, 3)]: true,
      [utils.asGridCoord(12, 3)]: true,

      [utils.asGridCoord(9, 6)]: true,
      [utils.asGridCoord(10, 6)]: true,
      [utils.asGridCoord(11, 6)]: true,
      [utils.asGridCoord(12, 6)]: true,

    },
    cutsceneSpaces: {
      [utils.asGridCoord(15, 17)]: [
        {
          events: [
            { type: "changeMap", map: "OutsideShack" },
          ]
        }
      ],
      [utils.asGridCoord(16, 17)]: [
        {
          events: [
            { type: "changeMap", map: "OutsideShack" },
          ]
        }
      ],
      [utils.asGridCoord(17, 17)]: [
        {
          events: [
            { type: "changeMap", map: "OutsideShack" },
          ]
        }
      ],
    }
  },
}
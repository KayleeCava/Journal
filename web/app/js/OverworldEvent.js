class OverworldEvent {
    constructor({ map, event }) {
        this.map = map;
        this.event = event;
    }

    stand(resolve) {
        const who = this.map.gameObjects[this.event.who];
        who.startBehavior({
            map: this.map,
        }, {
            type: "stand",
            direction: this.event.direction,
            time: this.event.time,
        });

        const completeHandler = (e) => {
            if (e.detail.whoId === this.event.who) {
                document.removeEventListener("PersonStandComplete", completeHandler);
                resolve();
            }
        };

        document.addEventListener("PersonStandComplete", completeHandler);
    }

    walk(resolve) {
        const who = this.map.gameObjects[this.event.who];
        who.startBehavior({
            map: this.map,
        }, {
            type: "walk",
            direction: this.event.direction,
            retry: true,
        })
        const completeHandler = e => {
            if (e.detail.whoId === this.event.who) {
                document.removeEventListener("PersonWalkingComplete", completeHandler)
                resolve();
            }
        }
        document.addEventListener("PersonWalkingComplete", completeHandler)
    }

    textMessage(resolve) {
        if (this.event.faceHero) {
            const obj = this.map.gameObjects[this.event.faceHero];
            obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
        }

        const message = new TextMessage({
            text: this.event.text,
            onComplete: () => resolve(),
            onCancel: () => {
                // Cancel the entire cutscene sequence
                this.map.cancelCutscene();
                resolve(); // Resolve to prevent hanging promises
            }
        });
        message.init(document.querySelector(".game-container"));
    }

    quizChoice(resolve) {
        const quizKeyToIdMap = {
            "level_1": 2, "level_2": 3, "level_3": 4, "level_4": 5, "level_5": 6,
        };

        const correctChoice = this.event.choices.find(c => c.answer_key.startsWith("level_"));

        if (correctChoice) {
            const correctKey = correctChoice.answer_key;
            const quizId = quizKeyToIdMap[correctKey];
            const playerInfo = this.map.overworld.playerInfo;

            if (playerInfo && playerInfo.answer_keys && playerInfo.answer_keys.includes(quizId)) {
                resolve();
                return;
            }
        }

        if (this.event.faceHero) {
            const obj = this.map.gameObjects[this.event.faceHero];
            obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
        }

        const quiz = new QuizChoice({
            question: this.event.question,
            choices: this.event.choices,
            overworld: this.map.overworld,
            successMessage: this.event.successMessage,
            onChoice: async (data) => {
                if (data.result && data.result.message) {
                    await new Promise(res => {
                        const message = new TextMessage({
                            text: data.result.message,
                            onComplete: () => res()
                        });
                        message.init(document.querySelector(".game-container"));
                    });
                }

                const followUpEvents = [];
                const onAnswerEvents = this.event.onAnswerEvents;
                if (onAnswerEvents) {
                    if (data.result.correct && onAnswerEvents.correct) {
                        followUpEvents.push(...onAnswerEvents.correct);
                    } else if (!data.result.correct && onAnswerEvents.incorrect) {
                        followUpEvents.push(...onAnswerEvents.incorrect);
                    }
                }

                if (followUpEvents.length > 0) {
                    await this.map.startCutscene(followUpEvents);
                }
                resolve();
            },
            onCancel: () => {
                this.map.cancelCutscene();
                resolve();
            }
        });

        quiz.init(document.querySelector(".game-container"));
    }

    changeMap(resolve) {
        const isAdminRequired = this.event.isAdmin === true;

        // if (isAdminRequired) {

        //     if (this.map.overworld.playerInfo.role !== "admin") {

        //         const message = new TextMessage({
        //             text: "You are not admin go away!!!",
        //             onComplete: () => {
        //                 resolve(); 
        //             }
        //         });
        //         message.init(document.querySelector(".game-container"));

        //         return; 
        //     }


        // }

        if (isAdminRequired) {
            let userIsAdmin = false;
            const userString = localStorage.getItem("user");

            if (userString) {
                try {
                    const localUser = JSON.parse(userString);
                    if (localUser && localUser.role === "admin") {
                        userIsAdmin = true;
                    }
                } catch (e) {
                    // console.error("CTF check: Could not parse user from localStorage.", e);
                    userIsAdmin = false;
                }
            }

            if (!userIsAdmin) {
                const message = new TextMessage({
                    text: "You are not admin go away!!!",
                    onComplete: () => {
                        resolve();
                    }
                });
                message.init(document.querySelector(".game-container"));
                return;
            }
        }

        const sceneTransition = new SceneTransition();
        sceneTransition.init(document.querySelector(".game-container"), () => {

            const mapId = this.event.map;
            this.map.overworld.startMap(window.OverworldMaps[mapId], mapId);

            resolve();

            sceneTransition.fadeOut();
        })
    }

    showInventory(resolve) {
        const inventory = new Inventory({
            overworld: this.map.overworld,
            onComplete: () => {
                resolve();
            }
        });
        inventory.init(document.querySelector(".game-container"));
    }
    
    async fetchAdminFlag(resolve) {
      if (this.map.overworld.playerInfo.role === "admin") {
        const token = this.map.overworld.token;
        
        try {
          const response = await API_SERVICE.getFlag();

          const flag = response.data.flag;

          await new Promise(res => {
            const message = new TextMessage({
              text: flag, 
              onComplete: () => res()
            });
            message.init(document.querySelector(".game-container"));
          });

        } catch (error) {
          console.error("Failed to fetch admin flag:", error);
          await new Promise(res => {
            const message = new TextMessage({
              text: "There was an error retrieving the secret message.",
              onComplete: () => res()
            });
            message.init(document.querySelector(".game-container"));
          });
        }

      } else {
        await new Promise(res => {
          const message = new TextMessage({
            text: this.event.lockedMessage || "There is nothing of interest here.",
            onComplete: () => res()
          });
          message.init(document.querySelector(".game-container"));
        });
      }

      resolve();
    }
    
    pause(resolve) {
        this.map.isPaused = true;
        const menu = new PauseMenu({
            overworld: this.map.overworld,
            onComplete: () => {
                resolve();
                this.map.isPaused = false;
                this.map.overworld.startGameLoop();
            }
        });
        menu.init(document.querySelector(".game-container"));
    }

    init() {
        return new Promise(resolve => {
            this[this.event.type](resolve);
        })
    }
}
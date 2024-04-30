// Smoothed horizontal controls helper. This gives us a value between -1 and 1 depending on how long
// the player has been pressing left or right, respectively.
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';



class SmoothedHorionztalControl {
    constructor(speed) {
        this.msSpeed = speed;
        this.value = 0;
    }

    moveLeft(delta) {
        if (this.value > 0) { this.reset(); }
        this.value -= this.msSpeed * delta;
        if (this.value < -1) { this.value = -1; }
    }

    moveRight(delta) {
        if (this.value < 0) { this.reset(); }
        this.value += this.msSpeed * delta;
        if (this.value > 1) { this.value = 1; }
    }

    reset() {
        this.value = 0;
    }
}

export class matterForet extends Scene
{
    playerController;
    cursors;
    text;
    cam;
    smoothedControls;
    
    constructor() {
        super('matterForet');
    }

    preload ()
    {
        this.load.tilemapTiledJSON('map2', 'public/assets/matter-foret.json');
        this.load.image('kenney_redux_64x64', 'public/assets/kenney_redux_64x64.png');
        this.load.spritesheet('player', 'public/assets/dude-cropped.png', { frameWidth: 32, frameHeight: 42 });
    }

    create ()
    {
        const map2 = this.make.tilemap({ key: 'map2' });
        const tileset = map2.addTilesetImage('kenney_redux_64x64');
        const layer = map2.createLayer(0, tileset, 0, 0);

        // Set up the layer to have matter bodies. Any colliding tiles will be given a Matter body.
        map2.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(layer);

        this.matter.world.setBounds(map2.widthInPixels, map2.heightInPixels);
        this.matter.world.createDebugGraphic();
        this.matter.world.drawDebug = false;

        this.cursors = this.input.keyboard.createCursorKeys();
        this.smoothedControls = new SmoothedHorionztalControl(0.0005);

        // The player is a collection of bodies and sensors
        this.playerController = {
            matterSprite: this.matter.add.sprite(0, 0, 'player', 4),
            blocked: {
                left: false,
                right: false,
                bottom: false
            },
            numTouching: {
                left: 0,
                right: 0,
                bottom: 0
            },
            sensors: {
                bottom: null,
                left: null,
                right: null
            },
            time: {
                leftDown: 0,
                rightDown: 0
            },
            lastJumpedAt: 0,
            isDashing: false, // Indique si le joueur est en train de dasher
            dashSpeed: 20,    // La vitesse de dash
            dashDuration: 250, // Durée du dash en millisecondes
            dashTime: 0,      // Quand le dash a été initié pour contrôler la durée
            canAirDash: true,
            speed: {
                run: 4,
                jump: 9
            }
        };


        // ======================== //
        // Dah MODS //
        // ======================== //

        // Configuration de la touche Q pour le dash
        this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        // Ajout d'un état de dash dans le contrôleur du joueur
        this.playerController.isDashing = false;
        this.playerController.dashSpeed = 20; // Vitesse de dash
        this.playerController.dashDuration = 250; // Durée du dash en millisecondes
        this.playerController.dashTime = 0; // Contrôle du timing du dash


        
        // other //
        
        const M = Phaser.Physics.Matter.Matter;
        const w = this.playerController.matterSprite.width;
        const h = this.playerController.matterSprite.height;

        // The player's body is going to be a compound body:
        //  - playerBody is the solid body that will physically interact with the world. It has a
        //    chamfer (rounded edges) to avoid the problem of ghost vertices: http://www.iforce2d.net/b2dtut/ghost-vertices
        //  - Left/right/bottom sensors that will not interact physically but will allow us to check if
        //    the player is standing on solid ground or pushed up against a solid object.

        // Move the sensor to player center
        const sx = w / 2;
        const sy = h / 2;

        // The player's body is going to be a compound body.
        const playerBody = M.Bodies.rectangle(sx, sy, w * 0.75, h, { chamfer: { radius: 10 } });
        this.playerController.sensors.bottom = M.Bodies.rectangle(sx, h, sx, 5, { isSensor: true });
        this.playerController.sensors.left = M.Bodies.rectangle(sx - w * 0.45, sy, 5, h * 0.25, { isSensor: true });
        this.playerController.sensors.right = M.Bodies.rectangle(sx + w * 0.45, sy, 5, h * 0.25, { isSensor: true });
        const compoundBody = M.Body.create({
            parts: [
                playerBody, this.playerController.sensors.bottom, this.playerController.sensors.left,
                this.playerController.sensors.right
            ],
            friction: 0.01,
            restitution: 0.05 // Prevent body from sticking against a wall
        });

        this.playerController.matterSprite
            .setExistingBody(compoundBody)
            .setFixedRotation() // Sets max inertia to prevent rotation
            .setPosition(630, 1000);


        this.cam = this.cameras.main;
        this.cam.setBounds(0, 0, map2.widthInPixels, map2.heightInPixels);
        this.smoothMoveCameraTowards(this.playerController.matterSprite);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 4 }),
            frameRate: 10,
            repeat: -1
        });

        // Use matter events to detect whether the player is touching a surface to the left, right or
        // bottom.

        // Before matter's update, reset the player's count of what surfaces it is touching.
        this.matter.world.on('beforeupdate', function (event) {
            this.playerController.numTouching.left = 0;
            this.playerController.numTouching.right = 0;
            this.playerController.numTouching.bottom = 0;
        }, this);

        // Loop over the active colliding pairs and count the surfaces the player is touching.
        this.matter.world.on('collisionactive', function (event)
        {
            const playerBody = this.playerController.body;
            const left = this.playerController.sensors.left;
            const right = this.playerController.sensors.right;
            const bottom = this.playerController.sensors.bottom;

            for (let i = 0; i < event.pairs.length; i++)
            {
                const bodyA = event.pairs[i].bodyA;
                const bodyB = event.pairs[i].bodyB;

                if (bodyA === playerBody || bodyB === playerBody)
                {
                    continue;
                }
                else if (bodyA === bottom || bodyB === bottom)
                {
                    // Standing on any surface counts (e.g. jumping off of a non-static crate).
                    this.playerController.numTouching.bottom += 1;
                }
                else if ((bodyA === left && bodyB.isStatic) || (bodyB === left && bodyA.isStatic))
                {
                    // Only static objects count since we don't want to be blocked by an object that we
                    // can push around.
                    this.playerController.numTouching.left += 1;
                }
                else if ((bodyA === right && bodyB.isStatic) || (bodyB === right && bodyA.isStatic))
                {
                    this.playerController.numTouching.right += 1;
                }
            }
        }, this);

        // Update over, so now we can determine if any direction is blocked
        this.matter.world.on('afterupdate', function (event) {
            this.playerController.blocked.right = this.playerController.numTouching.right > 0 ? true : false;
            this.playerController.blocked.left = this.playerController.numTouching.left > 0 ? true : false;
            this.playerController.blocked.bottom = this.playerController.numTouching.bottom > 0 ? true : false;
        }, this);

        this.input.on('pointerdown', function () {
            this.matter.world.drawDebug = !this.matter.world.drawDebug;
            this.matter.world.debugGraphic.visible = this.matter.world.drawDebug;
        }, this);

        this.text = this.add.text(16, 16, '', {
            fontSize: '20px',
            padding: { x: 20, y: 10 },
            backgroundColor: '#ffffff',
            fill: '#000000'
        });
        this.text.setScrollFactor(0);
        this.updateText();

        EventBus.emit('current-scene-ready', this);
    }

    update (time, delta)
    {
        const matterSprite = this.playerController.matterSprite;

        // Horizontal movement
        let oldVelocityX;
        let targetVelocityX;
        let newVelocityX;

        if (this.cursors.left.isDown && !this.playerController.blocked.left)
        {
            this.smoothedControls.moveLeft(delta);
            matterSprite.anims.play('left', true);

            // Lerp the velocity towards the max run using the smoothed controls. This simulates a
            // player controlled acceleration.
            oldVelocityX = matterSprite.body.velocity.x;
            targetVelocityX = -this.playerController.speed.run;
            newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, -this.smoothedControls.value);

            matterSprite.setVelocityX(newVelocityX);
        }
        else if (this.cursors.right.isDown && !this.playerController.blocked.right)
        {
            this.smoothedControls.moveRight(delta);
            matterSprite.anims.play('right', true);

            // Lerp the velocity towards the max run using the smoothed controls. This simulates a
            // player controlled acceleration.
            oldVelocityX = matterSprite.body.velocity.x;
            targetVelocityX = this.playerController.speed.run;
            newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, this.smoothedControls.value);

            matterSprite.setVelocityX(newVelocityX);
        }
        else
        {
            this.smoothedControls.reset();
            matterSprite.anims.play('idle', true);
        }

        // Jumping & wall jumping

        // Add a slight delay between jumps since the sensors will still collide for a few frames after
        // a jump is initiated
        const canJump = (time - this.playerController.lastJumpedAt) > 250;
        if (this.cursors.up.isDown & canJump)
        {
            if (this.playerController.blocked.bottom)
            {
                matterSprite.setVelocityY(-this.playerController.speed.jump);
                this.playerController.lastJumpedAt = time;
            }
            else if (this.playerController.blocked.left)
            {
                // Jump up and away from the wall
                matterSprite.setVelocityY(-this.playerController.speed.jump);
                matterSprite.setVelocityX(this.playerController.speed.run);
                this.playerController.lastJumpedAt = time;
            }
            else if (this.playerController.blocked.right)
            {
                // Jump up and away from the wall
                matterSprite.setVelocityY(-this.playerController.speed.jump);
                matterSprite.setVelocityX(-this.playerController.speed.run);
                this.playerController.lastJumpedAt = time;
            }
        }

        this.smoothMoveCameraTowards(matterSprite, 0.9);
        this.updateText();
    
        // Gestion du dash
        if (this.keyQ.isDown && !this.playerController.isDashing) {
            // Démarrer le dash
            this.startDash(time);
        }

        // Arrêter le dash après la durée spécifiée
        if (time > this.playerController.dashTime && this.playerController.isDashing) {
            // Arrêter le dash
            this.stopDash();
        }
    
         // Gestion du dash
        if (this.keyQ.isDown && !this.playerController.isDashing) {
            this.playerController.isDashing = true;
            this.playerController.dashTime = time + this.playerController.dashDuration;

            // Obtenez la direction du dash basée sur les touches de direction enfoncées
            const dashX = this.cursors.left.isDown ? -1 : this.cursors.right.isDown ? 1 : 0;
            const dashY = this.cursors.up.isDown ? -1 : this.cursors.down.isDown ? 1 : 0;

            // Appliquer la vélocité de dash
            this.playerController.matterSprite.setVelocity(
                dashX * this.playerController.dashSpeed,
                dashY * this.playerController.dashSpeed
            );
        }

        // Terminer le dash après la durée spécifiée
        if (time > this.playerController.dashTime && this.playerController.isDashing) {
            this.playerController.isDashing = false;
            // Ralentir le joueur ou arrêter le dash ici si nécessaire
        }
        const onGround = this.playerController.blocked.bottom;
        const canDash = this.keyQ.isDown && (!this.playerController.isDashing && (onGround || (!onGround && this.playerController.canAirDash)));

        if (canDash) {
            this.startDash(time);
            if (!onGround) {
                this.playerController.canAirDash = false; // Désactive le air dash après l'utilisation
            }
        }

        if (onGround && !this.cursors.up.isDown) {
            this.playerController.canAirDash = true; // Réinitialiser la capacité de air dash lorsque le joueur touche le sol
        }

    }

    startDash(currentTime) {
        this.playerController.isDashing = true;
        this.playerController.dashTime = currentTime + this.playerController.dashDuration;
        
        // Déterminez la direction du dash en fonction des touches de direction enfoncées
        const dashX = this.cursors.left.isDown ? -1 : this.cursors.right.isDown ? 1 : 0;
        const dashY = this.cursors.up.isDown ? -1 : this.cursors.down.isDown ? 1 : 0;
    
        // Appliquez la vitesse de dash
        this.playerController.matterSprite.setVelocity(
            dashX * this.playerController.dashSpeed,
            dashY * this.playerController.dashSpeed
        );
    }

    stopDash() {
        this.playerController.isDashing = false;
        // Optionnel : remettre la vélocité du joueur à une vitesse normale si nécessaire
    }

    updateText ()
    {
        this.text.setText([
            'LA FORET'
        ]);
    }

    smoothMoveCameraTowards (target, smoothFactor)
    {
        if (smoothFactor === undefined) { smoothFactor = 0; }
        this.cam.scrollX = smoothFactor * this.cam.scrollX + (1 - smoothFactor) * (target.x - this.cam.width * 0.5);
        this.cam.scrollY = smoothFactor * this.cam.scrollY + (1 - smoothFactor) * (target.y - this.cam.height * 0.5);
    }

    changeScene ()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start('Game');
    }
}


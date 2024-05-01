import SmoothedHorionztalControl from '../mecha/SmoothedHorionztalControl.js';
import Player from '../mecha/Player.js';

import { EventBus } from '../EventBus';
import { Scene } from 'phaser';


export class Example extends Scene{

    playerController;
    cursors;
    text;
    cam;
    smoothedControls;
    map;

    constructor() {
        super('Example');
    }

    preload ()
    {
        this.load.tilemapTiledJSON('map', 'public/assets/matter-platformer.json');
        this.load.image('kenney_redux_64x64', 'public/assets/kenney_redux_64x64.png');
        this.load.spritesheet('player', 'public/assets/dude-cropped.png', { frameWidth: 32, frameHeight: 42 });
        this.load.image('box', 'public/assets/box-item-boxed.png');
    }

    create (){

        // ========== ON SET LA MAP ========== //

        this.mapManager();

        //Spawn
        const spawnLayer = this.map.getObjectLayer('Spawn');
        const Spawn = spawnLayer.objects.find(obj => obj.name === 'Spawn');
        

        // ======== AFFICHAGE DES BUG ======== //

        this.matter.world.setBounds(this.map.widthInPixels, this.map.heightInPixels);
        this.matter.world.createDebugGraphic();
        this.matter.world.drawDebug = false;

        // ======== ECOUTE DES TOUCHE ======== //

        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.smoothedControls = new SmoothedHorionztalControl(0.0005);
        this.playerController = new Player(this, Spawn.x, Spawn.y, 'player');


        console.log("SPAWN",Spawn.x,Spawn.y)

        // ======== Dah MODS ================//

        // Configuration de la touche Q pour le dash
        this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        // Ajout d'un état de dash dans le contrôleur du joueur
        this.playerController.isDashing = false;
        this.playerController.dashSpeed = 20; // Vitesse de dash
        this.playerController.dashDuration = 250; // Durée du dash en millisecondes
        this.playerController.dashTime = 0; // Contrôle du timing du dash


        this.cam = this.cameras.main;
        this.cam.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.smoothMoveCameraTowards(this.playerController.matterSprite);



        // Before matter's update, reset the player's count of what surfaces it is touching.
        this.matter.world.on('beforeupdate', function (event) {
            this.playerController.numTouching.left = 0;
            this.playerController.numTouching.right = 0;
            this.playerController.numTouching.bottom = 0;
        }, this);

        // Loop over the active colliding pairs and count the surfaces the player is touching.
        this.matter.world.on('collisionactive', function (event)
        {
            const playerBody = this.body;
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

                //NEW
                if ((bodyA === right && bodyB.isSensor) || (bodyB === right && bodyA.isSensor)) {
                    // Lorsque le joueur entre en collision avec l'objet "Jungle"
                    console.log("JUNGLE")
                    
                    this.changeScene();
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

    update (time, delta){

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

        // ===============================//
        // === Jumping & wall jumping === //
        // ===============================// 
        
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
            'La premier map d une legende'
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

        this.scene.start('matterForet');
    }

    showDialogueBox(text) {
        // Créez ou mettez à jour le texte ici
        if (!this.dialogueBox) {
            this.dialogueBox = this.add.text(npcClaude.x, npcClaude.y - 50, text, { font: '18px Arial', fill: '#ffffff', backgroundColor: '#000000' });
        } else {
            this.dialogueBox.setText(text);
            this.dialogueBox.setVisible(true);
        }
    }

    mapManager(){
        
        this.map = this.make.tilemap({ key: 'map' });
        const tileset = this.map.addTilesetImage('kenney_redux_64x64');

         this.map.layers.forEach((layer) => {

            const createdLayer = this.map.createLayer(layer.name, tileset, 0, 0);
            this.map.setCollisionByProperty({ collides: true });
            this.matter.world.convertTilemapLayer(createdLayer);

        });


        // =================================== //
        // ==========   Collision   ========== //
        // =================================== //

        
        const collisionLayer = this.map.getObjectLayer('ExitMap')['objects'];

        collisionLayer.forEach(object => {
            if (object.name === 'ExitMap') {
                console.log("in the if ExitMap")
                const jungleSensor = this.matter.add.rectangle(object.x + object.width / 2, object.y + object.height / 2, object.width, object.height, {collides: true, isSensor: true });
                jungleSensor.label = 'ExitMap';
            }
        });
        

        //collision des sortie
        const objectLayer = this.map.getObjectLayer('ExitMap').objects;
        objectLayer.forEach(obj => {
            const { x, y, width, height, properties } = obj;
            const objectBody = this.matter.add.rectangle(x + width / 2, y + height / 2, width, height, {
                isSensor: true,  // Faites en sorte que l'objet ne cause pas de collision physique mais déclenche des événements
                label: 'ExitMap',  // Utiliser une étiquette générique pour tous les objets de sortie
                isStatic:true
            });
            objectBody.uniqueID = properties.find(p => p.name === 3);  // Supposons que chaque objet a une propriété 'uniqueID'
        });

    }

}


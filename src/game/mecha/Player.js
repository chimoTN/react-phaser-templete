export default class Player {
    text;

    constructor(scene, x, y, spriteKey) {
        this.scene = scene;
        this.matterSprite = scene.matter.add.sprite(x, y, spriteKey, 4);
        this.blocked = {
            left: false,
            right: false,
            bottom: false
        };
        this.numTouching = {
            left: 0,
            right: 0,
            bottom: 0
        };
        this.sensors = {
            bottom: null,
            left: null,
            right: null
        };
        this.time = {
            leftDown: 0,
            rightDown: 0
        };
        
        this.lastJumpedAt = 0;
        this.lastJumpedAt = 0,
        this.isDashing = false, // Indique si le joueur est en train de dasher
        this.dashSpeed = 20,    // La vitesse de dash
        this.dashDuration = 250, // Durée du dash en millisecondes
        this.dashTime = 0,      // Quand le dash a été initié pour contrôler la durée
        this.canAirDash = true,
        this.speed = {
            run: 1.5,
            jump: 5
        };
        this.stats = {
            pv:20,
            domage:3,
            defance:1,
            experience:0,
        }
        this.setupAnimations();
        this.setupSensors(x,y);
        this.setupStats(this.scene);
    }


    setupSensors(x,y) {
        const { Matter } = Phaser.Physics;
        const { width: w, height: h } = this.matterSprite;

        const M = Phaser.Physics.Matter.Matter;

        // Move the sensor to player center
        const sx = w / 2;
        const sy = h / 2;

        // The player's body is going to be a compound body.
        const playerBody = M.Bodies.rectangle(sx, sy, w * 0.75, h, { chamfer: { radius: 10 } });
        this.sensors.bottom = M.Bodies.rectangle(sx, h, sx, 5, { isSensor: true });
        this.sensors.left = M.Bodies.rectangle(sx - w * 0.45, sy, 5, h * 0.25, { isSensor: true });
        this.sensors.right = M.Bodies.rectangle(sx + w * 0.45, sy, 5, h * 0.25, { isSensor: true });
        this.sensors.top = M.Bodies.rectangle(sx, 0, sx, 5, { isSensor: true });

        const compoundBody = M.Body.create({
            parts: [
                playerBody, 
                this.sensors.bottom, 
                this.sensors.left,
                this.sensors.right,
                this.sensors.top
            ],
            friction: 0.01,
            restitution: 0.05
        });

        this.matterSprite
            .setExistingBody(compoundBody)
            .setFixedRotation()
            .setPosition(x, y);

    }

    setupAnimations() {
        this.scene.anims.create({
            key: 'left',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'right',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'midle',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 4, end: 4 }),
            frameRate: 10,
            repeat: -1
        });

    }

    setupStats(scene) {
        this.text = scene.add.text(800, 10, '', {
            fontSize: '20px',
            padding: { x: 10, y: 10 },
            backgroundColor: '#ffffff',
            fill: '#000000'
        });
        this.text.setScrollFactor(0);
    
        this.text.setText([
            'PV: ' + this.stats.pv,
            'Experience: ' + this.stats.experience
        ]);
    };

}

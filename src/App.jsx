import { useRef, useState } from 'react';

import Phaser from 'phaser';
import { PhaserGame } from './game/PhaserGame';

const App = () => {

    // The sprite can only be moved in the MainMenu Scene
    const [canMoveSprite, setCanMoveSprite] = useState(true);
    
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef();
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });

    const changeScene = () => {

        const scene = phaserRef.current.scene;

        if (scene)
        {
            scene.changeScene();
        }
    }

    const moveSprite = () => {

        const scene = phaserRef.current.scene;

        if (scene && scene.scene.key === 'MainMenu')
        {
            // Get the update logo position
            scene.moveLogo(({ x, y }) => {

                setSpritePosition({ x, y });

            });
        }
    }

    const addSprite = () => {

        const scene = phaserRef.current.scene;

        if (scene)
        {
            // Add more stars
            const x = Phaser.Math.Between(64, scene.scale.width - 64);
            const y = Phaser.Math.Between(64, scene.scale.height - 64);

            //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
            const star = scene.add.sprite(x, y, 'star');

            //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
            //  You could, of course, do this from within the Phaser Scene code, but this is just an example
            //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
            scene.add.tween({
                targets: star,
                duration: 500 + Math.random() * 1000,
                alpha: 0,
                yoyo: true,
                repeat: -1
            });
        }
    }


    const addMobs = () => {

        const scene = phaserRef.current.scene;

        if (scene)
        {

            const x = Phaser.Math.Between(0, scene.scale.width); 
            const y = Phaser.Math.Between(0, scene.scale.height);

            //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
            const star = scene.add.sprite(x, y, 'mob');


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
            const compoundBody = M.Body.create({
                parts: [
                    playerBody, this.sensors.bottom, this.sensors.left,
                    this.sensors.right
                ],
                friction: 0.01,
                restitution: 0.05 // Prevent body from sticking against a wall
            });
    
            star
                .setExistingBody(compoundBody)
                .setFixedRotation() // Sets max inertia to prevent rotation
                .setPosition(x, y);


            



                // Activer la physique de la scène
                scene.physics.world.enable(star);
        
                // Définir les propriétés physiques du mob
                star.setCollideWorldBounds(true); // Permet au mob de rebondir sur les bords de la carte
                star.setVelocityX(Phaser.Math.Between(-200, 200)); // Définit une vitesse horizontale aléatoire pour le mob
        
                // Ajouter une collision entre le mob et le monde
                scene.physics.add.collider(star, scene.physics.world.bounds);
        
                // Créer une animation pour le mob (facultatif)
                scene.anims.create({
                    key: 'walk', // Nom de l'animation
                    frames: scene.anims.generateFrameNumbers('star', { start: 0, end: 3 }), // Frames de l'animation
                    frameRate: 10, // Vitesse de l'animation
                    repeat: -1 // Répétition infinie de l'animation
                });
        
                // Jouer l'animation du mob
                mob.anims.play('walk', true);





        }
    }


    // Event emitted from the PhaserGame component
    const currentScene = (scene) => {

        setCanMoveSprite(scene.scene.key !== 'MainMenu');
        
    }

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />

            <div>
                <div>
                    <button className="button" onClick={changeScene}>Change Scene</button>
                </div>
                
                <div>
                    <button disabled={canMoveSprite} className="button" onClick={moveSprite}>Toggle Movement</button>
                </div>
                
                <div className="spritePosition">Sprite Position:
                    <pre>{`{\n  x: ${spritePosition.x}\n  y: ${spritePosition.y}\n}`}</pre>
                </div>

                <div>
                    <button className="button" onClick={addSprite}>Add New Sprite</button>
                </div>

                <div>
                    <button className="button" onClick={addMobs}> Add New Mobs </button>
                </div>
            </div>
        </div>
    )
}

export default App

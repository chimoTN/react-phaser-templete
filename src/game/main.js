import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import Phaser from 'phaser';
import { Preloader } from './scenes/Preloader';
import { Example } from './scenes/Exemple';
import { matterForet } from './scenes/matterForet';
import { Menu } from './scenes/Menu'
import { Niveau1 } from './scenes/Niveau1';

// Find out more information about the Game Config at:
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig

const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1 },
            enableSleep: false,
            debug: true
        }
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Game,
        GameOver,
        Example,
        matterForet,
        Menu,
        Niveau1,
    ]
};

const StartGame = (parent) => {

    return new Phaser.Game({ ...config, parent });

}

export default StartGame;

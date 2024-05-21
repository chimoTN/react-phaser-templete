import SmoothedHorionztalControl from '../mecha/SmoothedHorionztalControl.js';
import Player from '../mecha/Player.js';

import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Menu extends Scene{
  
  constructor() {
    super("Menu");
  }

  preload() {
    //this.load.audio("son_menu", "src/assets/sons/menu.mp3");
    //this.load.image("menu_fond", "src/assets/images/background.png");
    this.add.image(512, 384, 'background');
    this.logo = this.add.image(512, 300, 'logo').setDepth(100);

    this.add.text(512, 460, 'Main Menu', {
        fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
        stroke: '#000000', strokeThickness: 8,
        align: 'center'
    }).setDepth(100).setOrigin(0.5);

    this.load.image("imageBoutonPlay", "public/assets/play.png");
    this.load.image("imageBoutonPlayI", "public/assets/playI.png");
  }

  create() {
    //this.sonMenu = this.sound.add("son_menu");
    //this.sonMenu.play();
    //this.add.image(0, 0, "menu_fond").setOrigin(0).setDepth(0);

    //mise en place bouton
    var bouton_play = this.add.image(500, 600, "imageBoutonPlay").setDepth(1);

    bouton_play.setInteractive();

    //clic bouton
    bouton_play.on("pointerup", () => {
      this.changeScene();
      //this.sonMenu.stop();
    });

    //mouse hover
    bouton_play.on("pointerover", () => {
      var bouton_play = this.add
        .image(500, 600, "imageBoutonPlayI")
        .setDepth(1);
    });

    bouton_play.on("pointerout", () => {
      var bouton_play = this.add.image(500, 600, "imageBoutonPlay").setDepth(1);
    });

    EventBus.emit('current-scene-ready', this);

  }

  changeScene ()
  {
      if (this.logoTween)
      {
          this.logoTween.stop();
          this.logoTween = null;
      }

      this.scene.start('Niveau1');
  }
}

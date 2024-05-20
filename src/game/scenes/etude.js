import Phaser from "phaser";

//variables globales
var calque_plateformes;
var sonMenu;
var gameOver = false;
var gameOverImage;
var musique_de_fond;
var caisse;
var caisse2;
var caisse3;
var caisse4;
var bouton_restart;
var bouton_pause;
var bouton_play;
var player;
var clavier;
var tutorielImage;
var groupeEau;
var groupeNourriture;
var groupeSoin;
var groupeClé;
var groupeSac;
var groupeBouton;
var groupeZomblar;;
var healthBar = 10;
var healthBarImage1;
var healthBarImage2;
var healthBarZombie = 9;
var plateforme_mobile;
var tween_mouvement;
var tween_zomblar;
var inventaireClé;
var inventaireSac;
var bouton_pause_play;
var boutonFeu;
var groupeBullets;

var elements_traversables;

export default class niveau1 extends Phaser.Scene {

  constructor() {
    super({ key: "niveau1" });
  }

  tutoriel(a, b, image, boolendejavu) {
    calque_plateformes.setTileLocationCallback(
      a,
      b,
      3,
      1,
      function () {
        if (boolendejavu == true) {
          boolendejavu = false;
          tutorielImage = this.add.image(400, 550, image);
          tutorielImage.setScrollFactor(0);
          var timer = this.time.delayedCall(
            1500,
            function () {
              tutorielImage.visible = false;
            },
            null,
            this
          );
        }
      },
      this
    );
  }

  preload() {
    //Preload MAP & tileset :
    this.load.tilemapTiledJSON("carte", "src/assets/level-1.tmj");
    this.load.tilemapTiledJSON("carte2", "src/assets/level-2.tmj");
    this.load.image("Phaser_tuilesdejeu", "src/assets/images/tileset.png");
    this.load.image("Phaser_tuilesdejeu2", "src/assets/images/mapp1.png");
    this.load.image("Phaser_tuilesdejeu4", "src/assets/images/mapp2.png");
    this.load.image("Phaser_tuilesdejeu3", "src/assets/images/tileset2.png");
    this.load.image("Phaser_tuilesdejeu5", "src/assets/images/tunnel1.png");
    this.load.image("Phaser_tuilesdejeu6", "src/assets/images/tunnel2.png");
    this.load.image("plateform", "src/assets/images/plateforme-lvl1.png");

    //Preload Interface Menu :
    this.load.image("restart", "src/assets/images/restart.png");
    this.load.image("play", "src/assets/images/reprendre.png");
    this.load.image("pause", "src/assets/images/pause.png");
    this.load.image("restartI", "src/assets/images/restartI.png");
    this.load.image("playI", "src/assets/images/reprendreI.png");
    this.load.image("pauseI", "src/assets/images/pauseI.png");
    this.load.image("gameover", "src/assets/images/gameover.png");
    this.load.image("health1", "src/assets/images/vie2.png");
    this.load.image("health2", "src/assets/images/vie.png");

    //Preload tutoriel
    this.load.image("deplacer", "src/assets/images/deplacer.png");
    this.load.image("sauter", "src/assets/images/sauter.png");
    this.load.image("interagir", "src/assets/images/interagir.png");
    this.load.image("serrure", "src/assets/images/serrure.png");
    this.load.image("lacher", "src/assets/images/lacher.png");
    this.load.image("tirer", "src/assets/images/tirer.png");

    // Preload objets interactifs
    this.load.image("caisse", "src/assets/images/caisse.png");
    this.load.image("caisse2", "src/assets/images/caisse2.png");
    this.load.image("caisse3", "src/assets/images/caisse3.png");
    this.load.spritesheet("bouton", "src/assets/images/buzzer.png", {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet("bouton2", "src/assets/images/buzzerV.png", {
      frameWidth: 32,
      frameHeight: 32
    });
    
    //Preload Collectables :
    this.load.spritesheet("eau", "src/assets/images/eau.png", {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet("nourriture", "src/assets/images/nourriture.png", {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet("soin", "src/assets/images/soin.png", {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet("sac", "src/assets/images/sac.png", {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet("clé", "src/assets/images/cle.png", {
      frameWidth: 32,
      frameHeight: 32
    });

    //Preload sons :
    this.load.audio("son_fond", "src/assets/sons/niveau1.mp3");

    //Preload perso & ennemis
    this.load.spritesheet("img_perso", "src/assets/images/spritesheet.png", {
      frameWidth: 130,
      frameHeight: 256
    });
    this.load.spritesheet("zomblar", "src/assets/images/zomblar.png", {
      frameWidth: 32,
      frameHeight: 64
    });
    this.load.image("bullet", "src/assets/images/balle.png");
  }

  create() {
    // ================================ //
    // Bouton RESTART création
    // ================================ //

    bouton_restart = this.add.image(700, 64, "restart").setDepth(1);
    bouton_restart.setScale(0.6);
    bouton_restart.setInteractive();
    bouton_restart.on("pointerup", () => {
      this.scene.start("niveau1");
    });
    bouton_restart.setScrollFactor(0);
    this.firstTimeImg = true;
    this.firstTimeImg2 = true;
    this.firstTimeImg4 = true;
    this.firstTimeImg7 = true;

    // Bouton RESTART intéraction
    bouton_restart.on("pointerover", () => {
      var bouton_restartI = this.add.image(700, 64, "restartI").setDepth(1);
      bouton_restartI.setScale(0.6);
      bouton_restartI.setScrollFactor(0);
    });

    bouton_restart.on("pointerout", () => {
      var bouton_restart = this.add.image(700, 64, "restart").setDepth(1);
      bouton_restart.setScale(0.6);
      bouton_restart.setScrollFactor(0);
    });


    // ================================ //
    // Bouton PAUSE création
    // ================================ //

    bouton_pause_play = this.add.image(550, 64, "pause").setDepth(1);
    bouton_pause_play.setScale(0.6);
    bouton_pause_play.setInteractive();
    bouton_pause_play.setScrollFactor(0);
    bouton_pause_play.statut = "en jeu";

    bouton_pause_play.on("pointerover", () => {
      if (bouton_pause_play.statut == "en jeu") {
        bouton_pause_play.setTexture("pauseI");
      } else {
        // si on est en pause
        bouton_pause_play.setTexture("playI");
      }
    });

    bouton_pause_play.on("pointerout", () => {
      if (bouton_pause_play.statut == "en jeu") {
        bouton_pause_play.setTexture("pause");
      } else {
        // si on est en pause
        bouton_pause_play.setTexture("play");
      }
    });

    bouton_pause_play.on("pointerup", () => {
      if (bouton_pause_play.statut == "en jeu") {
        this.physics.pause();
        bouton_pause_play.setTexture("playI");
        bouton_pause_play.statut = "en pause";
      } else {
        // si on est en pause
        this.physics.resume();
        bouton_pause_play.setTexture("pauseI");
        bouton_pause_play.statut = "en jeu";
      }
    });

    musique_de_fond = this.sound.add("son_fond");
    musique_de_fond.play();

    // ================================ //
    // Création de la carte
    // ================================ //
    const carteDuNiveau = this.add.tilemap("carte");

    const tileset = carteDuNiveau.addTilesetImage(
      "tileset4",
      "Phaser_tuilesdejeu"
    );
    const tileset2 = carteDuNiveau.addTilesetImage(
      "map",
      "Phaser_tuilesdejeu2"
    );
    const tileset3 = carteDuNiveau.addTilesetImage(
      "tileset5",
      "Phaser_tuilesdejeu3"
    );
    const tileset4 = carteDuNiveau.addTilesetImage(
      "tunnel1",
      "Phaser_tuilesdejeu5"
    );
    const tileset5 = carteDuNiveau.addTilesetImage(
      "tunnel2",
      "Phaser_tuilesdejeu6"
    );
    const calque_background = carteDuNiveau.createLayer(
      "calque_background",
      tileset2
    );

    const panneaux = carteDuNiveau.createLayer("panneaux", tileset);

    calque_plateformes = carteDuNiveau.createLayer("calque_plateformes", [
      tileset,
      tileset3,
      tileset4,
      tileset5
    ]);

    // ================================ //
    // Collectibles
    // ================================ //

    groupeEau = this.physics.add.staticGroup();
    groupeNourriture = this.physics.add.staticGroup();
    groupeSoin = this.physics.add.staticGroup();
    groupeClé = this.physics.add.staticGroup();
    groupeSac = this.physics.add.staticGroup();
    groupeBouton = this.physics.add.staticGroup();
    groupeZomblar = this.physics.add.group();

    const Tabobjects = carteDuNiveau.getObjectLayer("objets");
    Tabobjects.objects.forEach((element) => {
      if (element.name == "eau") {
        var eau = this.physics.add.staticSprite(
          element.x,
          element.y - 15,
          "eau"
        );
        groupeEau.add(eau);
      }
      if (element.name == "nourriture") {
        var nourriture = this.physics.add.staticSprite(
          element.x,
          element.y - 10,
          "nourriture"
        );
        groupeNourriture.add(nourriture);
      }
      if (element.name == "soin") {
        var soin = this.physics.add.staticSprite(
          element.x,
          element.y - 10,
          "soin"
        );
        groupeSoin.add(soin);
      }

      if (element.name == "zomblar") {
        var zomblar = this.physics.add.sprite(element.x, element.y, "zomblar");
        this.physics.add.collider(zomblar, calque_plateformes);

        this.physics.add.collider(zomblar, player, toucherZomblar, null, this);

        //animation zombie
        tween_zomblar = this.tweens.add({
          targets: [zomblar],
          paused: false, // de base le tween est en pause
          ease: "Linear", // concerne la vitesse de mouvement : linéaire ici
          duration: 1000, // durée de l'animation pour monter
          yoyo: true, // mode yoyo : une fois terminé on "rembobine" le déplacement
          flipX: true,
          x: "+=150",
          delay: 0,
          hold: 1000,
          repeatDelay: 1000,
          repeat: -1
        });
        groupeZomblar.add(zomblar);
      }
      if (element.name == "sac") {
        var sac = this.physics.add.staticSprite(
          element.x,
          element.y - 15,
          "sac"
        );
        groupeSac.add(sac);
      }
      if (element.name == "clé") {
        var clé = this.physics.add.staticSprite(element.x, element.y, "clé");
        groupeClé.add(clé);
      }
      if (element.name == "bouton") {
        //element.properties[0].name <- contient 'idButton'
        //element.properties[0].value <- contient '1'

        if (element.properties[0].value == 1) {
          var bouton = this.physics.add.staticSprite(
            element.x,
            element.y + 2,
            "bouton2"
          );
        } else {
          var bouton = this.physics.add.staticSprite(
            element.x,
            element.y + 2,
            "bouton"
          );
        }
        bouton.id = element.properties[0].value;
        groupeBouton.add(bouton);
      }
    });

    clavier = this.input.keyboard.createCursorKeys();
    boutonFeu = this.input.keyboard.addKey("A");
    calque_plateformes.setCollisionByProperty({ estSolide: true });

    // ================================ //
    // Joueur
    // ================================ //

    player = this.physics.add.sprite(50, 64, "img_perso");
    player.direction = "right";
    player.setCollideWorldBounds(true);
    player.body.onWorldBounds = true;
    player.body.world.on("worldbounds", function (body, up, down, left, right) {
      if (body.gameObject === player && down == true) {
        gameOver = true;
      }
    });
    player.setBounce(0);
    this.physics.add.collider(player, calque_plateformes);
    player.direction = "right";
    this.physics.world.setBounds(0, 0, 3200, 640);
    this.cameras.main.setBounds(0, 0, 3200, 640);
    this.cameras.main.startFollow(player);
    player.setScale(0.25);
    player.estInvincible = false;
    player.cléObtenue = false;
    player.sacObtenu = false;
    elements_traversables = carteDuNiveau.createLayer("elements_traversables", [
      tileset,
      tileset3
    ]);

    // ================================ //
    // Interactions avec objets
    // ================================ //

    this.physics.add.overlap(
      player,
      groupeEau,
      function (player, element) {
        element.disableBody(true, true);
        this.game.global.nbEau += 1;
      },
      null,
      this
    );
    this.physics.add.overlap(
      player,
      groupeNourriture,
      function (player, element) {
        element.disableBody(true, true);
        this.game.global.nbNourriture += 1;
      },
      null,
      this
    );
    this.physics.add.overlap(
      player,
      groupeSoin,
      function (player, element) {
        element.disableBody(true, true);
        this.game.global.nbSoin += 1;
      },
      null,
      this
    );

    this.physics.add.overlap(
      groupeBouton,
      groupeSac,
      function (element1, element2) {
        if (element1.id == 2) {
          caisse4.disableBody(true, true);
        }
        if (element1.id == 3) {
          caisse3.disableBody(true, true);
        }
        element1.play("bouton_appuyé", true);
      },
      null,
      this
    );
    this.physics.add.overlap(
      player,
      groupeClé,
      function (player, element) {
        element.disableBody(true, true);
        player.cléObtenue = true;
        inventaireClé = this.add.image(764, 564, "clé");
        inventaireClé.setScrollFactor(0);
        inventaireClé.setScale(1.2);
      },
      null,
      this
    );
    this.physics.add.overlap(
      player,
      groupeSac,
      function (player, element) {
        if (Phaser.Input.Keyboard.JustDown(clavier.space)) {
          element.destroy();
          inventaireSac = this.add.image(740, 564, "sac");
          inventaireSac.setScrollFactor(0);
          player.sacObtenu = true;
        }
      },
      null,
      this
    );
    this.physics.add.overlap(
      player,
      groupeBouton,
      function (player, element) {
        if (element.id == 1) {
          caisse2.disableBody(true, true);
          element.play("bouton_appuyéV", true);
        }
        if (element.id == 2) {
        }
      },
      null,
      this
    );

    // ================================ //
    // Fin du jeu
    // ================================ //
    calque_plateformes.setTileLocationCallback(
      98,
      8,
      3,
      1,
      function () {
        this.scene.start("interNiveau");
      },
      this
    );

    // animation perso
    this.anims.create({
      key: "anim_tourne_gauche",

      frames: this.anims.generateFrameNumbers("img_perso", {
        start: 1,
        end: 5
      }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: "anim_face",
      frames: [{ key: "img_perso", frame: 6 }],
      frameRate: 20
    });
    this.anims.create({
      key: "anim_tourne_droite",
      frames: this.anims.generateFrameNumbers("img_perso", {
        start: 1,
        end: 5
      }),
      frameRate: 10,
      repeat: -1
    });

    // animation zombie
    this.anims.create({
      key: "zombieAvance",
      frames: this.anims.generateFrameNumbers("zomblar", {
        start: 1,
        end: 6
      }),
      frameRate: 10,
      repeat: -1
    });
    groupeZomblar.children.iterate(function iterateur(un_element) {
      un_element.play("zombieAvance", true);
    });

    // animation bouteille
    this.anims.create({
      key: "turn_bouteille",
      frames: this.anims.generateFrameNumbers("eau", {
        start: 0,
        end: 5
      }),
      frameRate: 4,
      repeat: -1
    });
    groupeEau.children.iterate(function iterateur(un_element) {
      un_element.play("turn_bouteille", true);
    });

    // animation nourriture
    this.anims.create({
      key: "turn_conserve",
      frames: this.anims.generateFrameNumbers("nourriture", {
        start: 0,
        end: 5
      }),
      frameRate: 4,
      repeat: -1
    });
    groupeNourriture.children.iterate(function iterateur(un_element) {
      un_element.play("turn_conserve", true);
    });

    //animation sac
    this.anims.create({
      key: "turn_sac",
      frames: this.anims.generateFrameNumbers("sac", {
        start: 0,
        end: 5
      }),
      frameRate: 4,
      repeat: -1
    });
    groupeSac.children.iterate(function iterateur(un_element) {
      un_element.play("turn_sac", true);
    });

    // animation soin
    this.anims.create({
      key: "turn_soin",
      frames: this.anims.generateFrameNumbers("soin", {
        start: 0,
        end: 5
      }),
      frameRate: 4,
      repeat: -1
    });
    groupeSoin.children.iterate(function iterateur(un_element) {
      un_element.play("turn_soin", true);
    });

    // animation clé
    this.anims.create({
      key: "turn_clé",
      frames: this.anims.generateFrameNumbers("clé", {
        start: 0,
        end: 5
      }),
      frameRate: 4,
      repeat: -1
    });
    groupeClé.children.iterate(function iterateur(un_element) {
      un_element.play("turn_clé", true);
    });

    //animation bouton
    this.anims.create({
      key: "bouton_levé",
      frames: [{ key: "bouton", frame: 0 }],
      frameRate: 20
    });
    groupeBouton.children.iterate(function iterateur(un_element) {
      un_element.play("bouton_levé", true);
    });
    this.anims.create({
      key: "bouton_appuyé",
      frames: [{ key: "bouton", frame: 1 }],
      frameRate: 20
    });

    //animation bouton vert
    this.anims.create({
      key: "bouton_levéV",
      frames: [{ key: "bouton2", frame: 0 }],
      frameRate: 20
    });
    groupeBouton.children.iterate(function iterateur(un_element) {
      // if (un_element.properties[0].value == 1) {
      un_element.play("bouton_levéV", true);
      // }
    });
    this.anims.create({
      key: "bouton_appuyéV",
      frames: [{ key: "bouton2", frame: 1 }],
      frameRate: 20
    });

    //plateforme mobile
    plateforme_mobile = this.physics.add.sprite(1584, 464, "plateform");
    plateforme_mobile.body.allowGravity = false;
    plateforme_mobile.body.immovable = true;
    this.physics.add.collider(player, plateforme_mobile);
    this.physics.add.collider(
      player,
      groupeZomblar,
      toucherZomblar,
      null,
      this
    );
    //Caisses
    caisse = this.physics.add.sprite(1024, 80, "caisse");
    caisse.setScale(0.25);
    caisse.body.allowGravity = false;
    caisse.body.immovable = true;
    this.physics.add.collider(player, caisse);

    caisse2 = this.physics.add.sprite(192, 560, "caisse2");
    caisse2.setScale(0.25);
    caisse2.body.allowGravity = false;
    caisse2.body.immovable = true;
    this.physics.add.collider(player, caisse2);

    caisse3 = this.physics.add.sprite(1440, 80, "caisse2");
    caisse3.setScale(0.25);
    caisse3.body.allowGravity = false;
    caisse3.body.immovable = true;
    this.physics.add.collider(player, caisse3);

    caisse4 = this.physics.add.sprite(448, 192, "caisse3");
    caisse4.setScale(0.25);
    caisse4.body.allowGravity = false;
    caisse4.body.immovable = true;
    this.physics.add.collider(player, caisse4);

    // Tutoriel
    this.tutoriel(1, 3, "deplacer", this.firstTimeImg);
    this.tutoriel(9, 14, "sauter", this.firstTimeImg2);
    this.tutoriel(9, 18, "sauter", this.firstTimeImg2);
    this.tutoriel(12, 3, "interagir", this.firstTimeImg4);
    this.tutoriel(66, 3, "tirer", this.firstTimeImg7);
    this.tutoriel(64, 13, "tirer", this.firstTimeImg7);

    healthBarImage1 = this.add.image(98, 564, "health2");
    healthBarImage1.setScrollFactor(0);
    healthBarImage1.setScale(0.5);
    healthBarImage2 = this.add.image(98, 564, "health1");
    healthBarImage2.setScrollFactor(0);
    healthBarImage2.setScale(0.5);
    //animation plateforme
    tween_mouvement = this.tweens.add({
      targets: [plateforme_mobile], // on applique le tween sur platefprme_mobile
      paused: false, // de base le tween est en pause
      ease: "Linear", // concerne la vitesse de mouvement : linéaire ici
      duration: 5000, // durée de l'animation pour monter
      yoyo: true, // mode yoyo : une fois terminé on "rembobine" le déplacement
      x: "+=416",
      delay: 0,
      hold: 1000,
      repeatDelay: 1000,
      repeat: -1
    });

    calque_plateformes.setTileLocationCallback(
      31,
      3,
      3,
      1,
      function () {
        if (player.cléObtenue === true) {
          if (clavier.space.isDown) {
            caisse.destroy();
            inventaireClé.visible = false;
          }
        }
      },
      this
    );

    groupeBullets = this.physics.add.group();
    this.physics.add.overlap(
      groupeBullets,
      groupeZomblar,
      hitZomblar,
      null,
      this
    );
  }

  update() {
    if (this.physics.overlap(groupeSac, groupeBouton) === false) {
      groupeBouton.children.iterate(function iterateur(un_element) {
        if (un_element.id == 2) {
          un_element.play("bouton_levé", true);
        }
        if (un_element.id == 3) {
          un_element.play("bouton_levé", true);
        }
      });

      if (caisse4.active == false) {
        caisse4.enableBody(false, 0, 0, true, true);
      }
      if (caisse3.active == false) {
        caisse3.enableBody(false, 0, 0, true, true);
      }
    }

    //téléportation
    var tuile3 = calque_plateformes.getTileAtWorldXY(player.x, player.y);

    // tuiles transparentes
    if (player.direction == "left") {
      var tuile = elements_traversables.getTileAtWorldXY(
        player.x - 50,
        player.y + 16
      );
    }
    if (player.direction == "right") {
      var tuile = elements_traversables.getTileAtWorldXY(
        player.x + 50,
        player.y + 16
      );
    }
    if (tuile != null) {
      tuile.setAlpha(0.5);
      var timer = this.time.delayedCall(
        3000,
        function () {
          tuile.setAlpha(1);
        },
        null,
        this
      );
    }
    var tuile2 = elements_traversables.getTileAtWorldXY(
      player.x - 30,
      player.y - 16
    );
    if (tuile2 != null) {
      tuile2.setAlpha(0.5);
      var timer2 = this.time.delayedCall(
        3000,
        function () {
          tuile2.setAlpha(1);
        },
        null,
        this
      );
    }

    if (healthBar === 0) {
      gameOver = true;
    }
    // ================================ //
    //game over
    // ================================ //
    
    if (gameOver == true) {
      healthBar = 10;
      gameOver = false;
      healthBarImage1.visible = false;
      healthBarImage2.visible = false;
      musique_de_fond.stop();
      this.physics.pause();
      player.disableBody(true, true);
      this.game.global.nbEau = 0;
      this.game.global.nbNourriture = 0;
      this.game.global.nbSoin = 0;

      gameOverImage = this.add.image(400, 200, "gameover");
      gameOverImage.setScrollFactor(0);
      bouton_restart.visible = false;
      bouton_pause_play.visible = false;
      var bouton_restart2 = this.add.image(400, 400, "restart").setDepth(1);
      bouton_restart2.setScrollFactor(0);
      bouton_restart2.setInteractive();
      bouton_restart2.on("pointerup", () => {
        this.scene.start("niveau1");
      });
    }

    if (clavier.right.isDown) {
      player.direction = "right";
      player.setVelocityX(160);
      player.anims.play("anim_tourne_droite", true);
      player.flipX = false;
    } else if (clavier.left.isDown) {
      player.direction = "left";
      player.setVelocityX(-160);
      player.anims.play("anim_tourne_gauche", true);
      player.flipX = true;
    } else {
      player.setVelocityX(0);
      player.anims.play("anim_face");
    }
    if (clavier.up.isDown && player.body.blocked.down) {
      player.setVelocityY(-250);
    }
    if (Phaser.Input.Keyboard.JustDown(clavier.space)) {
      if (player.sacObtenu == true) {
        var sac = this.physics.add.staticSprite(player.x, player.y + 10, "sac");
        groupeSac.add(sac);
        inventaireSac.destroy();
        player.sacObtenu = false;
      }
      if (tuile3 != null) {
        if (tuile3.properties.estTeleporteur == true) {
          player.x = 3088;
          player.y = 256;
        }
      }
    }

    // déclenchement de la fonction tirer() si appui sur boutonFeu
    if (Phaser.Input.Keyboard.JustDown(boutonFeu)) {
      tirer(player);
    }
  }
}

function toucherZomblar(player, groupeZomblar) {
  if (player.estInvincible == false) {
    healthBar = healthBar - 5;
    player.setTint(0xff0000);
    if (healthBar == 5) {
      healthBarImage1.visible = false;
      healthBarImage2.visible = true;
    }
  }
  player.estInvincible = true;
  var timer = this.time.delayedCall(
    1000,
    function () {
      player.setTint(0xffffff);
      player.estInvincible = false;
    },
    null,
    this
  );
}

//fonction tirer( ), prenant comme paramètre l'auteur du tir
function tirer(player) {
  var coefDir;
  if (player.direction == "left") {
    coefDir = -1;
  } else {
    coefDir = 1;
  }
  // on crée la balle a coté du joueur
  var bullet = groupeBullets.create(
    player.x + 25 * coefDir,
    player.y - 4,
    "bullet"
  );
  // parametres physiques de la balle.
  bullet.setCollideWorldBounds(true);
  bullet.body.allowGravity = false;
  bullet.setVelocity(1000 * coefDir, 0); // vitesse en x et en y
}

// fonction déclenchée lorsque uneBalle et uneCible se superposent
function hitZomblar(uneBalle, unZomblar) {
  uneBalle.destroy(); // destruction de la balle
  healthBarZombie = healthBarZombie - 3;
  unZomblar.setTint(0xff0000);
  var timer = this.time.delayedCall(
    500,
    function () {
      unZomblar.setTint(0xffffff);
    },
    null,
    this
  );
  if (healthBarZombie == 0) {
    unZomblar.destroy(); // destruction de la cible.
  }
}

// No código atual, a Programação Orientada a Objetos (POO) é aplicada de forma mais  organizada em comparação ao código original. As propriedades, como score e hasKey, são encapsuladas dentro das classes, evitando variáveis globais e mantendo o estado do jogo mais estruturado. Métodos como spawnKey, collectKey e moveEnemyRandomly tornam o código modular e mais fácil de entender. Além disso, todas as cenas herdam da classe Phaser.Scene, aproveitando os métodos e propriedades da biblioteca Phaser, o que demonstra o uso de herança. O jogo atual centraliza o carregamento de recursos na MenuScene, evitando duplicação. No geral, o código atual apresenta uma abordagem mais avançada de POO, com melhor organização, reutilização e abstração, além de aprimorar a experiência do jogo.

class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    preload() {
        // Carrega todos os recursos necessários para o jogo
        this.load.image('startButton', 'assets/start.png');
        this.load.image('backgroundMenu', 'assets/background_menu.png');
        this.load.image('backgroundGame', 'assets/background_game.png');
        this.load.image('backgroundGame2', 'assets/background_game2.png');
        this.load.image('backgroundGameOver', 'assets/background_gameover.png');
        this.load.image('backgroundWin', 'assets/background_win.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('key', 'assets/key.png');
        this.load.image('enemy', 'assets/enemy.png');
        this.load.image('door', 'assets/door.png');
        this.load.tilemapTiledJSON('map', 'assets/map.json');
        this.load.tilemapTiledJSON('map2', 'assets/map2.json');
        this.load.image('tiles', 'assets/tileset.png');
    }

    create() {
        // Adiciona o fundo do menu
        this.add.image(400, 300, 'backgroundMenu');
        this.add.text(250, 100, "Jogo do Labirinto", { fontSize: "48px", fill: "#fff" });
        
        // Cria o botão de início e define a interação
        let startButton = this.add.image(400, 400, 'startButton').setInteractive();
        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
        this.score = 0;
        this.hasKey = false;
    }

    create() {
        // Adiciona o fundo da fase 1
        this.add.image(400, 300, 'backgroundGame');
        
        // Cria o mapa e o tileset
        const map = this.make.tilemap({ key: "map" });
        const tileset = map.addTilesetImage("tileset", "tiles");
        map.createLayer("Ground", tileset, 0, 0);
        
        // Cria o jogador e define suas propriedades físicas
        this.player = this.physics.add.sprite(100, 100, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.2);
        
        // Spawn da chave
        this.spawnKey();
        
        // Cria a porta
        this.door = this.physics.add.sprite(700, 500, 'door');
        
        // Cria o inimigo e define suas propriedades físicas
        this.enemy = this.physics.add.sprite(400, 200, 'enemy');
        this.enemy.setVelocity(100, 100);
        this.enemy.setBounce(1, 1);
        this.enemy.setCollideWorldBounds(true);

        // Textos de pontuação e mensagens
        this.scoreText = this.add.text(16, 16, 'Placar: 0', { fontSize: "32px", fill: "#fff" });
        this.messageText = this.add.text(200, 550, '', { fontSize: "24px", fill: "#fff" });

        // Define as colisões
        this.physics.add.overlap(this.player, this.keyItem, this.collectKey, null, this);
        this.physics.add.overlap(this.player, this.door, this.enterDoor, null, this);
        this.physics.add.collider(this.player, this.enemy, this.hitEnemy, null, this); // Colisão com o inimigo

        // Controles do teclado
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        // Reseta a velocidade do jogador a cada frame
        this.player.setVelocity(0);

        // Movimentação do jogador com as setas do teclado
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-160);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160);
        }
    }

    spawnKey() {
        // Destrói a chave anterior, se existir
        if (this.keyItem) {
            this.keyItem.destroy();
        }
        // Spawna a chave em uma posição aleatória
        let x = Phaser.Math.Between(50, 750);
        let y = Phaser.Math.Between(50, 550);
        this.keyItem = this.physics.add.sprite(x, y, 'key');
        this.hasKey = false;
    }

    collectKey(player, key) {
        // Aumenta a pontuação e destrói a chave
        this.score += 10;
        this.scoreText.setText('Placar: ' + this.score);
        key.destroy();
        this.hasKey = true;
        this.messageText.setText('Chave coletada! Vá para a porta.');
        
        // Remove a mensagem após 3 segundos
        this.time.delayedCall(3000, () => {
            this.messageText.setText('');
        });
    }

    enterDoor(player, door) {
        // Verifica se o jogador tem a chave para abrir a porta
        if (this.hasKey) {
            this.scene.start('GameScene2', { score: this.score });
        } else {
            this.messageText.setText('Você precisa da chave para abrir a porta!');
            
            // Remove a mensagem após 2 segundos
            this.time.delayedCall(2000, () => {
                this.messageText.setText('');
            });
        }
    }
    
    hitEnemy(player, enemy) {
        // Game Over ao colidir com o inimigo
        this.scene.start('GameOverScene', { score: this.score });
    }
}

class GameScene2 extends Phaser.Scene {
    constructor() {
        super("GameScene2");
        this.score = 0;
        this.hasKey = false;
    }

    init(data) {
        // Recebe a pontuação da fase anterior
        this.score = data.score || 0;
    }

    create() {
        // Adiciona o fundo da fase 2
        this.add.image(400, 300, 'backgroundGame2');
        
        // Tenta carregar o mapa da fase 2
        try {
            const map = this.make.tilemap({ key: "map2" });
            const tileset = map.addTilesetImage("tileset", "tiles");
            map.createLayer("Ground", tileset, 0, 0);
        } catch (error) {
            console.error("Erro ao carregar o mapa:", error);
        }
        
        // Cria o jogador e define suas propriedades físicas
        this.player = this.physics.add.sprite(100, 100, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.2);
        
        // Spawn da chave
        this.spawnKey();
        
        // Cria a porta e define suas propriedades físicas
        this.door = this.physics.add.sprite(700, 500, 'door');
        this.door.setCollideWorldBounds(true); // Garante que a porta não saia da tela
        this.door.setBounce(1, 1); // Faz a porta quicar ao colidir com os limites
        
        // Cria dois inimigos
        this.enemies = this.physics.add.group({
            defaultKey: 'enemy',
            collideWorldBounds: true, // Garante que os inimigos colidam com os limites da tela
            bounceX: 1,
            bounceY: 1
        });

        const enemy1 = this.enemies.create(300, 200, 'enemy');
        const enemy2 = this.enemies.create(500, 400, 'enemy');

        // Define a velocidade inicial dos inimigos
        enemy1.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200));
        enemy2.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200));
        
        // Textos de pontuação e mensagens
        this.scoreText = this.add.text(16, 16, 'Placar: ' + this.score, { fontSize: "32px", fill: "#fff" });
        this.messageText = this.add.text(200, 550, '', { fontSize: "24px", fill: "#fff" });
        
        // Define as colisões
        this.physics.add.overlap(this.player, this.keyItem, this.collectKey, null, this);
        this.physics.add.overlap(this.player, this.door, this.enterDoor, null, this);
        this.physics.add.collider(this.player, this.enemies, this.hitEnemy, null, this); // Colisão com os inimigos
        
        // Controles do teclado
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Inicia a movimentação aleatória dos inimigos e da porta
        this.moveEnemyRandomly();
        this.moveDoorRandomly();
    }
    
    update() {
        // Reseta a velocidade do jogador a cada frame
        this.player.setVelocity(0);

        // Movimentação do jogador com as setas do teclado
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-160);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160);
        }
    }
    
    spawnKey() {
        // Destrói a chave anterior, se existir
        if (this.keyItem) {
            this.keyItem.destroy();
        }
        // Spawna a chave em uma posição aleatória
        let x = Phaser.Math.Between(50, 750);
        let y = Phaser.Math.Between(50, 550);
        this.keyItem = this.physics.add.sprite(x, y, 'key');
        this.hasKey = false;
    }
    
    collectKey(player, key) {
        // Aumenta a pontuação e destrói a chave
        this.score += 20; // Mais pontos na fase 2
        this.scoreText.setText('Placar: ' + this.score);
        key.destroy();
        this.hasKey = true;
        this.messageText.setText('Chave coletada! Vá para a porta.');
        
        // Remove a mensagem após 3 segundos
        this.time.delayedCall(3000, () => {
            this.messageText.setText('');
        });
    }
    
    enterDoor(player, door) {
        // Verifica se o jogador tem a chave para abrir a porta
        if (this.hasKey) {
            this.scene.start('WinScene', { score: this.score });
        } else {
            this.messageText.setText('Você precisa da chave para abrir a porta!');
            
            // Remove a mensagem após 2 segundos
            this.time.delayedCall(2000, () => {
                this.messageText.setText('');
            });
        }
    }
    
    hitEnemy(player, enemy) {
        // Game Over ao colidir com o inimigo
        this.scene.start('GameOverScene', { score: this.score });
    }
    
    moveEnemyRandomly() {
        // Move os inimigos de forma aleatória
        this.enemies.getChildren().forEach(enemy => {
            const velocityX = Phaser.Math.Between(-200, 200);
            const velocityY = Phaser.Math.Between(-200, 200);
            enemy.setVelocity(velocityX, velocityY);
        });
        
        // Repete a função a cada 2 segundos
        this.time.delayedCall(2000, this.moveEnemyRandomly, [], this);
    }
    
    moveDoorRandomly() {
        // Move a porta de forma aleatória
        const velocityX = Phaser.Math.Between(-100, 100); // Velocidade mais lenta que a dos inimigos
        const velocityY = Phaser.Math.Between(-100, 100);
        this.door.setVelocity(velocityX, velocityY);
        
        // Repete a função a cada 3 segundos
        this.time.delayedCall(3000, this.moveDoorRandomly, [], this);
    }
}

class GameOverScene extends Phaser.Scene {
    constructor() {
        super("GameOverScene");
    }
    
    init(data) {
        // Recebe a pontuação da fase anterior
        this.score = data.score || 0;
    }

    create() {
        // Adiciona o fundo de Game Over
        this.add.image(400, 300, 'backgroundGameOver');
        this.add.text(300, 100, "Game Over", { fontSize: "48px", fill: "#f00" });
        this.add.text(300, 200, "Pontuação: " + this.score, { fontSize: "32px", fill: "#fff" });
        this.add.text(240, 500, "Clique para voltar ao menu", { fontSize: "24px", fill: "#fff" });
        
        // Volta ao menu ao clicar na tela
        this.input.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}

class WinScene extends Phaser.Scene {
    constructor() {
        super("WinScene");
    }
    
    init(data) {
        // Recebe a pontuação da fase anterior
        this.score = data.score || 0;
    }

    create() {
        // Adiciona o fundo de vitória
        this.add.image(400, 300, 'backgroundWin');
        this.add.text(300, 100, "Você Ganhou!", { fontSize: "48px", fill: "#0f0" });
        this.add.text(280, 200, "Pontuação: " + this.score, { fontSize: "32px", fill: "#fff" });
        this.add.text(240, 500, "Clique para voltar ao menu", { fontSize: "24px", fill: "#fff" });
        
        // Volta ao menu ao clicar na tela
        this.input.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scene: [MenuScene, GameScene, GameScene2, GameOverScene, WinScene]
};

const game = new Phaser.Game(config);
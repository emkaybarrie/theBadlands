import preload from "../preload.js";
import { config } from "../config.js";

export default class Start extends Phaser.Scene {
    constructor() {
        super('Start');
        
    }

    preload() {
        // Load assets if needed
        preload(this);  // Call the preload function with the current scene
    }

    create() {
        const titleScreen = this.add.image(0,0,'titleScreen').setOrigin(0)

        // Scale the image to fit the screen
        scaleImageToFitCanvas(titleScreen);
        
        // Adjust scaling on window resize
        window.addEventListener('resize', () => {
            config.width = window.innerWidth;
            config.height = window.innerHeight;
            game.resize(config.width, config.height);
            scaleImageToFitCanvas(titleScreen);
        });

        // Add Start screen text
        this.add.text(this.scale.width * 0.65, this.scale.height * 0.4, 'The Badlands', { fontSize: '38px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(this.scale.width * 0.65, this.scale.height * 0.5, 'Press Enter to start', { fontSize: '26px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(this.scale.width * 0.65, this.scale.height * 0.6, 'Current Supported: Keyboard, Gamepad', { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
        
        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('Base');
            this.scale.startFullscreen()
        });
    }

    
}

function scaleImageToFitCanvas(image) {
    // Set image size to match the game size
    image.setDisplaySize(config.width, config.height);
}

export default class LoadingScreen extends Phaser.Scene {
    constructor() {
        super('LoadingScreen');
    }

    init(data) {
        // Data passed from the calling scene
        this.targetScene = data.targetScene || 'GameScene';
        this.category = data.category || 'default';
        this.subCategory = data.subCategory || null; // Optional sub-category
        this.region = data.region || 1;
        this.playerData = data.playerData || null;
    }

    preload() {
        // Preload assets for the loading screen itself
        this.load.audio('backgroundMusic1', 'assets/music/placeholder_142.mp3');
        this.load.audio('backgroundMusic2', 'assets/music/placeholder_BlameBrett.mp3');
        this.load.audio('backgroundMusic3', 'assets/music/placeholder_Francesca.mp3');
        this.load.audio('backgroundMusic4', 'assets/music/placeholder_FromEden.mp3');
        this.load.audio('backgroundMusic5', 'assets/music/placeholder_KingsSeason.mp3');
        this.load.audio('backgroundMusic6', 'assets/music/placeholder_Spartacus.mp3');
        this.load.audio('backgroundMusic7', 'assets/music/placeholder_StayCrunchy.mp3');
        this.load.audio('backgroundMusic8', 'assets/music/placeholder_XylemUp.mp3');

            // Terrain

            // In your preload method
            this.load.spritesheet('terrainTileset', 'assets/images/world_tileset.png', {
                frameWidth: 16,  // Width of each tile (in pixels)
                frameHeight: 16, // Height of each tile (in pixels)
            });


            // Loot

            this.load.spritesheet('coin', 'assets/images/coin.png', { frameWidth: 16, frameHeight: 16 });

            this.load.image('gold', 'assets/images/gold.png');
            this.load.image('enemy', 'assets/images/enemy.png');
            this.load.image('enemy2', 'assets/images/enemy2.png');
            this.load.image('dTerrainPlaceholder', 'assets/images/dTerrainPlaceholder.png');
            this.load.image('ground_common', 'assets/images/ground_common.png');
            this.load.image('ground_uncommon', 'assets/images/ground_uncommon.png');
            this.load.image('low_common', 'assets/images/low_common.png');
            this.load.image('low_uncommon', 'assets/images/low_uncommon.png');
            this.load.image('medium_common', 'assets/images/medium_common.png');
            this.load.image('medium_uncommon', 'assets/images/medium_uncommon.png');
            this.load.image('high_common', 'assets/images/high_common.png');
    }

    create() {
        // Define libraries for different categories and subcategories
        const assetLibrary = {
            badlands: {
                default: [
                    { type: 'image', key: 'badlandsTerrain', path: 'assets/images/badlands/terrain.png' },
                    { type: 'image', key: 'badlandsRock', path: 'assets/images/badlands/rock.png' },
                ],
                region1: [
                    { type: 'image', key: 'badlandsCactus', path: 'assets/images/badlands/cactus.png' },
                ],
            },
            forest: {
                default: [
                    { type: 'image', key: 'forestTree', path: 'assets/images/forest/tree.png' },
                    { type: 'image', key: 'forestBush', path: 'assets/images/forest/bush.png' },
                ],
                region2: [
                    { type: 'image', key: 'forestStream', path: 'assets/images/forest/stream.png' },
                ],
            },
            default: {
                default: [
                    { type: 'image', key: 'genericItem', path: 'assets/images/default/item.png' },
                ],
            },
        };

        // Choose assets to load based on category and subcategory
        const categoryAssets = assetLibrary[this.category]?.default || [];
        const subCategoryAssets = this.subCategory ? assetLibrary[this.category]?.[this.subCategory] || [] : [];
        this.assets = [...categoryAssets, ...subCategoryAssets];

        // Define libraries for different categories
        const imageLibrary = {
            badlands: ['titleScreen2b', 'titleScreen2b', 'titleScreen2b'],
            forest: ['forest1', 'forest2', 'forest3'],
            default: ['default1', 'default2', 'default3'],
        };

        const textLibrary = {
            badlands: ['Beware the barren lands...', 'Survive the wasteland.', 'Watch out for quicksand!'],
            forest: ['The forest is alive...', 'Stay quiet. They’re watching.', 'Beware of shadows.'],
            default: ['Loading...', 'Prepare yourself...', 'It’s about to begin.'],
        };

        const selectedImage = Phaser.Utils.Array.GetRandom(imageLibrary[this.category] || imageLibrary['default']);
        const selectedText = Phaser.Utils.Array.GetRandom(textLibrary[this.category] || textLibrary['default']);

        // Add and fade in the chosen image
        const image = this.add.image(this.scale.width / 2, this.scale.height / 2, selectedImage).setAlpha(0);
        image.setScale(Math.min(this.scale.width / image.width, this.scale.height / image.height));
        this.tweens.add({
            targets: image,
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
        });

        // Add and fade in the chosen text
        const text = this.add.text(this.scale.width / 2, this.scale.height * 0.8, selectedText, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            align: 'center',
        })
            .setOrigin(0.5)
            .setAlpha(0);
        this.tweens.add({
            targets: text,
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
        });

        // Delay loading by 1 second
        this.time.delayedCall(1000, () => {
            this.startLoading();
        });
    }

    startLoading() {
        const barWidth = this.scale.width * 0.6;
        const barHeight = 20;
        const barX = (this.scale.width - barWidth) / 2;
        const barY = this.scale.height * 0.9;

        const barBackground = this.add.graphics();
        barBackground.fillStyle(0x444444, 1); // Set the color and opacity of the background
        barBackground.fillRect(barX, barY, barWidth, barHeight); // Draw the background rectangle
        barBackground.setDepth(7); // Ensure it stays behind the loading bar

        const loadingBar = this.add.graphics();
        const fluidEffect = this.add.graphics();

        // Ensure the loading bar is on top
        loadingBar.setDepth(8);
        fluidEffect.setDepth(9);

        const drawBar = (progress) => {
            loadingBar.clear();
            fluidEffect.clear();

            loadingBar.fillStyle(0x222222, 1).fillRect(barX, barY, barWidth, barHeight);

            const progressWidth = barWidth * progress;
            loadingBar.fillStyle(0x800080, 1).fillRect(barX, barY, progressWidth, barHeight);

            const glowAlpha = Phaser.Math.Interpolation.Linear([0.2, 0.5, 1], progress);
            fluidEffect.fillStyle(0xe000ff, glowAlpha).fillCircle(barX + progressWidth, barY + barHeight / 2, 10 * progress);
        };

        this.load.on('progress', (value) => drawBar(value));

        this.load.on('complete', () => {
            drawBar(1);
            this.time.delayedCall(1000, () => {
                this.scene.start(this.targetScene, { region: this.region, playerData: this.playerData });
            });
        });

        // Load assets for the chosen category
        this.assets.forEach((asset) => {
            if (asset.type === 'image') {
                this.load.image(asset.key, asset.path);
            } else if (asset.type === 'spritesheet') {
                this.load.spritesheet(asset.key, asset.path, asset.frameConfig);
            }
        });

        this.time.delayedCall(1000, () => {
            if (this.load.totalToLoad > 0) {
                this.load.start();
            } else {
                let progress = 0;
                const timer = this.time.addEvent({
                    delay: 50,
                    callback: () => {
                        progress = Math.min(progress + 0.05, 1);
                        drawBar(progress);
                        if (progress >= 1) {
                            timer.remove();
                            this.scene.start(this.targetScene, { region: this.region, playerData: this.playerData });
                        }
                    },
                    loop: true,
                });
            }
        });
    }
}

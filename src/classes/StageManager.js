import CameraManager from './CameraManager.js';
import EnvironmentManager from './EnvironmentManager.js';
import AvatarManager from './AvatarManager.js';
import TerrainManager from './TerrainManager.js';
import UIManager from './UIManager.js';
import ObstaclesManager from './ObstacleManager.js';
import LootManager from './LootManager.js';
import EnemyManager from './Enemies.js';




export default class StageManager {
    constructor(scene, input, config) {

        // Initialize stage elements here
        this.scene = scene; // Reference to the Phaser scene
        this.input = input
        this.stageConfig = config
        this.region = this.scene.region

        this.baseSpeed = config.baseSpeed;
        this.addedSpeed = config.addedSpeed

        this.stageProgress = 0
        this.stageLength = 10000
        this.stage = 1
        this.stageStart = false
        

        this.layers = [];   // Array to hold generated layers

        // Define groups for each platform type
        this.terrainGroups = {
            ground: this.scene.physics.add.staticGroup(),
            low: this.scene.physics.add.staticGroup(),
            medium: this.scene.physics.add.staticGroup(),
            high: this.scene.physics.add.staticGroup()
        };

        this.obstacleGroups = {
            ground: this.scene.physics.add.group(),
            low: this.scene.physics.add.group(),
            medium: this.scene.physics.add.group(),
            high: this.scene.physics.add.group()
        };

        this.lootGroups = {
            ground: this.scene.physics.add.group(),
            low: this.scene.physics.add.group(),
            medium: this.scene.physics.add.group(),
            high: this.scene.physics.add.group()
        };

        this.enemyGroups = {
            ground: this.scene.physics.add.group(),
            low: this.scene.physics.add.group(),
            medium: this.scene.physics.add.group(),
            high: this.scene.physics.add.group()
        };

        this.projectileGroup = this.scene.physics.add.group(); // Phaser group to manage projectiles
        this.friendlyProjectileGroup = this.scene.physics.add.group(); // Phaser group to manage projectiles

        // Initialise Managers
        
        // Scenery Manager
        this.EnvironmentManager = new EnvironmentManager(this.scene, this)
        // Terrain Manager
        this.terrainManager = new TerrainManager(this.scene, this) 
        // Obstacle Manager
        this.obstacleManager = new ObstaclesManager(this.scene, this)
        // Loot Manager
        this.lootManager = new LootManager(this.scene, this)
        // Enemy Manager
        this.enemyManager = new EnemyManager(this.scene, this, this.scene.monsterList)
        // Avatar Manager
        console.log('Getting Avatar: ' + this.region)
        this.avatarManager = new AvatarManager(this.scene, this, this.region, this.scene.scale.width * 0.1, 0, this.input);
        // Camera Manager
        this.cameraManager = new CameraManager(this.scene, this)
        
        // UI Manager
        this.uiManager = new UIManager(this.scene, this)

        // Add Colliders
        this.addColliders()

        // Camera Set Up
        // this.stageManager.cameraManager.mainCamera.startFollow(this.sprite, true, 0.1, 0.1)
        // // Optional: Add a "deadzone" (an area where the player can move without moving the camera)
        // this.stageManager.cameraManager.mainCamera.setDeadzone(500, 250); // 200x150 deadzone area
        // this.stageManager.cameraManager.mainCamera.setFollowOffset(-100, 0); // Offsets the camera 100 pixels to the left
        this.cameraManager.mainCamera.startFollow(this.avatarManager.sprite, true, 0.1, 0.1)

        const startTerrain = this.terrainManager.generateTerrain(0, 'low', 'max', 'normal', false, true, null, false)
        const tileSprite = startTerrain.getData('tileSprite'); // Access the associated tileSprite

        //tileSprite.setTint(0x800080); // Apply a purple tint to the sprite

        this.scene.tweens.add({
            targets: [startTerrain, tileSprite], // Include all related sprites
            alpha: { from: 1, to: 0.85 }, // Gentle flashing
            //y: startTerrain.y - 25, // Floating effect
            ease: 'Sine.easeInOut', // Smooth motion
            duration: 1000, // Duration for one cycle
            yoyo: true, // Oscillate back and forth
            repeat: -1, // Loop indefinitely
        });

        const starterMajorReward = this.scene.physics.add.sprite(this.scene.scale.width * 0.3, startTerrain.y - this.scene.scale.height * 0.3).setOrigin(0.5).setDisplaySize(this.scene.scale.width * 0.1,this.scene.scale.width * 0.1).setDepth(8);
        starterMajorReward.body.setImmovable(true);
        starterMajorReward.body.allowGravity = false;
    

        // Play the coin animation immediately after creating the loot sprite
        starterMajorReward.anims.play('animation_MajorReward');  // Start the animation created earlier


        this.terrainManager.generateTerrainSequence(startTerrain.x + startTerrain.displayWidth, 'ground', 1)
        this.terrainManager.generateTerrainSequence(startTerrain.x + startTerrain.displayWidth + Phaser.Math.Between(-500, 2000), 'low')
        this.terrainManager.generateTerrainSequence(startTerrain.x + startTerrain.displayWidth + Phaser.Math.Between(-250, 3000), 'medium')
        this.terrainManager.generateTerrainSequence(startTerrain.x + startTerrain.displayWidth + Phaser.Math.Between(-50, 5000), 'high')
        console.log(this.scene);
        // Add check in the update method
        this.scene.events.on('update', () => {
            if (this.avatarManager.sprite.x >= starterMajorReward.x && !this.stageStart) { 
            this.scene.scene.pause(); // Pause this scene
            this.scene.scene.launch('BlessingsScreen',{ mainScene: this, avatar: this.avatarManager }); // Launch the pause menu scene
            this.scene.scene.bringToTop('BlessingsScreen');
                
                //console.log('Start Terrain moved off-screen, stageStart set to true');
            } else if (startTerrain && starterMajorReward && this.stageStart && !this.starterBlessingSelected){
                this.starterBlessingSelected = true
                this.avatarManager.mode = 0
                this.cameraManager.mainCamera.flash(500, 48, 25, 52)
                starterMajorReward.destroy()

                
            }

        });

        

    }

    addColliders() {
        // Add a collider for each terrain group with the player
        Object.values(this.terrainGroups).forEach(group => {
            this.scene.physics.add.collider(this.avatarManager.sprite, group);
        });
        // Add a collider for each obstacle group with the player
        Object.values(this.obstacleGroups).forEach(group => {
            this.scene.physics.add.collider(this.avatarManager.sprite, group, (avatarSprite, obstacle) => this.obstacleManager.obstacleCollision(this.avatarManager,obstacle), null, this);
        });

        // Add a collider for each loot group with the player
        Object.values(this.lootGroups).forEach(group => {
            this.scene.physics.add.overlap(this.avatarManager.sprite, group, (avatarSprite, loot) => this.lootManager.lootCollision(this.avatarManager,loot), null, this);
        });

        // Add a collider for each enemy group with the player
        Object.values(this.enemyGroups).forEach(group => {
            this.scene.physics.add.overlap(this.avatarManager.sprite, group, (avatarSprite, enemy) => this.enemyManager.enemyCollision(this.avatarManager,enemy), null, this);
        });

        // Add a clollider for avatar and enemy projectiles
        this.scene.physics.add.overlap(this.avatarManager.sprite, this.projectileGroup, (avatarSprite, projectile) => this.avatarManager.takeHit(projectile.damage, projectile), null, this);

        // Add a collider for each enenmy group with the terrain group
        // Loop over each terrain type
            for (let terrainType in this.terrainGroups) {
                // Loop over each enemy group
                for (let enemyType in this.enemyGroups) {
                    // Set up the collider between terrain and enemy
                    this.scene.physics.add.collider(
                        this.terrainGroups[terrainType], 
                        this.enemyGroups[enemyType], 
                        //this.handleCollision, 
                        //null, 
                        //this
                    );
                }
            }

         // Loop through each enemy group
            // Object.keys(this.enemyGroups).forEach(groupKey => {
            //     const group = this.enemyGroups[groupKey];
                
            //     // Create the collider between this group and the enemy projectile group
            //     this.scene.physics.add.collider(group, this.projectileGroup, (enemy, projectile) => {
            //         this.enemyManager.enemyTakeHit(enemy, projectile);
            //     });
            // });

        // Loop through each enemy group
        Object.keys(this.enemyGroups).forEach(groupKey => {
            const group = this.enemyGroups[groupKey];
            
            // Create the collider between this group and the friendly projectile group
            this.scene.physics.add.overlap(group, this.friendlyProjectileGroup, (enemy, projectile) => {
                this.enemyManager.enemyTakeHit(enemy, projectile);
            });
        });

    }

    update(time, delta){
        this.manageStage(time, delta)
    }

        manageStage(time, delta){

            // Sub Managers
            this.cameraManager.update()
            this.avatarManager.update(time, delta); // Call avatar update to manage state
            this.terrainManager.update(time, delta)
            this.obstacleManager.update()
            this.lootManager.update()
            this.enemyManager.update()
            this.uiManager.update()

            // Stage Management
            if(this.avatarManager.sprite.y > this.scene.scale.height){

                this.avatarManager.takeHit(150)

                if(this.avatarManager.currentHealth > 0){
                    
                    this.avatarManager.sprite.y = 0
                    this.avatarManager.sprite.x = this.scene.scale.width * 0.3
                    // Respawn invincibility
                    this.avatarManager.canBeHurt = false
                    this.scene.tweens.add({
                        targets: this.avatarManager.sprite,
                        alpha: { from: 1, to: 0.1 },
                        duration: 100,
                        yoyo: true,
                        repeat: 10,
                        onComplete: () => {
                            this.avatarManager.sprite.setAlpha(1)
                            this.avatarManager.canBeHurt = true
                        }
                    });

                    // Flash the camera red
                    this.cameraManager.mainCamera.flash(150, 255, 0, 0); // duration: 200ms, RGB: full red
                }          
            }

            if(this.avatarManager.mode == 0){
                this.baseSpeed = (this.avatarManager.traversalSpeed * (this.avatarManager.traversalSpeedModifier / 100)) + this.addedSpeed
            } else {
                this.baseSpeed = 0
            }
            

            if(this.stageStart){
                this.stageProgress += this.baseSpeed
            }
            
            this.uiManager.updateProgressBar(this.uiManager.progressBar, this.stageProgress,this.stageLength)
            if(this.stageProgress > this.stageLength ){
                this.stage += 1
                this.stageProgress = 0
                this.scene.incrementLevel()
            }

        }

}

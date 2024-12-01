import { config } from './config.js';

import Start from './scenes/Start.js';
import Base from './scenes/Base.js';
import Badlands from './scenes/Badlands.js';

// Add scenes to the configuration
config.scene.push(Start);
config.scene.push(Base);
config.scene.push(Badlands);

// Initialize the game
const game = new Phaser.Game(config);

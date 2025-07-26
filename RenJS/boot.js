console.log('🚀 Boot.js with smart choice detection...');

// Create the RenJS plugin using the correct Plugin class
class DataCollectionPlugin extends RenJS.Plugin {
  constructor(name, game) {
    super(name, game);
    this.googleScriptUrl = 'https://script.google.com/macros/s/AKfycbyJbVOpUz8nY2VGuBvrxMOWX6AHEYCI1PZa4t4TzqcrHNiQe0OP_9nkdXqL--AQb3Hi/exec';
    this.lastChoiceTime = 0;
    this.choiceDelay = 2000; // 2 seconds delay between recording choices
    this.recordedAnswers = new Set(); // Track what we've already recorded
    console.log('📊 DataCollectionPlugin (RenJS) initialized with URL:', this.googleScriptUrl);
  }

  onInit() {
    console.log('🚀 DataCollectionPlugin onInit called');
  }

  onStart() {
    console.log('🎮 DataCollectionPlugin onStart called');
  }

  onCall(params) {
    console.log('📞 onCall triggered with params:', params);
  }

  onAction(action) {
    // Look for specific action types that might contain our data
    if (action.actionType === 'choice') {
      console.log('🎯 Choice action detected - analyzing for actual selections');
    }
    
    // Deep search for recordAnswer anywhere in the action object
    this.searchForRecordAnswer(action, 'action');
    
    // Look for trackScene actions
    this.searchForTrackScene(action, 'action');

    // Check for any custom action types
    if (action.actionType && !['play', 'show', 'say', 'wait', 'choice', 'scene', 'hide', 'effect', 'askQuestion'].includes(action.actionType)) {
      console.log('🔍 Unknown action type detected:', action.actionType, action);
    }
  }

  // Smart search that only records when a choice is actually being executed
  searchForRecordAnswer(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;
    
    // Avoid infinite recursion
    if (path.split('.').length > 5) return;
    
    try {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const currentPath = path ? `${path}.${key}` : key;
        
        if (key === 'recordAnswer') {
          // Only record if this seems to be an actual choice execution
          if (this.shouldRecordAnswer(value, currentPath)) {
            console.log('🎯 Recording answer from path:', currentPath, 'value:', value);
            this.recordAnswer(value);
          } else {
            console.log('⏭️ Skipping recordAnswer (not an actual choice):', currentPath);
          }
        }
        
        // Search deeper
        if (value && typeof value === 'object' && value !== obj) {
          this.searchForRecordAnswer(value, currentPath);
        }
      });
    } catch (error) {
      // Ignore circular reference errors
    }
  }

  shouldRecordAnswer(answerData, path) {
    const now = Date.now();
    
    // Create a unique key for this answer
    const answerKey = `${answerData.scene}_${answerData.question}_${answerData.answer}`;
    
    // Don't record if we already recorded this exact answer recently
    if (this.recordedAnswers.has(answerKey)) {
      return false;
    }
    
    // Don't record if we recorded something very recently (prevents multiple recordings)
    if (now - this.lastChoiceTime < this.choiceDelay) {
      return false;
    }
    
    // Check if this looks like an actual choice execution vs. choice loading
    // Choices being executed typically have different path patterns
    const isActualChoice = (
      path.includes('body') && // Choice content
      !path.includes('game.story') // Not just story data being loaded
    );
    
    if (isActualChoice) {
      // Record this answer and update tracking
      this.recordedAnswers.add(answerKey);
      this.lastChoiceTime = now;
      
      // Clean up old recorded answers (keep only last 10)
      if (this.recordedAnswers.size > 10) {
        const oldestKey = this.recordedAnswers.values().next().value;
        this.recordedAnswers.delete(oldestKey);
      }
      
      return true;
    }
    
    return false;
  }

  searchForTrackScene(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;
    
    // Avoid infinite recursion
    if (path.split('.').length > 5) return;
    
    try {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const currentPath = path ? `${path}.${key}` : key;
        
        if (key === 'trackScene') {
          // Only log trackScene once per scene
          console.log('📍 Scene tracked:', value);
        }
        
        // Search deeper
        if (value && typeof value === 'object' && value !== obj) {
          this.searchForTrackScene(value, currentPath);
        }
      });
    } catch (error) {
      // Ignore circular reference errors
    }
  }

  // Helper function to get the player's name
  getPlayerName() {
    try {
      // Try different variable names that might contain the player's name
      const vars = this.game.managers.logic.vars;
      
      // Check for TextInput plugin name format
      if (vars.TextInputName_player) {
        return vars.TextInputName_player;
      }
      
      // Check for other common variable names
      if (vars.playerName) {
        return vars.playerName;
      }
      
      if (vars.username) {
        return vars.username;
      }
      
      if (vars.name) {
        return vars.name;
      }
      
      // Try to get the display name from the player character
      if (this.game.managers.character.characters.player && 
          this.game.managers.character.characters.player.config.displayName) {
        const displayName = this.game.managers.character.characters.player.config.displayName;
        // Only return if it's not the default "Player"
        if (displayName && displayName !== 'Player') {
          return displayName;
        }
      }
      
      console.log('🤷 No player name found in variables:', Object.keys(vars));
      return 'Anonymous';
    } catch (error) {
      console.error('❌ Error getting player name:', error);
      return 'Anonymous';
    }
  }

  recordAnswer(params) {
    console.log('📊 Recording selected answer:', params);

    // Get the player's name
    const playerName = this.getPlayerName();
    console.log('👤 Player name found:', playerName);
    
    const data = {
      playerName: playerName,
      scene: params.scene || 'unknown',
      question: params.question || 'no question',
      answer: params.answer || 'no answer',
      timestamp: new Date().toISOString()
    };
    
    console.log('📤 Data to send:', data);
    this.sendToGoogleScript(data);
  }

  trackScene(params) {
    console.log('📍 Tracking scene:', params);
  }

  async sendToGoogleScript(data) {
    try {
      if (!this.googleScriptUrl || this.googleScriptUrl.includes('YOUR_WEB_APP_URL_HERE')) {
        console.log('⚠️ Google Apps Script URL not configured');
        console.log('💡 Please update googleScriptUrl in DataCollectionPlugin');
        console.log('📋 Would send this data:', data);
        return;
      }
      
      console.log('📤 Sending to Google Apps Script:', data);
      
      const response = await fetch(this.googleScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      // Note: no-cors mode means we can't read the response
      if (response.type === 'opaque') {
        console.log('✅ Data sent successfully (no-cors mode)');
        console.log('📋 Check your Google Sheet to verify data was saved');
      } else {
        const result = await response.text();
        console.log('📡 Response:', result);
        
        try {
          const parsedResult = JSON.parse(result);
          if (parsedResult.success) {
            console.log('✅ Data sent successfully to Google Sheets');
          } else {
            console.error('❌ Google Apps Script error:', parsedResult.error);
          }
        } catch (parseError) {
          console.error('❌ Could not parse response:', result);
        }
      }
      
    } catch (error) {
      console.error('❌ Network error:', error);
    }
  }

  onEndScene(params) {
    console.log('🎬 Scene ended:', params);
  }

  onTeardown() {
    console.log('🧹 DataCollectionPlugin teardown');
  }
}

const RenJSConfig = {
  'name': 'Quickstart',
  'w': 800,
  'h': 600,
  'renderer': Phaser.AUTO,
  'scaleMode': Phaser.ScaleManager.SHOW_ALL,
  'loadingScreen': {
    'background': 'assets/gui/loaderloaderbackground.png',
    'loadingBar': {
      'asset': 'assets/gui/loaderloading-bar.png',
      'position': {
        'x': 109,
        'y': 458
      },
      'size': {
        'w': 578,
        'h': 82
      }
    }
  },
  'fonts': 'assets/gui/fonts.css',
  'guiConfig': 'story/GUI.yaml',
  'storyConfig': 'story/Config.yaml',
  'storySetup': 'story/Setup.yaml',
  'storyText': [
    'story/Story.yaml'
  ],
  'logChoices': true,
}

const RenJSGame = new RenJS.game(RenJSConfig);

// Add the plugin to the RenJS plugin system after game creation
console.log('🔌 Adding plugin to RenJS...');
const dataPlugin = new DataCollectionPlugin('DataCollection', RenJSGame);

// Add to the RenJS plugin system
if (RenJSGame.pluginsRJS) {
  RenJSGame.pluginsRJS.DataCollection = dataPlugin;
  console.log('✅ Plugin added to pluginsRJS');
}

// Launch the game
RenJSGame.launch();

// Manual test with Google Apps Script URL check
window.testRecordAnswer = function() {
  console.log('🧪 Testing recordAnswer function...');
  dataPlugin.recordAnswer({
    scene: 'manual_test',
    question: 'Manual test question',
    answer: 'Manual test answer'
  });
};

// Function to update Google Apps Script URL
window.setGoogleScriptUrl = function(url) {
  // Update both instances
  dataPlugin.googleScriptUrl = url;
  if (RenJSGame.pluginsRJS && RenJSGame.pluginsRJS.DataCollection) {
    RenJSGame.pluginsRJS.DataCollection.googleScriptUrl = url;
  }
  console.log('✅ Google Apps Script URL updated to:', url);
  console.log('💡 Now test with: testRecordAnswer()');
};

// Function to manually check what player name is detected
window.checkPlayerName = function() {
  console.log('👤 Current player name:', dataPlugin.getPlayerName());
  console.log('📋 All game variables:', dataPlugin.game.managers.logic.vars);
};

console.log('🎮 Game launched with smart choice detection and name collection');
console.log('💡 This version captures player names and includes them in the database');
console.log('💡 To test manually, use: testRecordAnswer()');
console.log('💡 To check player name, use: checkPlayerName()');
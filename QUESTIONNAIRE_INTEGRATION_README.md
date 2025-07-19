# Story Question Integration with RenJS

## Overview
This integration adds direct question and answer tracking to your RenJS game, allowing you to collect player responses directly from the story flow and save them to Google Sheets.

## Files Added/Modified

### New Files:
- `questionnaire-integration.js` - RenJS integration script for direct questions
- `google-apps-script.js` - Google Sheets backend
- `QUESTIONNAIRE_INTEGRATION_README.md` - This documentation

### Modified Files:
- `index.html` - Added question integration script
- `story/Story.yaml` - Added direct questions and answer tracking

## How It Works

### 1. Story Integration
The questionnaire is triggered through custom actions in your `Story.yaml`:

```yaml
- triggerQuestionnaire:
    message: "Your custom message here"
```

### 2. Available Actions

#### Basic Questionnaire Trigger
```yaml
- triggerQuestionnaire:
    message: "Please share your feedback!"
```

#### Chapter Completion
```yaml
- completeChapter:
    chapter: 1
```

#### Game Completion
```yaml
- completeGame:
    message: "Game completed! Please share your experience!"
```

#### Choice Feedback
```yaml
- choiceFeedback:
    choice: "Save the character"
```

### 3. Integration Points in Your Game

The questionnaire is triggered at these moments:

1. **After Player Choices** - When players make important decisions
2. **Chapter Completion** - After completing story chapters
3. **Game Completion** - At the end of the game
4. **Atmosphere Changes** - When switching between different backgrounds/moods

## Setup Instructions

### 1. Google Sheets Setup
- Create a Google Sheet for collecting responses
- Copy the Spreadsheet ID from the URL
- Update `google-apps-script.js` with your Spreadsheet ID
- Deploy the Google Apps Script as a web app

### 2. Questionnaire Configuration
- Update `questionnaire.html` with your Google Apps Script Web App URL
- Customize questions based on your game's assets and story

### 3. Game Integration
- The integration script is already included in `index.html`
- Add questionnaire triggers to your `Story.yaml` at desired points

## Customization

### Adding New Questions
1. Edit `questionnaire.html` to add new questions
2. Update `google-apps-script.js` to handle new fields
3. Update the headers in the `setupHeaders()` function

### Changing Trigger Messages
Modify the `message` parameter in your `Story.yaml`:

```yaml
- triggerQuestionnaire:
    message: "Your custom message here"
```

### Styling
- Modify CSS in `questionnaire.html` to match your game's theme
- Update colors, fonts, and layout as needed

## Testing

### Test the Integration
1. Open `test-questionnaire.html` in your browser
2. Use the test buttons to simulate different scenarios
3. Verify that data appears in your Google Sheet

### Test in Game
1. Run your game normally
2. Make choices and progress through the story
3. Check that questionnaires appear at the right moments
4. Verify that responses are saved to Google Sheets

## Troubleshooting

### Common Issues

1. **Questionnaire doesn't appear**
   - Check browser console for JavaScript errors
   - Verify that `questionnaire-integration.js` is loaded
   - Ensure RenJS is properly initialized

2. **Data not saving to Google Sheets**
   - Verify Google Apps Script URL is correct
   - Check that Google Apps Script is deployed with "Anyone" access
   - Verify Spreadsheet ID is correct

3. **Integration script not loading**
   - Check that `questionnaire-integration.js` is included in `index.html`
   - Ensure the file path is correct

### Debug Mode
Add this to your browser console to enable debug logging:

```javascript
localStorage.setItem('questionnaireDebug', 'true');
```

## Advanced Features

### Conditional Questionnaires
You can make questionnaires appear based on game state:

```yaml
- if: playerChoice == "save"
  - triggerQuestionnaire:
      message: "You chose to save. How do you feel about this decision?"
```

### Multiple Questionnaires
You can have different questionnaires for different situations:

```yaml
- triggerQuestionnaire:
    message: "Chapter 1 feedback"
    type: "chapter"
- triggerQuestionnaire:
    message: "Choice feedback"
    type: "choice"
```

### Analytics
The Google Apps Script includes an `analyzeResponses()` function that:
- Calculates response percentages
- Generates average ratings
- Creates visual charts
- Exports data for further analysis

## Security Considerations

- The current setup allows anyone to submit responses
- Consider adding rate limiting to prevent spam
- You can restrict access to specific domains if needed
- All data is stored in your Google Sheet (you control access)

## Next Steps

Once the basic integration is working, consider:

1. **A/B Testing** - Use different questionnaires for different player groups
2. **Real-time Analytics** - Set up automated reports and notifications
3. **Player Segmentation** - Collect data to understand different player types
4. **Iterative Improvement** - Use feedback to continuously improve your game

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all URLs and IDs are correct
3. Test each component individually
4. Check Google Apps Script logs for server-side errors 
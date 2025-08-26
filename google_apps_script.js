// Complete Working Google Apps Script for Game Data Collection with Dynamic Headers
// Deploy this as a web app

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: 'Web app is running',
      message: 'Send POST requests with game data',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    // Check if we received POST data
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          error: 'No POST data received' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Parse the data
    const data = JSON.parse(e.postData.contents);

    // Open your spreadsheet
    const spreadsheetId = '1k-crAMox3-H4Y2D6KcwMT5KTlIvnHq5VKoK591RzcPk';
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);

    // Get or create the sheet
    let sheet = spreadsheet.getSheetByName('Game Answers');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Game Answers');
      // Initialize with basic headers
      sheet.getRange('A1:C1').setValues([['Timestamp', 'Name', 'Phone Number']]);
      sheet.getRange('A1:C1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
    }

    // Extract player info and question data
    const playerName = data.playerName || data.name || 'Anonymous';
    const phoneNumber = data.phoneNumber || '';
    const question = data.question || 'No question';
    const answer = data.answer || 'No answer';
    const today = new Date().toDateString(); // Use date for session grouping

    // Find or create player row
    let playerRow = findPlayerRow(sheet, playerName, today);
    
    if (!playerRow) {
      // Create new row for this player
      const timestamp = new Date().toISOString();
      sheet.appendRow([timestamp, playerName, phoneNumber]);
      playerRow = sheet.getLastRow();
    }

    // Determine question number from the question text or use a counter
    const questionNumber = extractQuestionNumber(question, sheet, playerRow);
    
    // Update headers if needed
    updateHeadersForQuestion(sheet, questionNumber);
    
    // Update the player's row with the new question-answer
    updatePlayerAnswer(sheet, playerRow, questionNumber, question, answer);

    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Data saved successfully',
        savedData: {
          timestamp: new Date().toISOString(),
          name: playerName,
          phoneNumber: phoneNumber,
          questionNumber: questionNumber,
          question: question,
          answer: answer,
          row: playerRow
        }
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function findPlayerRow(sheet, playerName, today) {
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) { // Start from row 2 (skip header)
    const rowPlayerName = data[i][1]; // Column B (Name)
    const rowTimestamp = data[i][0]; // Column A (Timestamp)
    
    // Check if this is the same player on the same day
    if (rowPlayerName === playerName) {
      const rowDate = new Date(rowTimestamp).toDateString();
      if (rowDate === today) {
        return i + 1; // Return 1-based row number
      }
    }
  }
  
  return null; // Player not found
}

function extractQuestionNumber(question, sheet, playerRow) {
  // Try to extract question number from the question text
  const questionMatch = question.match(/question\s*(\d+)/i);
  if (questionMatch) {
    return parseInt(questionMatch[1]);
  }
  
  // If no number found, count existing questions for this player
  const playerData = sheet.getRange(playerRow, 1, 1, sheet.getLastColumn()).getValues()[0];
  let questionCount = 0;
  
  // Count existing question columns (every 2 columns starting from column 4)
  for (let col = 3; col < playerData.length; col += 2) { // Start from column D (index 3)
    if (playerData[col] && playerData[col] !== '') {
      questionCount++;
    }
  }
  
  return questionCount + 1; // Next question number
}

function updateHeadersForQuestion(sheet, questionNumber) {
  const questionColIndex = 3 + (questionNumber - 1) * 2; // Column D, F, H, etc.
  const answerColIndex = questionColIndex + 1; // Column E, G, I, etc.
  
  const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Check if we need to add new headers
  if (currentHeaders.length < answerColIndex) {
    const questionHeader = `Question ${questionNumber}`;
    const answerHeader = `Answer ${questionNumber}`;
    
    // Add the question header
    sheet.getRange(1, questionColIndex).setValue(questionHeader);
    sheet.getRange(1, questionColIndex).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
    
    // Add the answer header
    sheet.getRange(1, answerColIndex).setValue(answerHeader);
    sheet.getRange(1, answerColIndex).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
    
    console.log(`Added headers: ${questionHeader}, ${answerHeader}`);
  }
}

function updatePlayerAnswer(sheet, playerRow, questionNumber, question, answer) {
  const questionColIndex = 3 + (questionNumber - 1) * 2; // Column D, F, H, etc.
  const answerColIndex = questionColIndex + 1; // Column E, G, I, etc.
  
  // Update the question and answer cells
  sheet.getRange(playerRow, questionColIndex).setValue(question);
  sheet.getRange(playerRow, answerColIndex).setValue(answer);
  
  console.log(`Updated row ${playerRow}: Question ${questionNumber} in column ${questionColIndex}, Answer in column ${answerColIndex}`);
}
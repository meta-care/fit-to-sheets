// add your Google API Project OAuth client ID and client secret here
var ClientID = '';
var ClientSecret = '';

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('MetaCare')
      .addItem('Authorize', 'showSidebar')
      .addItem('Get Data from Yesterday', 'getMetrics')
      .addItem('Reset', 'clearProps')
      .addToUi();
}

//Get data just from yesterday
function getMetrics() {
  getMetricsForDays(1, 1, 'Data');
}

//Get data in function of any day. And can write on any tab
function getMetricsForDays(fromDaysAgo, toDaysAgo, tabName) {
  //Time management
  var start = new Date();
  start.setHours(0,0,0,0);
  start.setDate(start.getDate() - toDaysAgo);

  var end = new Date();
  end.setHours(23,59,59,999);
  end.setDate(end.getDate() - fromDaysAgo);
  
  var fitService = getFitService();
  
  //Ask for the data to pull
  var request = {
    "aggregateBy": [
      {
        "dataTypeName": "com.google.heart_rate.bpm"
      },
    ],
    "bucketByTime": { "durationMillis": 60000 }, // will look at the data for each minutes
    "startTimeMillis": start.getTime(),
    "endTimeMillis": end.getTime()
  };
  
  var response = UrlFetchApp.fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
    headers: {
      Authorization: 'Bearer ' + fitService.getAccessToken()
    },
    'method' : 'post',
    'contentType' : 'application/json',
    'payload' : JSON.stringify(request, null, 2)
  });
  
  var json = JSON.parse(response.getContentText());
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(tabName);
  
  // This loop will write all the data it find on the google sheet
  for(var b = 0; b < json.bucket.length; b++) {
    var bucketDate = new Date(parseInt(json.bucket[b].startTimeMillis, 10));
    
    var heartRate = -1;

    if (json.bucket[b].dataset[0].point.length > 0) {
      heartRate = json.bucket[b].dataset[0].point[0].value[0].fpVal;
    }
    
    sheet.appendRow([bucketDate, 
      heartRate == -1 ? ' ' : heartRate,]);
  }
}

// functions below adapted from Google OAuth example at https://github.com/googlesamples/apps-script-oauth2
function getFitService() {
  // Create a new service with the given name. The name will be used when
  // persisting the authorized token, so ensure it is unique within the
  // scope of the property store.
  return OAuth2.createService('fit')

      // Set the endpoint URLs, which are the same for all Google services.
      .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
      .setTokenUrl('https://accounts.google.com/o/oauth2/token')

      // Set the client ID and secret, from the Google Developers Console.
      .setClientId(ClientID)
      .setClientSecret(ClientSecret)

      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')

      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties())

      // Set the scopes to request (space-separated for Google services).
      // see https://developers.google.com/fit/rest/v1/authorization for a list of Google Fit scopes
      .setScope('https://www.googleapis.com/auth/fitness.heart_rate.read')

      // Below are Google-specific OAuth2 parameters.

      // Sets the login hint, which will prevent the account chooser screen
      // from being shown to users logged in with multiple accounts.
      .setParam('login_hint', Session.getActiveUser().getEmail())

      // Requests offline access.
      .setParam('access_type', 'offline')

      // Forces the approval prompt every time. This is useful for testing,
      // but not desirable in a production application.
      //.setParam('approval_prompt', 'force');
}

//Create the sidebar at the right of the google sheet when we press the 'Authorize' Button
function showSidebar() {
  var fitService = getFitService();
  if (!fitService.hasAccess()) {
    var authorizationUrl = fitService.getAuthorizationUrl();
    var template = HtmlService.createTemplate(
        '<a href="<?= authorizationUrl ?>" target="_blank">Authorize</a> ' +
        'Close this after you have finished.');
    template.authorizationUrl = authorizationUrl;
    var page = template.evaluate();
    SpreadsheetApp.getUi().showSidebar(page);
  } else {
  // ...
  }
}

//Create the page at the end of the Authorization process
function authCallback(request) {
  var fitService = getFitService();
  var isAuthorized = fitService.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}

// Reset function. After using it, we just have to do click the Authorize button again
function clearProps() {
  PropertiesService.getUserProperties().deleteAllProperties();
}
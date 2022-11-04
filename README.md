# Export your Google Fit data to a Google Sheet
This document explains how to automatically store your heart rate data from google fit to a google sheet.

1400 values are added to the sheet each days. It represent the heart rate value for each minutes in a day.

This process has to be done for each user separately, this is only for test purposes and for the MVP. To get a real user friendly version, we would have to make a real app or website that call the google OAuth and that retrieve data directly. We could even automatically store the data on the user google drive, and retrieve it when needed. The user would only have to connect himself one time to the app for the process to work continously.

For now, the process work only with heart rate data, but we can add  [any other data](https://developers.google.com/fit/rest/v1/reference/users/dataSources/list?apix_params=%7B%22userId%22%3A%22me%22%7D#auth) we want to the list. 

This document is an updated and personnalized version from [this blog post](https://ithoughthecamewithyou.com/post/export-google-fit-daily-steps-to-a-google-sheet). Its comment section is very interessant to get more informations and solutions to specific problems.

Here is a [bonus link](https://www.youtube.com/watch?v=K6Vcfm7TA5U) to help us retrieve data from a google spreadsheets database.

Here is [my own SpreadSheet](https://docs.google.com/spreadsheets/d/12CTPTdHFmDSurdKtTZ0iR_dFSFZgWwyHsUUgnZ6olfE).

.

# How to manually add data using google fit ?
If you don't have a smart watch, you will need to add heart rate data manually to be able to see it on your sheet.

1) Install and sign in the [google fit app](https://play.google.com/store/apps/details?id=com.google.android.apps.fitness)


2) Click on the 'Browse' tab in the bottom navigation bar. Then click on 'Vitals'.

3) Click on the '+' button at the top right corner of the screen. And choose 'heart rate'.

4) Choose the data you want, and click save.

.

# How to install it:

- Create a new spreadsheet in your Google Drive.

- Rename the first tab 'Data'. Enter 'Date' in cell A1, and 'Heart Rate' in B1.

- Click on 'App Script' from the Extensions menu. Give the Apps Script project a name.

- Click on the '+' button next to 'Libraries'. Enter this script ID : '1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF'. Click on 'Look up' and click 'Add'.

- Go on the project Settings, go down, copy your Script ID, and save it somewhere. (It's a long series of letters and numbers).

- Go on the [Google API Console](https://console.cloud.google.com/apis/dashboard). Create a new project. 

- Click on [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent) and create one. The only field you need to enter is the name and the email address. You can skip everything else.

- From the [Credentials page](https://console.cloud.google.com/apis/credentials), click 'Create Credentials', and 'OAuth client ID'. Find and select the Fitness API. Then choose Web Application as the application type. The redirect URL is https://script.google.com/macros/d/SCRIPTID/usercallback Replace 'SCRIPTID' with the actual Script ID you made a note of above. After adding this, make a note of the Client ID and Client Secret.

- Go back to the apps script project and paste the code from [Code.gs](https://github.com/meta-care/fit-to-sheets/blob/main/Code.gs) into the code window.

- At the top of the code there are spaces to enter the Client ID and Client Secret from the API Console. Enter these and save the project.

- Go back to your Google Sheet and reload. There will be a new MetaCare menu item. First select 'Authorize'. You'll get a screen to authorize the script and then a sidebar with a link. Click the link to authorize the script to access your Google Fit data.

- Select 'Get Data from Yesterday' from the MetaCare menu. You should see new rows added to the spreadsheet with yesterday's date and heart rate minutes by minutes. 

- To automate pulling in the data, go back to the apps script project and go on the triggers page in the left menu. Add a trigger to run getMetrics() as a time driven day timer. I recommend between 5 and 6am. You can also click notifications to add an email alert if anything goes wrong.

.

### You're all set! Every day the spreadsheet will automatically update with your heart rate data from the day before.

If the heart rate data is blank, this is only because google fit didn't save data at this precise moment. But it will be visible at the moments where you added some data.

If you got errors, try clicking on the 'Reset' button, and then on the 'Authorize' button. You can also go on your [Google connected apps](https://myaccount.google.com/permissions) and remove the permissions of the connected script.

.

# Things we need to improve on this system :

- Add functions in the sheet to get daily data (average, maximum, minimum...) To send less data through Chainlink

- Connect it to Chainlink external adapter

- Only add a line on the sheet when there is data ? To not have 1400 empty lines when we are just testing with few values manually entered in google fit

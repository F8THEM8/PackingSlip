const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// Load client secrets from the credentials file
const credentials = JSON.parse(fs.readFileSync('credentials.json'));

const SCOPES = ['https://www.googleapis.com/auth/drive.file']; // Modify this based on your API scope requirements
const TOKEN_PATH = 'token.json';

// Create an OAuth2 client
const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Check if we have previously stored a token
fs.readFile(TOKEN_PATH, (err, token) => {
  if (err) return getNewToken(oAuth2Client);
  oAuth2Client.setCredentials(JSON.parse(token));
  console.log('Token already exists!');
});

// Get a new token if none exists
function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);

      // Store the token to disk for later use
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log('Token stored to', TOKEN_PATH);
    });
  });
}

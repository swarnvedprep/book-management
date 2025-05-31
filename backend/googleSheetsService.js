const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  credentials: {
  type: "service_account",
  project_id: "unique-arbor-460305-b7",
  private_key_id: "eeb8084b6c9dab315bd5ad0ec2069891a469833c",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCQNwBchdkQCF01\nCEv/Aiv2oyeEeZ3uiZ9vlkcs7xHigK8D9XHThl7oVhCSF7gmFoQ3NlzyNexBwOiT\nZkmtFkSe52KGYs8aKddfMDaVwvik/5xw20SknihJEuT63Wyose6mUMStMg1+E9dl\nwdZIeVfBw0RLRMiDW14C5PUbBrF/Gf9peF6XXczmNfDeIJrvS7MT/qsqHms9VoKn\nGKSBi//9t1W8DQ9QMbXX9Js+5lKtNnwuuaxgXHlZV28+PRhOWMDD6f2sUep2gL1Q\nnc36rL5X+xQoDVtPSlkbI3H9PJXuIijoDoQ2ofrtO1L4S+FOOaiccayr7ifLb+sL\nK+EFaEdxAgMBAAECggEAEVaxig40H5m31hZQJ8HTthCd4c8q6ijc9MIvPsNkBbTV\nxe6yr50sSDf/wEbOhrLGlOpJ8LuDsxCdzcn6oe8nUykL1w8mafV9ncXKzETvlsve\nG9H6/eU/f/Cf+9rXE22oHRIhIVcfGOlLCIKOcDJ5lvPSgE+t4WAg7I1pPCV4/eg8\nsB6e0VCcHH7xXQI14WnpQXh5sGiqywBt57cCebbLA8A0x0UBvuiaDeRuYAGzutZG\nposEibcBgDZ0MmtoR36OwnVgdZsEF8ztfOQ15c70VuvVSK7XJTRN/Ep9SfFltHkg\nffeuh1TSQk+BBHysD5u2ax+jZOS83HD4D2KYSjVEOQKBgQDDJHsk1hpMx6eRBQfH\ndfC5G/L5BoL+YmVlpqAK/FZAthLUt5TqTTSWtVMSeGvcxxzuEvmalGZUFhbYgYA9\nvnR+Ka0VdrZ33//qaUMBQpZ9svslshROtNvcPK0aUaWuui3BuOiLD1VMiPHEa18c\niYNlG/owycrUNXNVBDM2hbuw6QKBgQC9MKDXuAO4naeixD+Ntc0sQk1LviuVm7rH\n8l6DIruFW2nkKkpbkrRgws+IAXUKCxbhEKU7+zmI5eTijnf+PC/OoRrnrpimreEH\nem4RqG+HqMZvGIxW70GVqvh+jgN4rj1qxnn8+HyKOel3KHbL2aetzUdze9Kz5Gw6\nuBnmy08NSQKBgGrc4nbUrIhZWYEIAS+QfafRD2ih0UBfP+m/qqr5bn53dq54bhs0\n9lSFrZ1Sxrabb1NMntWw6KypgA9GM6UcVAz246r6XIge6bVDuYbKIUFqrzAAajCD\nyFa9/4mHJrUdjYslqGrmla6Y29TVe7tT7tmCzarEBsfZEXSAHU+BQrxpAoGBAIdW\nXBk1F+RfU2ZKgTQ8k5NPsr+2QLN7fbg/F4EzvXV+mVeRMTQk1EhL0+31LOaMXEeQ\ngsNPyi62VnADfq8uGvzznq2R5r2FsW6KFGcpWO9wutMKeopOCVqpva26pZ0U9/aE\nGQvwLhcrqmmFVsYo45yfNrfUIjxx8UJoJI9HbTuRAoGBALP2x96BYrbMRNX8OM9U\ne/ymdZta8R/alEC6YuvgIvW7rORIwX1NVh6rUQfZdYGYAafllFhEunVcPPExMHJ3\nntImZdzlbRnracWkhIYUObXwpKYbPiYIICOxt+snN1JIwFMS2NLtEH/YNzhz4bCO\nCW7NaVYKnqnPY3/23S+zvgGC\n-----END PRIVATE KEY-----\n",
  client_email: "book-management@unique-arbor-460305-b7.iam.gserviceaccount.com",
  client_id: "103878311316594503735",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/book-management%40unique-arbor-460305-b7.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
},
  // We need to update the scope to include write permission
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Get data from Google Sheet (keeping your original implementation)
async function getSheetData(spreadsheetId, range) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return response.data.values;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
}

// Add new function for updating a specific cell in Google Sheet
async function updateSheetData(spreadsheetId, sheetName, cellNotation, value) {
  try {
    const range = `${sheetName}!${cellNotation}`;
    
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[value]]
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error updating data in Google Sheets:', error);
    throw error;
  }
}

module.exports = {
  getSheetData,
  updateSheetData
};
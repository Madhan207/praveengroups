const axios = require('axios');
const FormData = require('form-data');

async function testUpdate() {
  try {
    const data = new FormData();
    data.append('title', 'Test');
    data.append('subtitle', 'Sub');
    data.append('business', '');
    data.append('position', 'HERO');
    data.append('priority', 0);
    data.append('is_active', true);

    // We can't auth easily from Node without a valid token, so we'll just check if it forms the request correctly.
    console.log("Form data headers:", data.getHeaders());
  } catch (e) {
    console.error(e);
  }
}
testUpdate();

const sendSMS = async (to, message) => {
  console.log('[Mock SMS]');
  console.log(`To: ${to}`);
  console.log(`Message: ${message}`);
  return { success: true };
};

module.exports = { sendSMS };

// const axios = require('axios');

// const sendSMS = async (to, message) => {
//   const data = {
//     sender: 'MSG91', // sender ID (6 characters for India)
//     route: '4',    
//     country: '91',
//     sms: [
//       {
//         message: message,
//         to: [to] // array of numbers
//       }
//     ]
//   };

//   try {
//     const response = await axios.post(
//       'https://api.msg91.com/api/v2/sendsms',
//       data,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'authkey': 'YOUR_AUTH_KEY' // Replace with your MSG91 auth key
//         }
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error sending SMS:', error.response ? error.response.data : error.message);
//     throw error;
//   }
// };

// module.exports = { sendSMS };

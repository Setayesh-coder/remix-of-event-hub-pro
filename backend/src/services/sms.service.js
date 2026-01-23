/**
 * SMS Service - Abstracted for Iranian SMS Providers
 * 
 * This service is designed to be easily connected to any Iranian SMS provider.
 * Currently supports: mock (for development)
 * 
 * To add a new provider:
 * 1. Create a new case in the sendSMS function
 * 2. Implement the provider's API call
 * 3. Update .env with provider credentials
 */

const providers = {
  /**
   * Mock provider for development/testing
   */
  mock: async (phone, message) => {
    console.log('📱 [MOCK SMS]');
    console.log(`   To: ${phone}`);
    console.log(`   Message: ${message}`);
    return { success: true, messageId: `mock-${Date.now()}` };
  },

  /**
   * Kavenegar SMS Provider
   * https://kavenegar.com
   */
  kavenegar: async (phone, message) => {
    const apiKey = process.env.SMS_API_KEY;
    const url = `https://api.kavenegar.com/v1/${apiKey}/sms/send.json`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        receptor: phone,
        message: message,
        sender: process.env.SMS_SENDER || '10004346'
      })
    });
    
    const data = await response.json();
    if (data.return.status !== 200) {
      throw new Error(data.return.message);
    }
    return { success: true, messageId: data.entries[0].messageid };
  },

  /**
   * Melipayamak SMS Provider
   * https://melipayamak.com
   */
  melipayamak: async (phone, message) => {
    const url = 'https://rest.payamak-panel.com/api/SendSMS/SendSMS';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: process.env.SMS_USERNAME,
        password: process.env.SMS_PASSWORD,
        to: phone,
        from: process.env.SMS_SENDER,
        text: message
      })
    });
    
    const data = await response.json();
    if (data.RetStatus !== 1) {
      throw new Error(`SMS failed with status: ${data.RetStatus}`);
    }
    return { success: true, messageId: data.StrRetStatus };
  },

  /**
   * Ghasedak SMS Provider
   * https://ghasedak.me
   */
  ghasedak: async (phone, message) => {
    const url = 'https://api.ghasedak.me/v2/sms/send/simple';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apikey': process.env.SMS_API_KEY
      },
      body: new URLSearchParams({
        receptor: phone,
        message: message,
        linenumber: process.env.SMS_SENDER
      })
    });
    
    const data = await response.json();
    if (data.result.code !== 200) {
      throw new Error(data.result.message);
    }
    return { success: true, messageId: data.items[0] };
  },

  /**
   * SMS.ir Provider
   * https://sms.ir
   */
  smsir: async (phone, message) => {
    const url = 'https://api.sms.ir/v1/send';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.SMS_API_KEY
      },
      body: JSON.stringify({
        mobile: phone,
        templateId: parseInt(process.env.SMS_TEMPLATE_ID),
        parameters: [{ name: 'CODE', value: message }]
      })
    });
    
    const data = await response.json();
    if (data.status !== 1) {
      throw new Error(data.message);
    }
    return { success: true, messageId: data.data.messageId };
  }
};

/**
 * Send SMS using configured provider
 * @param {string} phone - Phone number (11 digits starting with 09)
 * @param {string} message - Message content
 * @returns {Promise<{success: boolean, messageId?: string}>}
 */
async function sendSMS(phone, message) {
  const provider = process.env.SMS_PROVIDER || 'mock';
  
  if (!providers[provider]) {
    console.warn(`⚠️ Unknown SMS provider: ${provider}, falling back to mock`);
    return providers.mock(phone, message);
  }
  
  try {
    const result = await providers[provider](phone, message);
    console.log(`✅ SMS sent via ${provider} to ${phone}`);
    return result;
  } catch (error) {
    console.error(`❌ SMS failed via ${provider}:`, error.message);
    throw error;
  }
}

/**
 * Send OTP code via SMS
 * @param {string} phone - Phone number
 * @param {string} code - OTP code
 */
async function sendOTP(phone, code) {
  const message = `کد تأیید شما: ${code}\nمرکز تحقیقات اپتوالکترونیک`;
  return sendSMS(phone, message);
}

module.exports = {
  sendSMS,
  sendOTP,
  providers: Object.keys(providers)
};

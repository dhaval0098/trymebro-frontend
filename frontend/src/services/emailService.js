import api from './api';

/**
 * Universal Email Sender for React Frontend
 * Automatically routes through your configured API proxy (Vercel / Railway),
 * avoiding duplicate '/api' prefix and CORS issues.
 *
 * @param {Object} emailPayload - Data needed to send the email
 * @param {string} emailPayload.to - Recipient email address
 * @param {string} emailPayload.subject - Subject line
 * @param {string} [emailPayload.text] - Plain text body
 * @param {string} [emailPayload.html] - HTML body
 * @param {string} [emailPayload.type] - Optional template type (e.g., 'order_confirmation', 'contact_inquiry', 'welcome')
 * @returns {Promise<any>}
 */
export const sendEmail = async (emailPayload) => {
  try {
    const response = await api.post('/send-email', emailPayload);
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error.response?.data || error;
  }
};

export default sendEmail;

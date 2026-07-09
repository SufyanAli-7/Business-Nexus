export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}

export function getPasswordResetOtpHtml(email, otp) {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 0 15px rgba(0,0,0,0.1);">
          
          <h1 style="color: black; text-align: center; margin: 0 0 30px 0; font-size: 30px; font-weight: 700; font-family: 'Arial', sans-serif;">Password Reset Request</h1>
          
          <p style="font-family: 'Arial', sans-serif; color: #333;">Dear ${email},</p>
          
          <p style="font-family: 'Arial', sans-serif; color: #333;">We received a request to reset the password for your account. To proceed, please use the One-Time Password (OTP) provided below:</p>
          
          <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #333;">${otp}</span>
          </div>
          
          <p style="font-family: 'Arial', sans-serif; color: #333;">This OTP is valid for the next <strong>10 minutes</strong>.</p>
          
          <p style="font-family: 'Arial', sans-serif; color: #333;">If you did not initiate this request, please ignore this email. Your password will remain unchanged.</p>
          
          <p style="font-family: 'Arial', sans-serif; color: #333;">Best regards,</p>
          <p style="font-family: 'Arial', sans-serif; color: #333;"><strong>E-commerce Platform</strong></p>
        </div>
      </div>
    `;
}
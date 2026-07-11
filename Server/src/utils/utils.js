
export function getPasswordResetMailHtml(url, role, name) {
  const isInvestor = role === 'investor';
  const badgeBg = isInvestor ? '#ecfdf5' : '#e0e7ff';
  const badgeColor = isInvestor ? '#059669' : '#4f46e5';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #334155;">
    <div style="width: 100%; background-color: #f8fafc; padding: 16px 0;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
            <!-- Header -->
            <div style="background-color: #0f172a; padding: 16px 20px; text-align: center;">
                <a href="http://localhost:5173" style="font-size: 20px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: -0.05em;">Nexus<span style="color: #6366f1;">.</span></a>
            </div>
            
            <!-- Content -->
            <div style="padding: 20px 20px;">
                <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 3px 0;">Hello ${name || 'there'},</div>
                <div style="display: inline-block; padding: 2px 6px; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; background-color: ${badgeBg}; color: ${badgeColor}; border-radius: 9999px; margin-bottom: 10px;">${role || 'User'}</div>
                
                <p style="font-size: 13.5px; line-height: 1.45; color: #475569; margin: 0 0 12px 0;">
                    We received a request to reset the password for your Nexus account. Click the button below to secure your account and choose a new password:
                </p>
                
                <!-- Button -->
                <div style="text-align: center; margin: 12px 0;">
                    <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-size: 13.5px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">Reset Password</a>
                </div>
                
                <!-- Security Note -->
                <div style="background-color: #f1f5f9; border-left: 4px solid #94a3b8; padding: 10px 14px; border-radius: 0 6px 6px 0; font-size: 11.5px; line-height: 1.45; color: #64748b; margin: 0;">
                    <strong style="color: #475569;">Security Reminder:</strong> This link will expire in <strong style="color: #475569;">1 hour</strong>. If you did not request this change, you can safely ignore this email; your account remains secure.
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 12px 20px; text-align: center; font-size: 10.5px; color: #64748b; border-top: 1px solid #f1f5f9; line-height: 1.4;">
                This is an automated security notification from Nexus.<br>
                Need help? Contact our <a href="mailto:support@businessnexus.com" style="color: #4f46e5; text-decoration: none;">Support Team</a>.
            </div>
        </div>
    </div>
</body>
</html>
  `;
}


export function getResetPasswordSuccessEmail(role, name) {
  const isInvestor = role === 'investor';
  const badgeBg = isInvestor ? '#ecfdf5' : '#e0e7ff';
  const badgeColor = isInvestor ? '#059669' : '#4f46e5';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #334155;">
    <div style="width: 100%; background-color: #f8fafc; padding: 16px 0;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
            <!-- Header -->
            <div style="background-color: #0f172a; padding: 16px 20px; text-align: center;">
                <a href="http://localhost:5173" style="font-size: 20px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: -0.05em;">Nexus<span style="color: #6366f1;">.</span></a>
            </div>
            
            <!-- Content -->
            <div style="padding: 20px 20px;">
                <!-- Icon -->
                <div style="text-align: center; margin-bottom: 8px;">
                    <svg fill="none" stroke="#10b981" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; width: 40px; height: 40px;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                
                <div style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 3px 0; text-align: center;">Password Reset Successful</div>
                <div style="display: block; width: fit-content; margin: 0 auto 10px auto; padding: 2px 6px; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; background-color: ${badgeBg}; color: ${badgeColor}; border-radius: 9999px;">${role || 'User'}</div>
                
                <p style="font-size: 13.5px; line-height: 1.45; color: #475569; margin: 0 0 12px 0; text-align: center;">
                    Hello ${name || 'there'}, your password has been successfully reset. You can now log back into your Nexus account using your new credentials.
                </p>
                
                <!-- Warning Alert -->
                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 10px 14px; border-radius: 0 6px 6px 0; font-size: 11.5px; line-height: 1.45; color: #991b1b; margin: 0;">
                    <strong style="color: #7f1d1d;">Important Security Alert:</strong> If you did not initiate this password change, please secure your email account and contact our security support team immediately at <a href="mailto:security@businessnexus.com" style="color: #b91c1c; text-decoration: underline; font-weight: 600;">security@businessnexus.com</a>.
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 12px 20px; text-align: center; font-size: 10.5px; color: #64748b; border-top: 1px solid #f1f5f9; line-height: 1.4;">
                This is an automated security notification from Nexus.<br>
                Need help? Contact our <a href="mailto:support@businessnexus.com" style="color: #4f46e5; text-decoration: none;">Support Team</a>.
            </div>
        </div>
    </div>
</body>
</html>
  `;
}
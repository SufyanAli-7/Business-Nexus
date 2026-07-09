
export function getPasswordResetMailHtml(email, url) {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #667eea;
            padding: 30px 20px;
            text-align: center;
        }
        .header-logo {
            font-size: 28px;
            font-weight: bold;
            color: #ffffff;
            text-decoration: none;
        }
        .content {
            padding: 40px 30px;
            text-align: left;
        }
        .greeting {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #333333;
        }
        .description {
            font-size: 16px;
            line-height: 1.6;
            color: #666666;
            margin-bottom: 25px;
        }
        .email-address {
            font-weight: bold;
            color: #333333;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .reset-button {
            display: inline-block;
            padding: 12px 25px;
            background-color: #667eea;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
        }
        .note {
            font-size: 14px;
            color: #999999;
            margin-top: 20px;
            border-top: 1px solid #e0e0e0;
            padding-top: 15px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #999999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="http://localhost:5173" class="header-logo">Nexus</a>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${email}!</div>
            <div class="description">
                We received a request to reset the password for your account. If you did not initiate this request, please ignore this email and your password will remain unchanged.
            </div>
            <div class="description">
                To reset your password, please click the button below:
            </div>
            
            <div class="button-container">
                <a href="${url}" class="reset-button">Reset Password</a>
            </div>
            
            <div class="note">
                <strong>Note:</strong> This link will expire in <strong>1 hour</strong> for security reasons.
            </div>
        </div>
        
        <div class="footer">
            This is an automated email. Please do not reply to this message.
        </div>
    </div>
</body>
</html>
    `;
}


export function getResetPasswordSuccessEmail(email) {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #667eea;
            padding: 30px 20px;
            text-align: center;
        }
        .header-logo {
            font-size: 28px;
            font-weight: bold;
            color: #ffffff;
            text-decoration: none;
        }
        .content {
            padding: 40px 30px;
            text-align: left;
        }
        .greeting {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #333333;
        }
        .description {
            font-size: 16px;
            line-height: 1.6;
            color: #666666;
            margin-bottom: 25px;
        }
        .email-address {
            font-weight: bold;
            color: #333333;
        }
        .note {
            font-size: 14px;
            color: #999999;
            margin-top: 20px;
            border-top: 1px solid #e0e0e0;
            padding-top: 15px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #999999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="http://localhost:5173" class="header-logo">Nexus</a>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${email}!</div>
            <div class="description">
                Your password has been successfully reset. You can now log in with your new password.
            </div>
            <div class="note">
                <strong>Security Tip:</strong> If you did not initiate this password reset, please contact our support team immediately at [Support Email Address].
            </div>
        </div>
        
        <div class="footer">
            This is an automated email. Please do not reply to this message.
        </div>
    </div>
</body>
</html>
    `;
}
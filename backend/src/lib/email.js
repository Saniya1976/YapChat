import nodemailer from 'nodemailer';

/**
 * Build an HTML verification email body.
 */
function buildEmailHtml(fullName, verifyUrl) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Verify your YapChat email</title>
      <style>
        body { margin:0; padding:0; background:#0d1117; font-family:'Segoe UI',Arial,sans-serif; }
        .wrapper { max-width:520px; margin:40px auto; background:#161b22; border-radius:12px;
                   overflow:hidden; border:1px solid #30363d; }
        .header  { background:linear-gradient(135deg,#238636 0%,#2ea043 100%);
                   padding:32px 24px; text-align:center; }
        .header h1 { margin:0; color:#fff; font-size:26px; letter-spacing:1px; }
        .header p  { margin:6px 0 0; color:rgba(255,255,255,.85); font-size:14px; }
        .body    { padding:32px 28px; color:#c9d1d9; }
        .body h2 { color:#f0f6fc; margin-top:0; }
        .body p  { line-height:1.7; font-size:15px; }
        .btn     { display:inline-block; margin:20px 0; padding:14px 32px;
                   background:linear-gradient(135deg,#238636,#2ea043);
                   color:#fff !important; text-decoration:none; border-radius:8px;
                   font-size:15px; font-weight:600; letter-spacing:.5px; }
        .note    { background:#21262d; border-radius:8px; padding:14px 16px;
                   font-size:13px; color:#8b949e; margin-top:20px; }
        .footer  { padding:16px 28px; font-size:12px; color:#6e7681;
                   border-top:1px solid #21262d; text-align:center; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>⚙️ YapChat</h1>
          <p>Language learning, reimagined</p>
        </div>
        <div class="body">
          <h2>Hey ${fullName}, welcome aboard! 👋</h2>
          <p>
            Thanks for signing up. To start chatting and making language-learning
            friends, please verify your email address by clicking the button below.
          </p>
          <a href="${verifyUrl}" class="btn">Verify my email →</a>
          <div class="note">
            ⏰ This link expires in <strong>24 hours</strong>.<br/>
            If you didn't create a YapChat account, you can safely ignore this email.
          </div>
          <p style="font-size:13px;color:#8b949e;margin-top:24px;">
            If the button doesn't work, paste this URL into your browser:<br/>
            <a href="${verifyUrl}" style="color:#58a6ff;word-break:break-all;">${verifyUrl}</a>
          </p>
        </div>
        <div class="footer">© ${new Date().getFullYear()} YapChat · All rights reserved</div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Returns a nodemailer transporter using whichever method is configured:
 *   1. Resend  – set RESEND_API_KEY in .env  (recommended, free 100/day)
 *   2. SMTP    – set EMAIL_USER + EMAIL_PASS  (Gmail needs an App Password)
 *   3. Ethereal – automatic fallback (dev only, no real emails – preview URL in console)
 */
async function createTransporter() {
  // ── Option 1: Resend ────────────────────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
    });
  }

  // ── Option 2: Real SMTP (Gmail App Password, etc.) ──────────────────────
  const hasRealCredentials =
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    !process.env.EMAIL_PASS.includes('paste-your') &&
    !process.env.EMAIL_PASS.includes('app-password');

  if (hasRealCredentials) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // ── Option 3: Ethereal (dev fallback – zero config) ─────────────────────
  console.warn(
    '\n⚠️  No email credentials found. Using Ethereal test account.\n' +
    '   Emails will NOT reach real inboxes – a preview URL will be logged below.\n' +
    '   To send real emails, set RESEND_API_KEY in backend/.env\n'
  );
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
    _ethereal: true, // custom flag so we can log the preview URL
  });
}

// Don't cache in production — always pick up latest env vars from Render
async function getTransporter() {
  return createTransporter();
}

/**
 * Send an email-verification link to a newly registered user.
 *
 * @param {string} toEmail  - recipient address
 * @param {string} token    - the raw crypto token
 * @param {string} fullName - used in greeting
 */
export async function sendVerificationEmail(toEmail, token, fullName) {
  const transporter = await getTransporter();

  const BASE_URL = process.env.FRONTEND_URL || `http://localhost:5173`;
  const verifyUrl = `${BASE_URL}/verify-email/${token}`;

  const fromAddress = process.env.RESEND_API_KEY
    ? `"YapChat" <onboarding@resend.dev>`
    : process.env.EMAIL_USER
      ? `"YapChat" <${process.env.EMAIL_USER}>`
      : '"YapChat" <noreply@yapchat.dev>';

  const info = await transporter.sendMail({
    from: fromAddress,
    to: toEmail,
    subject: '✅ Verify your YapChat email address',
    html: buildEmailHtml(fullName, verifyUrl),
  });

  // If Ethereal, print the preview URL so developer can click it
  if (transporter.options?._ethereal || nodemailer.getTestMessageUrl(info)) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('\n──────────────────────────────────────────');
      console.log('📧  ETHEREAL EMAIL PREVIEW (dev only)');
      console.log('    Open this URL to see the verification email:');
      console.log('   ', previewUrl);
      console.log('──────────────────────────────────────────\n');
    }
  }

  return info;
}

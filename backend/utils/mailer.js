const dns = require('dns');
dns.setDefaultResultOrder('ipv4first'); // Prevent IPv6 network timeouts on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const nodemailer = require('nodemailer');

let transporter = null;

if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

/**
 * Universal email dispatcher:
 * 1. Resend HTTP API (Port 443 - free, bypasses Render SMTP block)
 * 2. Brevo HTTP API (Port 443 - free, bypasses Render SMTP block)
 * 3. Nodemailer SMTP (standard)
 */
async function sendRawEmail({ to, subject, html, text }) {
  // Option 1: Resend HTTP REST API
  if (process.env.RESEND_API_KEY) {
    try {
      const fromAddr = process.env.RESEND_FROM || 'FairStay <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddr,
          to: [to],
          subject: subject,
          html: html,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`✅ [Resend API] Verification email sent to ${to} (id: ${data.id})`);
        return true;
      }
      console.warn(`[Resend API Error]: ${JSON.stringify(data)}`);
    } catch (err) {
      console.warn(`[Resend HTTP Error]: ${err.message}`);
    }
  }

  // Option 2: Brevo (Sendinblue) HTTP REST API
  if (process.env.BREVO_API_KEY) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: 'FairStay',
            email: process.env.BREVO_SENDER_EMAIL || process.env.GMAIL_USER || 'no-reply@fairstay.com',
          },
          to: [{ email: to }],
          subject: subject,
          htmlContent: html,
        }),
      });
      if (res.ok) {
        console.log(`✅ [Brevo API] Verification email sent to ${to}`);
        return true;
      }
      const errData = await res.json().catch(() => ({}));
      console.warn(`[Brevo API Error]: ${JSON.stringify(errData)}`);
    } catch (err) {
      console.warn(`[Brevo HTTP Error]: ${err.message}`);
    }
  }

  // Option 3: Standard Nodemailer SMTP
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"FairStay" <${process.env.GMAIL_USER}>`,
        to: to,
        subject: subject,
        html: html,
        text: text,
      });
      console.log(`✅ [SMTP Mailer] Delivered to ${to} (id: ${info.messageId})`);
      return true;
    } catch (err) {
      console.warn(`[FairStay Mailer Warning]: ${err.message}`);
      return false;
    }
  }

  return false;
}

/**
 * Send 6-digit Account Approval Code (OTP) to authentic Gmail
 */
async function sendVerificationOtpEmail(recipientEmail, otp) {
  console.log('====================================================');
  console.log(`🔑 [FairStay OTP DISPATCH] -> To: ${recipientEmail}`);
  console.log(`🔑 [APPROVAL CODE]: >>> ${otp} <<< (Valid for 15 mins)`);
  console.log('====================================================');

  const subject = `🔐 FairStay Account Approval Code: ${otp}`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 540px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 38px;">🏡</span>
        <h2 style="color: #0f172a; margin: 8px 0 0 0; font-size: 22px;">FairStay Account Verification</h2>
        <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Confirm your authentic Gmail address</p>
      </div>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">
        You requested to register an account on FairStay with <strong>${recipientEmail}</strong>. To verify that this is a valid, existing email account owned by you, enter this 6-digit approval code:
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <div style="display: inline-block; background-color: #fff2ef; border: 2px dashed #ff5a3c; border-radius: 12px; padding: 14px 28px; letter-spacing: 8px; font-size: 32px; font-weight: 800; color: #ff5a3c;">
          ${otp}
        </div>
        <div style="color: #94a3b8; font-size: 12px; margin-top: 8px;">Valid for 15 minutes</div>
      </div>
      <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
        If this was not you or you entered this email by mistake, you can safely ignore this email. No account will be activated or approved without this code.
      </p>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
        FairStay Vacation Rentals & Homes • Secure Authentication System
      </p>
    </div>
  `;

  return await sendRawEmail({ to: recipientEmail, subject, html });
}

async function sendVerificationEmail(recipientEmail, token) {
  const verifyUrl = `${process.env.APP_BASE_URL || 'http://localhost:8080'}/verify-email/${token}`;
  console.log(`[FairStay Mailer] Verification URL: ${verifyUrl}`);

  const subject = '✅ Verify Your FairStay Account';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #ff5a3c; text-align: center;">🏡 FairStay Vacation Homes</h2>
      <p>Hello,</p>
      <p>Please click the button below to verify your email address and activate your FairStay account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background-color: #ff5a3c; color: #fff; padding: 12px 28px; text-decoration: none; border-radius: 25px; font-weight: bold;">Verify Email Address</a>
      </div>
      <p style="color: #777; font-size: 0.85rem;">Or copy and paste this link in your browser:<br/><a href="${verifyUrl}">${verifyUrl}</a></p>
    </div>
  `;

  return await sendRawEmail({ to: recipientEmail, subject, html });
}

async function sendBookingConfirmationEmail(recipientEmail, booking, listing) {
  const subject = `🎉 Booking Confirmed: ${listing.title} (Suite: ${booking.roomNumber})`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #10b981; text-align: center;">✅ Stay Confirmed</h2>
      <p>Hello ${booking.guestName || 'Guest'},</p>
      <p>Your vacation stay has been confirmed under the <strong>FairSafe™ Price-Lock Guarantee</strong>.</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
        <h3 style="margin-top: 0; color: #0f172a;">${listing.title}</h3>
        <p><strong>Location:</strong> ${listing.location}</p>
        <p><strong>Assigned Suite #:</strong> <span style="font-size: 1.2rem; font-weight: bold; color: #10b981;">${booking.roomNumber}</span></p>
        <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString('en-IN')}</p>
        <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString('en-IN')}</p>
        <p><strong>Total Paid:</strong> ₹${(booking.totalPrice ? Math.round(booking.totalPrice * 1.12) : 0).toLocaleString('en-IN')} (incl. GST)</p>
      </div>
      <p style="color: #64748b; font-size: 0.85rem;">Your room code and check-in instructions are ready in your FairStay dashboard under "My Trips".</p>
    </div>
  `;

  return await sendRawEmail({ to: recipientEmail, subject, html });
}

module.exports = {
  sendVerificationOtpEmail,
  sendVerificationEmail,
  sendBookingConfirmationEmail,
};

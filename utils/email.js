const nodemailer = require('nodemailer');

const transporter = process.env.EMAIL_USER ? nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
}) : null;

const sendBookingConfirmation = async (booking, property) => {
  if (!transporter) return;
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: booking.email,
    subject: `Tour Booking Confirmation - ${property.title}`,
    html: `
      <h2>Thank you, ${booking.full_name}!</h2>
      <p>Your tour for <strong>${property.title}</strong> has been scheduled.</p>
      <p><strong>Date:</strong> ${new Date(booking.preferred_date).toDateString()}<br/>
      <strong>Time:</strong> ${booking.preferred_time}<br/>
      <strong>Guests:</strong> ${booking.guests}<br/>
      <strong>Payment Method:</strong> ${booking.payment_method}</p>
      <p>Booking ID: <strong>${booking.booking_id}</strong></p>
      <p>Please complete the payment via your selected method to finalize the tour.</p>
      <hr/>
      <p>Need help? Contact support@easyaffordablehome.com</p>
    `
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendBookingConfirmation };
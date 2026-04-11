const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configure email transporter (replace with your SMTP settings)
const transporter = nodemailer.createTransporter({
  service: 'gmail', // or your email service
  auth: {
    user: functions.config().email.user, // Set via firebase functions:config:set email.user="your-email@gmail.com"
    pass: functions.config().email.pass, // Set via firebase functions:config:set email.pass="your-password"
  },
});

// Send email notification
exports.sendEmailNotification = functions.firestore
  .document('emailNotifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();

    if (notification.sent) return;

    try {
      const mailOptions = {
        from: functions.config().email.user,
        to: notification.userEmail,
        subject: notification.subject,
        html: `
          <h2>${notification.subject}</h2>
          <p>${notification.body}</p>
          ${notification.link ? `<p><a href="${notification.link}">View Details</a></p>` : ''}
        `,
      };

      await transporter.sendMail(mailOptions);

      // Mark as sent
      await snap.ref.update({
        sent: true,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('Email sent successfully to', notification.userEmail);
    } catch (error) {
      console.error('Error sending email:', error);
      // Increment retry count
      await snap.ref.update({
        retryCount: admin.firestore.FieldValue.increment(1),
      });
    }
  });

// Send FCM push notification
exports.sendPushNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();

    if (!notification.userId) return;

    try {
      // Get user FCM token
      const userDoc = await admin.firestore().collection('users').doc(notification.userId).get();
      const userData = userDoc.data();
      const fcmToken = userData?.fcmToken;

      if (!fcmToken) {
        console.log('No FCM token for user', notification.userId);
        return;
      }

      const message = {
        token: fcmToken,
        notification: {
          title: notification.title,
          body: notification.message,
        },
        webpush: {
          fcmOptions: {
            link: notification.link || '/',
          },
        },
      };

      await admin.messaging().send(message);
      console.log('Push notification sent to', notification.userId);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  });
import emailjs from '@emailjs/browser';

// EmailJS Configuration - Updated with your credentials
const EMAILJS_SERVICE_ID = 'service_ysp1bru';
const EMAILJS_TEMPLATE_ID = 'template_j76ipwu';
const EMAILJS_PUBLIC_KEY = 'AGQy2T4G5G4PaQ63w';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export const sendGroupStatusEmail = async (notificationData) => {
  try {
    const templateParams = {
      to_email: notificationData.userEmail,
      to_name: notificationData.userName,
      group_title: notificationData.groupTitle,
      group_subject: notificationData.groupSubject || '',
      group_description: notificationData.groupDescription || '',
      status: notificationData.status,
      from_name: 'Study Group Finder Team'
    };

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    return { success: true, result };
  } catch (error) {
    console.error('EmailJS Error:', error);
    return { success: false, error: error.message };
  }
};

export const sendBulkNotificationEmail = async (users, subject, message) => {
  try {
    const results = await Promise.allSettled(
      users.map(user => 
        emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            to_email: user.email,
            to_name: user.name,
            subject: subject,
            message: message,
            from_name: 'Study Group Finder Admin',
            group_title: subject,
            group_subject: '',
            group_description: message,
            status: 'notification'
          }
        )
      )
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    return { 
      success: true, 
      sent: successful, 
      failed: failed,
      total: users.length 
    };
  } catch (error) {
    console.error('Bulk Email Error:', error);
    return { success: false, error: error.message };
  }
};

export const sendSelectedUsersEmail = async (selectedUsers, subject, message) => {
  try {
    const results = await Promise.allSettled(
      selectedUsers.map(user => 
        emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            to_email: user.email,
            to_name: user.name,
            subject: subject,
            message: message,
            from_name: 'Study Group Finder Admin',
            group_title: subject,
            group_subject: '',
            group_description: message,
            status: 'notification'
          }
        )
      )
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    return { 
      success: true, 
      sent: successful, 
      failed: failed,
      total: selectedUsers.length 
    };
  } catch (error) {
    console.error('Selected Users Email Error:', error);
    return { success: false, error: error.message };
  }
};

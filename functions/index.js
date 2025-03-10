const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// إرسال إشعار ترحيب عند فتح التطبيق في أي وقت (كل مرة يتم فيها تحديث بيانات المستخدم)
exports.sendWelcomeNotification = functions.firestore.document('users/{userId}').onUpdate(async (change, context) => {
    const userId = context.params.userId;
    const userData = change.after.data(); // استرجاع بيانات المستخدم

    const token = userData.fcmToken; // استرجاع FCM Token للمستخدم

    if (token) {
        const payload = {
            notification: {
                title: 'أهلا وسهلا!',
                body: 'صندوق تمويل المساكن يرحب بك'
            }
        };

        // إرسال الإشعار
        await admin.messaging().sendToDevice(token, payload);
    }
});

// إرسال إشعار تذكير قبل 15 يومًا من تاريخ القسط
exports.sendInstallmentFinalReminder = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
    // التواريخ المحددة للأقساط
    const dueDates = [
        new Date('2025-03-15'), // 15 مارس 2025
        new Date('2025-06-15'), // 15 يونيو 2025
        new Date('2025-09-15')  // 15 سبتمبر 2025
    ];

    const currentDate = new Date();

    dueDates.forEach(async (dueDate) => {
        const fifteenDaysBefore = new Date(dueDate);
        fifteenDaysBefore.setDate(dueDate.getDate() - 15); // حساب 15 يوم قبل القسط

        // تحقق إذا كان التاريخ الحالي يقع بين "15 يوم قبل القسط" و "يوم القسط"
        if (currentDate >= fifteenDaysBefore && currentDate < dueDate) {
            const snapshot = await admin.firestore().collection('installments').get();
            
            snapshot.forEach(async (doc) => {
                const userData = doc.data();
                const token = userData.fcmToken; // احصل على FCM Token الخاص بالمستخدم

                if (token) { // تأكد من وجود FCM Token
                    const payload = {
                        notification: {
                            title: '🔔 تذكير بأخر ميعاد لدفع القسط!',
                            body: `📢 مرحبا! لو أنت من مالكي وحدات مشروع العبور حبيت افكرك أن ( ${dueDate.toLocaleDateString()} ) آخر ميعاد لدفع القسط تجنباً للغرامات، مستنينك! 💰`
                        }
                    };

                    await admin.messaging().sendToDevice(token, payload); // إرسال الإشعار
                }
            });
        }
    });
});

// إرسال إشعار تذكير يوميًا قبل 7 أيام من القسط
exports.sendDailyInstallmentReminder = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
    // التواريخ المحددة للأقساط
    const dueDates = [
        new Date('2025-02-16'), // 16 فبراير 2025
        new Date('2025-03-16'), // 16 مارس 2025
        new Date('2025-06-16')  // 16 يونيو 2025
    ];

    const currentDate = new Date();

    dueDates.forEach(async (dueDate) => {
        const oneWeekBefore = new Date(dueDate);
        oneWeekBefore.setDate(dueDate.getDate() - 7); // حساب تاريخ 7 أيام قبل القسط

        // تحقق إذا كان التاريخ الحالي يسبق القسط بـ 7 أيام أو يساويه
        if (currentDate >= oneWeekBefore && currentDate <= dueDate) {
            const snapshot = await admin.firestore().collection('installments').get();
            
            snapshot.forEach(async (doc) => {
                const userData = doc.data();
                const token = userData.fcmToken; // احصل على FCM Token الخاص بالمستخدم

                if (token) { // تأكد من وجود FCM Token
                    const payload = {
                        notification: {
                            title: '🔔 تذكير بدفع القسط!',
                            body: `📢 مرحبا! لو أنت من مالكي وحدات مشروع العبور، فالقسط مستحق في (${dueDate.toLocaleDateString()})، مستنينك! 💰`
                        }
                    };

                    await admin.messaging().sendTo


const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// ตั้งค่า Email ผู้ส่ง (แนะนำให้ใช้ Gmail และสร้าง App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "doytou@gmail.com", // เปลี่ยนเป็นอีเมลของคุณ
    pass: "YOUR_APP_PASSWORD",     // เปลี่ยนเป็น App Password ของ Gmail
  },
});

// ฟังก์ชันทำงานอัตโนมัติเมื่อมีการสร้างงานใหม่ใน Firestore (collection: 'tasks')
exports.sendTaskEmailNotification = onDocumentCreated("tasks/{taskId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const task = snapshot.data();
  const assigneeName = task.assignee;
  const taskTitle = task.title;
  const dueDate = task.dueDate || "ไม่ระบุ";

  if (!assigneeName) return;

  try {
    // ค้นหา Email ของผู้รับผิดชอบจาก Firestore (collection: 'users')
    const usersSnap = await admin.firestore().collection("users").get();
    let recipientEmail = null;

    usersSnap.forEach((doc) => {
      const userData = doc.data();
      // เช็คชื่อให้ตรงกับผู้รับผิดชอบของงาน
      if (userData.displayName === assigneeName || userData.name === assigneeName) {
        recipientEmail = userData.email;
      }
    });

    if (!recipientEmail) {
      console.log(`ไม่พบอีเมลของ ${assigneeName}`);
      return;
    }

    // ส่งอีเมล
    const mailOptions = {
      from: '"Workflow Pro System" <doytou@gmail.com>',
      to: recipientEmail,
      subject: `[แจ้งเตือนงานใหม่] คุณได้รับมอบหมายงาน: ${taskTitle}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #4f46e5;">คุณได้รับมอบหมายงานใหม่</h2>
          <p>เรียน <b>${assigneeName}</b>,</p>
          <p>ระบบได้มอบหมายงานใหม่ให้คุณ กรุณาตรวจสอบรายละเอียดด้านล่าง:</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p><b>ชื่องาน:</b> ${taskTitle}</p>
            <p><b>หมวดหมู่:</b> ${task.category || "ทั่วไป"}</p>
            <p><b>ระดับความสำคัญ:</b> ${task.priority || "ปกติ"}</p>
            <p><b>กำหนดส่ง:</b> ${dueDate}</p>
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #64748b;">อีเมลนี้ส่งจากระบบอัตโนมัติ ห้ามตอบกลับ</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`ส่งอีเมลแจ้งเตือนไปที่ ${recipientEmail} สำเร็จ`);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการส่งอีเมล:", error);
  }
});
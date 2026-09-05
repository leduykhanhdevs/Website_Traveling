// api/subscribe.js
// Vercel Serverless Function to handle newsletter / early access registration
// and send automated thank-you email from khanhdevs@gmail.com

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Phương thức không được hỗ trợ' });
  }

  try {
    const { email } = req.body || {};

    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Địa chỉ email không hợp lệ' });
    }

    const recipientEmail = email.trim().toLowerCase();
    const adminEmail = 'khanhdevs@gmail.com';

    console.log(`[Subscribe] Đăng ký mới từ: ${recipientEmail}`);

    const emailSubject = 'Cảm ơn bạn đã quan tâm đến Traveling: Nền Tảng Du Lịch Thông Minh';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #070A11; color: #f1f5f9; padding: 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #38bdf8; margin: 0; font-size: 26px; font-weight: 800;">Traveling</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 6px;">Nền Tảng Du Lịch Thông Minh Thế Hệ Mới</p>
        </div>
        <div style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Xin chào bạn,</h2>
          <p style="line-height: 1.6; color: #cbd5e1; font-size: 14px;">
            Cảm ơn bạn rất nhiều vì đã quan tâm và đăng ký trải nghiệm nền tảng <strong>Traveling</strong>!
          </p>
          <p style="line-height: 1.6; color: #cbd5e1; font-size: 14px;">
            Traveling được xây dựng để mang đến trải nghiệm du lịch thông minh, tiện lợi với sự hỗ trợ của trí tuệ nhân tạo (AI), bộ dịch thuật hơn 50 ngôn ngữ qua camera OCR và sổ quỹ chia tiền nhóm tự động tạo mã VietQR.
          </p>
          <div style="margin: 20px 0; padding: 16px; background-color: rgba(56, 189, 248, 0.1); border-left: 4px solid #38bdf8; border-radius: 6px;">
            <p style="margin: 0; font-size: 13px; color: #38bdf8; font-weight: 600;">
              ✨ Bạn đã được ghi danh vào danh sách ưu tiên trải nghiệm phiên bản mới nhất!
            </p>
          </div>
          <p style="line-height: 1.6; color: #cbd5e1; font-size: 14px;">
            Nếu bạn có bất kỳ câu hỏi hoặc góp ý, hãy phản hồi trực tiếp email này hoặc liên hệ qua: <a href="mailto:${adminEmail}" style="color: #38bdf8; text-decoration: underline;">${adminEmail}</a>.
          </p>
        </div>
        <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; color: #64748b; font-size: 12px;">
          <p style="margin: 4px 0;">Thân mến,</p>
          <p style="margin: 4px 0; color: #94a3b8; font-weight: 600;">Lê Duy Khánh (khanhdevs)</p>
          <p style="margin: 4px 0;">Đội ngũ phát triển Traveling Platform • <a href="https://travelingvn.vercel.app" style="color: #38bdf8; text-decoration: none;">travelingvn.vercel.app</a></p>
        </div>
      </div>
    `;

    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || 'Traveling <onboarding@resend.dev>',
            to: [recipientEmail],
            reply_to: adminEmail,
            subject: emailSubject,
            html: emailHtml,
          }),
        });

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || 'Traveling Alerts <onboarding@resend.dev>',
            to: [adminEmail],
            subject: `[Traveling] Người dùng mới đăng ký: ${recipientEmail}`,
            html: `<p>Có du khách mới đăng ký danh sách trải nghiệm: <strong>${recipientEmail}</strong></p><p>Thời gian: ${new Date().toISOString()}</p>`,
          }),
        });
      } catch (sendErr) {
        console.error('Lỗi khi gọi Resend API:', sendErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Đã gửi thư cảm ơn tự động thành công!',
      email: recipientEmail,
      from: adminEmail,
    });
  } catch (error) {
    console.error('Lỗi hệ thống subscribe:', error);
    return res.status(500).json({ error: 'Đã xảy ra lỗi nội bộ' });
  }
}

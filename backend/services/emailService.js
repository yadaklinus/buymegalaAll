const { Resend } = require("resend");

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const sendVerificationEmail = async (email, otpCode) => {
    if (!resend) {
        console.warn("⚠️ RESEND_API_KEY missing in .env! OTP code for", email, "is:", otpCode);
        return { success: true, simulated: true };
    }

    try {
        const data = await resend.emails.send({
            from: "Buy Me Gala <no-reply@codegit.tech>",
            to: [email],
            subject: "Verify Your Buy Me Gala Account",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 16px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="display: inline-block; background: linear-gradient(135deg, #facc15 0%, #f97316 100%); padding: 12px 24px; border-radius: 12px;">
                            <span style="font-size: 24px; font-weight: 900; color: #111827; letter-spacing: -0.5px;">🍩 Buy Me Gala</span>
                        </div>
                    </div>
                    <h3 style="color: #111827; text-align: center; font-size: 20px; margin-bottom: 8px;">Verify Your Email Address</h3>
                    <p style="color: #6b7280; font-size: 14px; text-align: center; line-height: 1.5; margin-bottom: 24px;">
                        Enter the 6-digit verification code below to activate your creator account and get started.
                    </p>
                    <div style="background-color: #fef9c3; border: 1px solid #fef08a; padding: 18px; border-radius: 12px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #854d0e; margin: 20px 0;">
                        ${otpCode}
                    </div>
                    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
                        This code expires in 10 minutes. If you did not request this email, please ignore it.
                    </p>
                </div>
            `
        });
        return { success: true, data };
    } catch (error) {
        console.error("Resend Email Sending Error:", error);
        throw error;
    }
};

module.exports = { sendVerificationEmail };

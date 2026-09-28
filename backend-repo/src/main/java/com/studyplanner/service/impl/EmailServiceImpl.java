package com.studyplanner.service.impl;

import com.studyplanner.exception.BadRequestException;
import com.studyplanner.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    @Override
    public void sendOtpEmail(String to, String name, String otp) {
        log.info("========================================");
        log.info("PASSWORD RESET OTP for {}: {}", to, otp);
        log.info("========================================");

        if (!emailEnabled) {
            log.info("Email is disabled (MAIL_ENABLED=false). OTP logged above — use it directly.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("STUDEAID — Password Reset OTP");
            helper.setText(buildHtml(name, otp), true);
            mailSender.send(message);
            log.info("OTP email sent to {}", to);
        } catch (Exception e) {
            log.warn("Email sending failed ({}). OTP is still logged above.", e.getMessage());
            throw new BadRequestException(
                "Could not send email. Check MAIL_USERNAME / MAIL_PASSWORD in .env, " +
                "or find your OTP in the backend console logs."
            );
        }
    }

    @Override
    public void sendWelcomeEmail(String to, String name) {
        if (!emailEnabled) {
            log.info("Welcome email skipped (MAIL_ENABLED=false) for: {}", to);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Welcome to STUDEAID — Your AI-Powered Study Platform 🎓");
            helper.setText(buildWelcomeHtml(name), true);
            mailSender.send(message);
            log.info("Welcome email sent to {}", to);
        } catch (Exception e) {
            log.warn("Welcome email failed for {} ({}). Login will proceed normally.", to, e.getMessage());
        }
    }

    private String buildWelcomeHtml(String name) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#F1F5F9;font-family:Inter,Arial,sans-serif;">
            <table width="100%%" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding:40px 16px;">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#1D4ED8 0%%,#4F46E5 100%%);padding:40px 40px 32px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">STUDEAID</h1>
                      <p style="margin:8px 0 0;color:#BFDBFE;font-size:14px;">AI-Powered Student Study Platform</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 40px 32px;">
                      <h2 style="margin:0 0 8px;color:#0F172A;font-size:22px;">Welcome aboard, %s! 👋</h2>
                      <p style="color:#475569;line-height:1.7;margin:16px 0;">
                        You've successfully signed in with Google. Your account is ready —
                        start exploring everything STUDEAID has to offer.
                      </p>

                      <!-- Features grid -->
                      <table width="100%%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
                        <tr>
                          <td style="padding:0 8px 16px 0;" width="50%%">
                            <div style="background:#EFF6FF;border-radius:12px;padding:18px 16px;">
                              <p style="margin:0 0 4px;font-size:20px;">📚</p>
                              <p style="margin:0;font-weight:700;color:#1D4ED8;font-size:14px;">Subjects & Tasks</p>
                              <p style="margin:4px 0 0;color:#64748B;font-size:12px;">Organize your coursework efficiently</p>
                            </div>
                          </td>
                          <td style="padding:0 0 16px 8px;" width="50%%">
                            <div style="background:#F0FDF4;border-radius:12px;padding:18px 16px;">
                              <p style="margin:0 0 4px;font-size:20px;">🎯</p>
                              <p style="margin:0;font-weight:700;color:#16A34A;font-size:14px;">Goals & Progress</p>
                              <p style="margin:4px 0 0;color:#64748B;font-size:12px;">Track and achieve your targets</p>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:0 8px 16px 0;" width="50%%">
                            <div style="background:#FFF7ED;border-radius:12px;padding:18px 16px;">
                              <p style="margin:0 0 4px;font-size:20px;">🤖</p>
                              <p style="margin:0;font-weight:700;color:#EA580C;font-size:14px;">AI Assistant</p>
                              <p style="margin:4px 0 0;color:#64748B;font-size:12px;">Get instant study help 24/7</p>
                            </div>
                          </td>
                          <td style="padding:0 0 16px 8px;" width="50%%">
                            <div style="background:#FDF4FF;border-radius:12px;padding:18px 16px;">
                              <p style="margin:0 0 4px;font-size:20px;">⏱️</p>
                              <p style="margin:0;font-weight:700;color:#9333EA;font-size:14px;">Pomodoro Timer</p>
                              <p style="margin:4px 0 0;color:#64748B;font-size:12px;">Boost focus with timed sessions</p>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:0 8px 0 0;" width="50%%">
                            <div style="background:#FFF1F2;border-radius:12px;padding:18px 16px;">
                              <p style="margin:0 0 4px;font-size:20px;">📝</p>
                              <p style="margin:0;font-weight:700;color:#E11D48;font-size:14px;">Notes</p>
                              <p style="margin:4px 0 0;color:#64748B;font-size:12px;">Capture ideas, never forget</p>
                            </div>
                          </td>
                          <td style="padding:0 0 0 8px;" width="50%%">
                            <div style="background:#F0F9FF;border-radius:12px;padding:18px 16px;">
                              <p style="margin:0 0 4px;font-size:20px;">📊</p>
                              <p style="margin:0;font-weight:700;color:#0284C7;font-size:14px;">Analytics</p>
                              <p style="margin:4px 0 0;color:#64748B;font-size:12px;">Visualize your study patterns</p>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <p style="color:#475569;line-height:1.7;margin:8px 0 28px;">
                        Head to your <strong>Dashboard</strong> to get started.
                        Everything is set up and ready for you.
                      </p>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#F8FAFC;padding:24px 40px;border-top:1px solid #E2E8F0;text-align:center;">
                      <p style="margin:0;color:#94A3B8;font-size:12px;">
                        © %d STUDEAID · AI-Powered Student Study Planner
                      </p>
                      <p style="margin:6px 0 0;color:#CBD5E1;font-size:11px;">
                        You received this email because you signed up with Google.
                      </p>
                    </td>
                  </tr>

                </table>
              </td></tr>
            </table>
            </body>
            </html>
            """.formatted(name, java.time.Year.now().getValue());
    }

    private String buildHtml(String name, String otp) {
        return """
            <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#F8FAFF;border-radius:16px;">
              <h2 style="color:#2563EB;margin:0 0 8px;">STUDEAID</h2>
              <h3 style="color:#0F172A;margin:0 0 16px;">Password Reset Request</h3>
              <p style="color:#1E293B;line-height:1.6;">Hi <strong>%s</strong>,</p>
              <p style="color:#1E293B;line-height:1.6;">
                Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.
              </p>
              <div style="background:#fff;border:2px solid #2563EB;border-radius:12px;padding:28px;text-align:center;margin:28px 0;">
                <span style="font-size:40px;font-weight:800;letter-spacing:14px;color:#2563EB;">%s</span>
              </div>
              <p style="color:#64748B;font-size:13px;">
                If you did not request a password reset, you can safely ignore this email.
              </p>
              <hr style="border:none;border-top:1px solid #E2E8F0;margin:24px 0;" />
              <p style="color:#94A3B8;font-size:12px;text-align:center;">© %d STUDEAID · Final Year Project</p>
            </div>
            """.formatted(name, otp, java.time.Year.now().getValue());
    }
}

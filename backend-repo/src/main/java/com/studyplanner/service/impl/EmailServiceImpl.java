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

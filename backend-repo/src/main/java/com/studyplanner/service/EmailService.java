package com.studyplanner.service;

public interface EmailService {
    void sendOtpEmail(String to, String name, String otp);
    void sendWelcomeEmail(String to, String name);
}

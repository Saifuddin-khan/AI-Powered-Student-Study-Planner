package com.studyplanner.security;

import com.studyplanner.service.OAuth2LoginService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final OAuth2LoginService oAuth2LoginService;

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/oauth2/callback}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name  = oAuth2User.getAttribute("name");

        log.info("OAuth2 login attempt for: {}", email);

        String[] result = oAuth2LoginService.processOAuthLogin(email, name);

        if (result == null) {
            String errorUrl = UriComponentsBuilder.fromUriString(redirectUri)
                    .queryParam("error", "account_disabled")
                    .build().toUriString();
            getRedirectStrategy().sendRedirect(request, response, errorUrl);
            return;
        }

        String targetUrl = redirectUri + "?token=" + result[0] + "&refreshToken=" + result[1];

        log.info("OAuth2 login success for: {}", email);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}

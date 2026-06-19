package com.studyplanner.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.support.PropertiesLoaderUtils;

import java.io.File;
import java.net.URI;
import java.net.URL;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Properties;

@Order(Ordered.LOWEST_PRECEDENCE)
public class DotEnvPostProcessor implements EnvironmentPostProcessor {

    private static final String SOURCE_NAME = "dotEnvFile";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        File dotEnv = findDotEnv();
        if (dotEnv == null) return;

        try {
            Properties props = PropertiesLoaderUtils.loadProperties(new FileSystemResource(dotEnv));
            Map<String, Object> map = new LinkedHashMap<>();
            for (String key : props.stringPropertyNames()) {
                if (!environment.containsProperty(key)) {
                    map.put(key, props.getProperty(key));
                }
            }
            if (!map.isEmpty()) {
                environment.getPropertySources().addLast(new MapPropertySource(SOURCE_NAME, map));
            }
        } catch (Exception ignored) {
            // .env is optional
        }
    }

    private File findDotEnv() {
        // Strategy 1: user.dir is already the project root (e.g. CLI, Maven run)
        File f = new File(System.getProperty("user.dir"), ".env");
        if (f.exists()) return f;

        // Strategy 2: navigate up from application.properties resource location.
        //   Works for both IDE (target/classes) and fat JAR (BOOT-INF/classes inside jar).
        f = findViaClasspathResource();
        if (f != null) return f;

        // Strategy 3: search immediate subdirectories of user.dir that contain a pom.xml.
        //   Handles the case where the IDE workspace is the parent directory.
        f = findInProjectSubdirs();
        if (f != null) return f;

        return null;
    }

    private File findViaClasspathResource() {
        try {
            URL url = getClass().getClassLoader().getResource("application.properties");
            if (url == null) return null;

            String urlStr = url.toString();

            // Fat JAR: jar:file:/…/app.jar!/BOOT-INF/classes/application.properties
            if (urlStr.startsWith("jar:")) {
                urlStr = urlStr.substring(4); // strip "jar:"
                if (urlStr.contains("!")) {
                    urlStr = urlStr.substring(0, urlStr.indexOf('!')); // keep only JAR file path
                }
            } else if (urlStr.endsWith("/application.properties")) {
                urlStr = urlStr.substring(0, urlStr.length() - "/application.properties".length());
            }

            File dir = new File(new URI(urlStr));
            for (int depth = 0; depth < 6; depth++) {
                if (dir == null) break;
                File env = new File(dir, ".env");
                if (env.exists()) return env;
                if (new File(dir, "pom.xml").exists()) break; // project root, no .env here
                dir = dir.getParentFile();
            }
        } catch (Exception ignored) {
            // fall through to next strategy
        }
        return null;
    }

    private File findInProjectSubdirs() {
        File userDir = new File(System.getProperty("user.dir"));
        File[] subdirs = userDir.listFiles(
                d -> d.isDirectory() && new File(d, "pom.xml").exists());
        if (subdirs == null) return null;
        for (File subdir : subdirs) {
            File env = new File(subdir, ".env");
            if (env.exists()) return env;
        }
        return null;
    }
}

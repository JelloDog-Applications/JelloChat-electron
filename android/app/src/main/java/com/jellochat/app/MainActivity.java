package com.jellochat.app;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int AUDIO_PERMISSION_REQUEST_CODE = 1001;
    private static final String APP_WEB_BASE_URL = "https://chat.jellodog.com";
    private static final String APP_USER_AGENT_MARKER = "JelloChatAndroidApp";
    private String pendingAuthUrl;
    private boolean authNavigationHandled;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getBridge().getWebView().setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                flushPendingAuthUrl();
            }
        });

        getBridge().getWebView().setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> request.grant(request.getResources()));
            }
        });

        getBridge().getWebView().clearCache(true);
        getBridge().getWebView().clearHistory();
        getBridge().getWebView().getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        getBridge().getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
        appendAppUserAgentMarker();
        ensureAudioPermission();
        handleAuthIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleAuthIntent(intent);
    }

    private void ensureAudioPermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            return;
        }

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                    this,
                    new String[]{Manifest.permission.RECORD_AUDIO},
                    AUDIO_PERMISSION_REQUEST_CODE
            );
        }
    }

    private void appendAppUserAgentMarker() {
        if (getBridge() == null || getBridge().getWebView() == null) {
            return;
        }

        WebSettings settings = getBridge().getWebView().getSettings();
        String userAgent = settings.getUserAgentString();
        if (userAgent == null || userAgent.contains(APP_USER_AGENT_MARKER)) {
            return;
        }

        settings.setUserAgentString(userAgent + " " + APP_USER_AGENT_MARKER);
    }

    private void handleAuthIntent(Intent intent) {
        if (intent == null || intent.getData() == null || getBridge() == null || getBridge().getWebView() == null) {
            return;
        }

        Uri data = intent.getData();
        String resolvedUrl = resolveAuthUrl(data);
        if (resolvedUrl == null || resolvedUrl.isEmpty()) {
            return;
        }

        pendingAuthUrl = resolvedUrl;
        authNavigationHandled = false;
        flushPendingAuthUrl();
    }

    private String resolveAuthUrl(Uri data) {
        String scheme = data.getScheme();
        String host = data.getHost();
        String path = data.getPath();
        String query = data.getEncodedQuery();

        if (scheme == null || path == null) {
            return null;
        }

        if ("jellochat".equalsIgnoreCase(scheme) && "auth".equalsIgnoreCase(host)) {
            if ("/reset-password".equals(path)) {
                return APP_WEB_BASE_URL + path + (query == null || query.isEmpty() ? "" : "?" + query);
            }
            if ("/verify-email".equals(path)) {
                return APP_WEB_BASE_URL + path + (query == null || query.isEmpty() ? "" : "?" + query);
            }
            return null;
        }

        if (("https".equalsIgnoreCase(scheme) || "http".equalsIgnoreCase(scheme))
                && "chat.jellodog.com".equalsIgnoreCase(host)
                && ("/reset-password".equals(path) || "/verify-email".equals(path))) {
            return data.toString();
        }

        return null;
    }

    private void flushPendingAuthUrl() {
        if (pendingAuthUrl == null || pendingAuthUrl.isEmpty() || authNavigationHandled || getBridge() == null || getBridge().getWebView() == null) {
            return;
        }

        String currentUrl = getBridge().getWebView().getUrl();
        if (currentUrl != null && currentUrl.startsWith(pendingAuthUrl)) {
            authNavigationHandled = true;
            pendingAuthUrl = null;
            return;
        }

        authNavigationHandled = true;
        String targetUrl = pendingAuthUrl;
        pendingAuthUrl = null;
        getBridge().getWebView().post(() -> getBridge().getWebView().loadUrl(targetUrl));
    }
}

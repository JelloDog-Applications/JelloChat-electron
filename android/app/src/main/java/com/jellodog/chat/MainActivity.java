package com.jellodog.chat;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebSettings;
import android.webkit.WebChromeClient;
import android.webkit.ValueCallback;
import android.webkit.WebView;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int AUDIO_PERMISSION_REQUEST_CODE = 1001;
    private static final int FILE_CHOOSER_REQUEST_CODE = 1002;
    private static final String PUBLIC_WEB_HOST = "chat.jellodog.com";
    private static final String APP_USER_AGENT_MARKER = "JelloDogChatAndroidApp";
    private ValueCallback<Uri[]> pendingFileChooserCallback;
    private String pendingAuthUrl;
    private boolean authNavigationHandled;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getBridge().getWebView().setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> request.grant(request.getResources()));
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (pendingFileChooserCallback != null) {
                    pendingFileChooserCallback.onReceiveValue(null);
                }
                pendingFileChooserCallback = filePathCallback;

                Intent intent;
                try {
                    intent = fileChooserParams.createIntent();
                } catch (Exception error) {
                    intent = new Intent(Intent.ACTION_GET_CONTENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType("*/*");
                }

                try {
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE);
                } catch (Exception error) {
                    pendingFileChooserCallback = null;
                    filePathCallback.onReceiveValue(null);
                    return false;
                }

                return true;
            }
        });

        getBridge().getWebView().clearCache(true);
        getBridge().getWebView().clearHistory();
        getBridge().getWebView().getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        getBridge().getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
        if (isDebuggableBuild() && Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getBridge().getWebView().getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }
        appendAppUserAgentMarker();
        ensureAudioPermission();
        handleAuthIntent(getIntent());
        getBridge().getWebView().postDelayed(this::flushPendingAuthUrl, 500);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleAuthIntent(intent);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            ValueCallback<Uri[]> callback = pendingFileChooserCallback;
            pendingFileChooserCallback = null;
            if (callback != null) {
                Uri[] results = resultCode == Activity.RESULT_OK
                        ? WebChromeClient.FileChooserParams.parseResult(resultCode, data)
                        : null;
                callback.onReceiveValue(results);
            }
            return;
        }

        super.onActivityResult(requestCode, resultCode, data);
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

    private boolean isDebuggableBuild() {
        return (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
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

        if ("jellodogchat".equalsIgnoreCase(scheme) && "auth".equalsIgnoreCase(host)) {
            if (isAuthPath(path)) {
                return buildInAppUrl(path, query);
            }
            return null;
        }

        if ("https".equalsIgnoreCase(scheme)
                && PUBLIC_WEB_HOST.equalsIgnoreCase(host)
                && isAuthPath(path)) {
            return buildInAppUrl(path, query);
        }

        return null;
    }

    private boolean isAuthPath(String path) {
        return "/reset-password".equals(path)
                || "/verify-email".equals(path)
                || "/ban-appeal".equals(path);
    }

    private String buildInAppUrl(String path, String query) {
        String currentUrl = getBridge().getWebView().getUrl();
        Uri current = Uri.parse(currentUrl == null || currentUrl.isEmpty() ? "https://localhost" : currentUrl);
        return current.buildUpon()
                .path(path)
                .encodedQuery(query == null || query.isEmpty() ? null : query)
                .fragment(null)
                .build()
                .toString();
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

package  church.b1.mobile;

import android.app.Activity;
import android.content.Context;
import android.graphics.Bitmap;
import android.net.Uri;
import android.provider.MediaStore;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import  church.b1.mobile.printProviders.BrotherProvider;
import  church.b1.mobile.printProviders.PrintHandProvider;
import  church.b1.mobile.printProviders.PrintProviderInterface;

import java.util.ArrayList;
import java.util.List;
import com.facebook.react.bridge.Promise;

public class PrinterHelper extends  ReactContextBaseJavaModule  {
    public static String Status = "Pending init";
    static Runnable statusChangeRunnable;
    public static boolean readyToPrint=false;
    public static ReactContext reactContext = null;
    //static PrintProviderInterface printProvider = new PrintHandProvider();
    static PrintProviderInterface printProvider = new BrotherProvider();
    static Context context = null;

    public PrinterHelper(ReactContext _reactContext) {
        reactContext = _reactContext;
    }

    @ReactMethod
    public void getStatus(Callback cb)
    {
        cb.invoke(PrinterHelper.Status);
    }

    private void sendStatusUpdate() {
        WritableMap params = Arguments.createMap();
        params.putString("status", PrinterHelper.Status);
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("StatusUpdated", params);
    }

    @ReactMethod
    public void scan(final Promise promise) {
      
        promise.resolve(String.join(",", printProvider.scan()));
    }

    public static void updateStatus(String status)
    {
        Status = status;
        if (statusChangeRunnable!=null){
            try {
                statusChangeRunnable.run();
            } catch (Exception e) {}
        }
    }

    @ReactMethod
    public void bind(Callback statusChangeCallback)
    {
        // Runnable runnable
        Activity activity = reactContext.getCurrentActivity();
        context = (activity==null) ? reactContext : activity;

        statusChangeRunnable = new Runnable() { @Override public void run() {  sendStatusUpdate();  } };
        getStatus(statusChangeCallback);
    }

    @ReactMethod
    public void checkInit(String ip, String model)
    {
        printProvider.checkInit(context, ip, model);
    }

    @ReactMethod
    public void printUris(String uriList)
    {
        String[] uris = uriList.split(",");
        List<Bitmap> bmps = new ArrayList<>();
        for (String uriString : uris)
        {
            Uri uri = Uri.parse(uriString);
            try {
                Bitmap  mBitmap = MediaStore.Images.Media.getBitmap(context.getContentResolver(), uri);
                bmps.add(mBitmap);
            } catch (Exception ex)
            {  int a=0; }
        }
        if (bmps.size()>0) printProvider.printBitmaps(bmps);
    }

    @ReactMethod
    public void configure()
    {
        printProvider.configure();
    }

    @Override
    public String getName() {
        return "PrinterHelper";
    }

    public static void logError(String source, String message) {
        WritableMap payload = Arguments.createMap();
        payload.putString("source", source);
        payload.putString("message", message);

        PrinterHelper.reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("onError", payload);
    }

    public static void logEvent(String eventType, String source, String message) {
        WritableMap payload = Arguments.createMap();
        payload.putString("eventType", eventType);
        payload.putString("source", source);
        payload.putString("message", message);

        PrinterHelper.reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onEvent", payload);
    }

}

package  church.b1.mobile.printProviders;

import android.content.Context;
import android.graphics.Bitmap;
import android.net.Uri;
import android.provider.MediaStore;

import  church.b1.mobile.PrintHandHelper;
import  church.b1.mobile.PrinterHelper;

import java.util.ArrayList;
import java.util.List;

public class PrintHandProvider implements PrintProviderInterface {
    static PrintHandHelper phh;
    static Context context = null;
    public static boolean readyToPrint=false;

    public String[] scan() {
        return new String[]{"Scan unavailable"};
    }


    private void setStatus(String status)
    {
        PrinterHelper.updateStatus(status);
        checkPrinterStatus();
    }

    public void checkInit(Context c, String ip, String model) {
        context = c;
        if (phh==null) init();
        checkPrinterStatus();
    }

    public void init()
    {
        System.out.println("Print Method call");
        Runnable r = new Runnable() { @Override public void run() {
            if (PrintHandHelper.Status.equals("Initialized")) setStatus("Initialized");
            else if (PrintHandHelper.Status.equals("PrintHand not installed.")) setStatus("PrintHand required to enable printing.  You may still checkin.");
            else if (PrintHandHelper.Status.equals("Printer not configured.")) setStatus(PrintHandHelper.Status);
            else if (PrintHandHelper.Status.contains("Printer ready")) {
                setStatus(PrintHandHelper.Status);
                readyToPrint=true;
            }
            checkPrinterStatus();
        } };
        phh = new PrintHandHelper(r);
    }

    public void configure()
    {
        try {
            phh.configurePrinter();
        } catch (Exception ex) {
            setStatus("Please install PrintHand application.");
        }
    }

    public void printBitmaps(List<Bitmap> bmps)
    {
        phh.print(bmps, context);
    }

    private void checkPrinterStatus()
    {
        if (PrinterHelper.Status.equals("Pending init")) { setStatus("Initializing print service."); phh.initSdk(context); }
        else if (PrintHandHelper.Status.equals("PrintHand not installed.")) setStatus("PrintHand required to enable printing.  You may still checkin.");
        else if (PrinterHelper.Status.equals("Initialized")) { attachToPrinter(); }
    }

    private void attachToPrinter()
    {
        setStatus("Detecting printer.");
        phh.attach(context);
    }
}

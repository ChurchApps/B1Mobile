package church.b1.mobile.printProviders;

import android.content.Context;
import android.graphics.Bitmap;

import java.util.List;

public interface PrintProviderInterface {
    public void checkInit(Context c, String ip, String model);
    public void configure();
    public void printBitmaps(List<Bitmap> bmps);
    public String[] scan();
}

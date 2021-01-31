import { Alert } from "react-native";

export class Utils {

    static errorMsg(message: string) {
        //const options: SnackBarOptions = { text: message, backgroundColor: StyleConstants.baseColor };
        //Snackbar.show(options);
        Alert.alert("Error", message);
    }


    public static getById(list: any[], id: number): any {
        var result = null;
        list.forEach(item => { if (item.id === id) result = item; });
        return result;
    }

}



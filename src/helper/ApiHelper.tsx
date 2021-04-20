import AsyncStorage from "@react-native-async-storage/async-storage"

export async function getToken(type: String) {
    const churchvalue = await AsyncStorage.getItem('CHURCH_DATA')
    if (churchvalue !== null) {
        const churches = JSON.parse(churchvalue)
        for ( var i=0; i<= churches.apis.length; i++ ) {
            const item = churches.apis[i];
            if (type == item.keyName) {
                return item.jwt
            } else if (type == 'default') {
                return churches.jwt
            }
        }
    }
    return null;
}
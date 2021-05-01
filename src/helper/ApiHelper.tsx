import AsyncStorage from "@react-native-async-storage/async-storage"

export const getToken = async(type: String) => {
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

export const createGroupTree = (groups: any) => {
    var category = "";
    var group_tree: any[] = [];

    const sortedGroups = groups.sort((a: any, b: any) => {
        return ((a.categoryName || "") > (b.categoryName || "")) ? 1 : -1;
    });

    sortedGroups?.forEach((group: any) => {
        if (group.categoryName !== category) group_tree.push({ key: group_tree.length, name: group.categoryName || "", items: [] })
        group_tree[group_tree.length - 1].items.push(group);
        category = group.categoryName || "";
    })
    return group_tree;
}

export const getPeopleIds = (memberList: any) => {
    const peopleIds: any[] = [];
    memberList?.forEach((member: any) => {
        peopleIds.push(member.id)
    })
    const people_Ids = escape(peopleIds.join(","))
    return people_Ids
}
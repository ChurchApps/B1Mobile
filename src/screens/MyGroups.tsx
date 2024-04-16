import { PersonInterface } from "@churchapps/mobilehelper";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { FlatList, Image, SafeAreaView, Text, View } from "react-native";
import { Loader, MainHeader } from "../components";
import { ImageButton, } from "../components/ImageButton";
import Conversations from "../components/Notes/Conversations";
import UserConversations from "../components/Notes/UserConversation";
import { ApiHelper, TimelinePostInterface, UserPostInterface, globalStyles } from "../helpers";
import { TimelineHelper } from "../helpers/Timelinehelper";

const MyGroups = (props: any) => {
  const [groups, setGroups] = useState([]);
  const [UserPost, setUserPost] = useState<TimelinePostInterface[]>([])
  const [loading, setLoading] = useState(false);
  const [people, setPeople] = React.useState<PersonInterface[]>([]);
  const [UserGroups, setUserGroups] = React.useState<any[]>([]);
  const [mergeData, setMergedData] = useState<UserPostInterface[]>([])

  const LoadUserData = async () => {
    setLoading(true);
    try{
      const { posts, people, groups } = await TimelineHelper.loadForUser();
      setUserPost(posts)
      setUserGroups(groups)
      setPeople(people)
      if(posts.length==0){
        console.log("no data found")
      }
    }catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    } 
  }

  const loadData = async () => {
    const data = await ApiHelper.get("/groups/my", "MembershipApi");
    setGroups(data);
  };

  useEffect(() => {
    loadData();
    LoadUserData();
  }, []);

  

  useEffect(() => {
    if(UserPost.length > 0 && UserGroups.length > 0) {
        const combined = UserPost.map((item1, index) => ({
              ...item1,
              ...UserGroups.find((item2) => item2.id === item1.groupId),
            })
          );
          setMergedData(combined);
      }
  },[UserPost, UserGroups])
  console.log("user post is -------->", mergeData)
  const showGroups = (topItem: boolean, item: any) => {
    return (
      <View style={{ marginHorizontal: 10 }}>
        <ImageButton image={{ uri: item.photoUrl }} text={item.name} onPress={() => props.navigation.navigate('GroupDetails', { group: item })} />
      </View>
    );
  };

  const renderItems = (item: any) => {
    console.log("item", item?.item)
    const date = item?.item?.data?.start;
    const TodayDate = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    const startDate = moment(item?.item?.timeSent);
    const endDate = item?.item?.postType == 'event' || item?.item?.postType == 'group' ? moment(TodayDate) : moment(item?.item?.data?.end);
    const timeDifference =endDate.diff(startDate, 'hours') 
    const dayDiff = endDate.diff(startDate, 'days');
    const formattedDate = moment(date).format("MMM D, YYYY h:mm A");
    return (
          <View style={globalStyles.FlatlistViewStyle}>
                  <View style={globalStyles.TitleStyle}>
                    <Text style={globalStyles.TitleTextStyle}>{item?.item?.postType == 'event' || item?.item?.postType == 'group' || item?.item?.postType == 'sermon' || item?.item?.postType == 'venue' ? item?.item?.name : item?.item?.groupName}</Text>
                  </View> 
    
                  {item?.item?.postType == 'event' && item?.item?.photoUrl !== null || 
                  item?.item?.postType == 'sermon' || item?.item?.postType == 'group'  || item?.item?.postType == 'venue' && item?.item?.data?.image != null?
                      <View style={globalStyles.ImageMainView}>
                            <View style={globalStyles.ImageView}>
                                  {item?.item?.postType == 'venue' && item?.item?.data?.image != null ?
                                      <Image source={{ uri: item?.item?.data?.image }} style={globalStyles.groupImageStyle} resizeMode='cover'/>
                                  : item?.item?.postType == 'sermon' ? 
                                      <Image source={{ uri: item?.item?.data?.thumbnail }} style={globalStyles.groupImageStyle} resizeMode='cover' /> 
                                    : <Image source={{ uri: item?.item?.photoUrl }} style={globalStyles.groupImageStyle} resizeMode='cover' /> }
                                </View>
                            </View>
                    : null}

                  {item?.item?.postType == 'event' || item?.item?.postType == 'task' || item?.item?.postType == 'venue'  ?
                      <View style={globalStyles.postTitleView}>
                        <View style={globalStyles.mainTitleView}>
                          <Text>
                              <Text style={globalStyles.eventTextStyle}>{item?.item?.postType == 'event' ? 'Event:' : item?.item?.postType == 'task' ? 'Task:' : null}</Text>
                                  {item?.item?.postType == 'venue' ? 
                                    <Text>
                                        <Text style={globalStyles.eventTextStyle}> {item?.item?.data?.studyName ?? ""}</Text>
                                        <Text style={[globalStyles.eventTextStyle, globalStyles.TaskCreatorColor]}> {item?.item?.data?.name ?? ""}</Text>
                                      </Text> 
                                    :
                                      <Text style={globalStyles.eventTextStyle}> {item?.item?.data?.title ?? ""}</Text>
                                    }

                                  {item?.item?.postType == 'event'  ?
                                      <Text style={[globalStyles.eventTextStyle, globalStyles.DateTextColor]}> - {formattedDate ?? ''}</Text>
                                    :  null}
                              </Text>
                              </View>
                            <View>
                                <Text style={[globalStyles.eventTextStyle, { textAlign: 'right' }]} >{timeDifference >= 24 ? `${dayDiff}d` : `${timeDifference}h`}</Text>
                              </View>
                          </View>
                      : item?.item?.postType == 'group' ?
                          <View style={globalStyles.postTitleView}>
                              <View style={ globalStyles.TitleView}>
                                  <View style={globalStyles.mainTitleView}>
                                        <Text>
                                          <Text style={[globalStyles.eventTextStyle, globalStyles.DateTextColor]}>Conversation for the</Text>
                                          <Text style={[globalStyles.eventTextStyle, globalStyles.TaskCreatorColor]}> {item?.item?.name}</Text>
                                          <Text style={[globalStyles.eventTextStyle, globalStyles.DateTextColor]}> group</Text>
                                        </Text>
                                      </View>
                                  <Text style={[globalStyles.eventTextStyle, { textAlign: 'right' }]} >{timeDifference >= 24 ? `${dayDiff}d` : `${timeDifference}h` }</Text>
                                </View>
                            </View> 
                      : item?.item?.postType == 'sermon' ?   
                          <View style={globalStyles.postTitleView}>
                             <View style={globalStyles.mainTitleView}>
                              <Text style={[globalStyles.eventTextStyle, globalStyles.TaskCreatorColor]}>{item?.item?.data?.title ?? item?.item?.data?.title}</Text>  
                          </View>
                          <View>
                                <Text style={[globalStyles.eventTextStyle, { textAlign: 'right' }]} >{timeDifference >= 24 ? `${dayDiff}d` : `${timeDifference}h`}</Text>
                              </View>
                          </View> 
                      : null
                    }
                  {item?.item?.postType == 'task' ?
                      <View style={globalStyles.PostTitleViewStyle}>
                          <Text>
                                <Text style={[globalStyles.eventTextStyle, globalStyles.TaskCreatorColor]}>{item?.item?.data?.createdByLabel}</Text>
                                <Text style={[globalStyles.eventTextStyle, globalStyles.DateTextColor]}> has requested this from </Text>
                                <Text style={[globalStyles.eventTextStyle, globalStyles.TaskCreatorColor]}>{item?.item?.data?.assignedToLabel}</Text>
                                <Text style={[globalStyles.eventTextStyle,globalStyles.DateTextColor]}> on behalf of </Text>
                                <Text style={[globalStyles.eventTextStyle, globalStyles.TaskCreatorColor]}>{item?.item?.data?.associatedWithLabel}</Text>
                             </Text>
                        </View> 
                      : null
                    }

                  {item?.item?.postType == 'sermon' || item?.item?.postType == 'event' || 
                      item?.item?.postType == 'venue' && item?.item?.data?.description != null ?
                        <View style={globalStyles.PostTitleViewStyle}>
                                <Text style={[globalStyles.eventTextStyle, 
                                    globalStyles.DateTextColor,item?.item?.postType == 'sermon' || 
                                    item?.item?.postType == 'venue' ? globalStyles.tabTextColor : null]}
                                  >{item?.item?.data?.description}</Text>
                           </View> 
                      : null
                   }
                   {
                      item?.item?.postType == 'group' ? 
                        <UserConversations groupId={item?.item?.conversation?.groupId} conversationId={item?.item?.conversation?.id} messages={item?.item?.conversation?.messages} from="myGroup"/> 
                          : <Conversations from="myGroup"  contentType={item?.item?.conversation?.contentType} contentId={item?.item?.conversation?.contentId} groupId={item?.item?.conversation?.groupId} />
                    }
              </View>
          )
      }

  const getGroups = () => {
    return (<FlatList data={groups} contentContainerStyle={{ marginTop: 15 }} renderItem={({ item }) => showGroups(false, item)} keyExtractor={(item: any) => item.id} />);
  };

  return (
    <SafeAreaView style={[globalStyles.grayContainer, { alignSelf: "center", width: '100%' }]}>
        <MainHeader title="My Groups" openDrawer={props.navigation.openDrawer} />
            
          { loading ?  <Loader isLoading={loading} /> : 
                  <FlatList data={mergeData} 
                      contentContainerStyle={globalStyles.FlatListStyle} 
                      showsVerticalScrollIndicator={false}
                      scrollEnabled={true}
                      ListHeaderComponent={()=>( <View style={globalStyles.TimeLineTitleView}>
                        <Text style={[globalStyles.eventTextStyle, globalStyles.LatestUpdateTextStyle]}>Latest Updates</Text>
                      </View>)}
                      ListFooterComponent={()=>(<View style={globalStyles.webViewContainer}>{getGroups()}</View>)}
                      renderItem={item => renderItems(item)} 
                      keyExtractor={(item: any, index: number) => `key-${index}`} 
                  /> 
               }
           
              
      
     </SafeAreaView>
  );
};

export default MyGroups;
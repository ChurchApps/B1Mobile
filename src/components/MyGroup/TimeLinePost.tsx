import { ConversationInterface } from '@churchapps/mobilehelper';
import moment from 'moment';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { ApiHelper, UserHelper, globalStyles } from '@/src/helpers';
import UserConversations from '../Notes/UserConversation';

interface Props {
  item: any;
  index?: number;
  onUpdate:()=>void
}

const TimeLinePost = ({ item, onUpdate } : Props) => {
 console.log("item from my group screen is ------->", item)
    const date = item?.item?.data?.start;
    const TodayDate = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    const startDate = moment(item?.item?.timeSent);
    const endDate = item?.item?.postType == 'event' || item?.item?.postType == 'group' ? moment(TodayDate) : moment(item?.item?.data?.end);
    const timeDifference =endDate.diff(startDate, 'hours') 
    const MinDifference =endDate.diff(startDate, 'minute') 
    const dayDiff = endDate.diff(startDate, 'days');
    const formattedDate = moment(date).format("MMM D, YYYY h:mm A");

    
    const createConversation = async () => {
      console.log("content type is ------->", item?.item?.contentType)
      const conv: ConversationInterface = {
        groupId : item?.item?.data?.groupId,
        churchId:UserHelper.currentUserChurch.church.id,
        contentType: item?.item?.postType,
        contentId: item?.item?.postId,
        title:item?.item?.postType + " #" + item?.item?.postId + " Conversation",
        messages:[],  
      };
      const result = await ApiHelper.post(
        "/conversations",
        [conv],
        "MessagingApi"
      );
      item?.item?.conversation
      console.log("conversation api response is ", result)
      const cId = result[0].id;
      return cId;
    };
    return (
          <View style={globalStyles.FlatlistViewStyle} key={item.index} >
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
                                <Text style={[globalStyles.eventTextStyle, { textAlign: 'right' }]} >{timeDifference >= 24 ? `${dayDiff}d` : timeDifference>=1 ? `${timeDifference}h` : `${MinDifference}m`}</Text>
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
                                  <Text style={[globalStyles.eventTextStyle, { textAlign: 'right' }]} >{timeDifference >= 24 ? `${dayDiff}d` :  timeDifference>=1 ? `${timeDifference}h` : `${MinDifference}m` }</Text>
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
                    <UserConversations conversationId={item?.item?.conversation?.id} groupId={item?.item?.conversation?.groupId} key={item?.item?.conversation?.id} conversation={item?.item?.conversation} createConversation={createConversation} onUpdate={onUpdate}  />                 
              </View>
  )
}
export default TimeLinePost

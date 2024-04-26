import { DimensionHelper } from '@churchapps/mobilehelper';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import FontIcon from "react-native-vector-icons/Entypo";
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ApiHelper, BlockoutDateInterface, Constants, globalStyles } from '../../helpers';
import { BlockoutDateEdits } from './BlockoutDateEdits';

export const BlockoutDates = () => {
  const [blockoutDates, setBlockoutDates] = useState<BlockoutDateInterface[]>([]);
   const [blockoutDate, setBlockoutDate] = useState<any[]>([]);
   const [IsModalOpen, setIsModalOpen] = useState<boolean>(false)

  const loadData = () => {
    ApiHelper.get("/blockoutDates/my", "DoingApi").then((data) => setBlockoutDates(data));
  }
  useEffect(() => { loadData(); }, []);
  
  console.log("blockout date api response---->", blockoutDates)
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleEditClick = (item : any) => {
    setIsModalOpen(true);
    setBlockoutDate(item)
  };
  const renderBlockOutDates = (item: any) => {
    const startDate = moment(item?.item?.startDate).format("MMM D, YYYY")
    const endDate = moment(item?.item?.endDate).format("MMM D, YYYY")
    return (
      <View style={[globalStyles.classesView, { width: '95%' }]}>
          <Text style={[globalStyles.planTextStyle, { width: '40%' }]}>{startDate}</Text>
          <Text style={[globalStyles.planTextStyle, { width: '40%' }]}>{endDate}</Text>
         
          <TouchableOpacity style={{width: '10%' }} onPress={()=>handleEditClick(item?.item)}>
          <FontIcon name='edit' style={{ color: Constants.Colors.Dark_Gray }} size={DimensionHelper.wp('6.5%')}/>
        </TouchableOpacity>
        
       
      </View>
    )
  }
  return (
    <View style={globalStyles.FlatlistViewStyle} >
      <View style={globalStyles.BlockOutDatesView}>
        <View style={globalStyles.PlanIconTitleView}>
        <Icons name='block-helper' style={{ color: Constants.Colors.app_color }} size={DimensionHelper.wp('5.5%')} />
        <Text style={globalStyles.PlanTitleTextStyle}>Blockout Dates</Text>
        </View>
        <View >
        <TouchableOpacity onPress={()=>handleEditClick({}) }>
          <FontIcon name='plus' style={{ color: Constants.Colors.app_color }} size={DimensionHelper.wp('6.5%')}/>
        </TouchableOpacity>
        </View>
      </View>
      <View style={[globalStyles.classesView, { width: '95%' }]}>
        <Text style={[globalStyles.TableHeaderTitle, { width: '40%' }]}>Start Date</Text>
        <Text style={[globalStyles.TableHeaderTitle, { width: '40%' }]}>End Date</Text>
        <Text style={[globalStyles.TableHeaderTitle, { width: '10%' }]}></Text>
      </View>
      <FlatList
        data={blockoutDates}
        scrollEnabled={false}
        keyExtractor={(item: any, index: number) => `key-${index}`}
        renderItem={item => renderBlockOutDates(item)}
        ListEmptyComponent={() => (
          <Text style={globalStyles.PassInputTextStyle}>no Blockout Dates Found</Text>
        )}
      />
      {IsModalOpen && (
            <BlockoutDateEdits visible={IsModalOpen} onClose={handleCloseModal} blockoutDate={blockoutDate} onUpdate={loadData}/>
          )}
    </View>
   
  )
}
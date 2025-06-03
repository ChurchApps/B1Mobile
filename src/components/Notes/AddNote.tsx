import { MessageInterface } from "@churchapps/helpers";
import { DimensionHelper } from "@/src/helpers/DimensionHelper";
import React, { useEffect, useState } from "react";
import { Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome";
import DeleteIcon from 'react-native-vector-icons/MaterialIcons';
import { ApiHelper, Constants, globalStyles } from "@/src/helpers";

type Props = {
  messageId?: any;
  onUpdate: () => void;
  createConversation: () => Promise<string>;
  conversationId?: string;
  type: string,
};

export function AddNote({ ...props }: Props) {
  const [message, setMessage] = useState<MessageInterface | null>()
  const [errors, setErrors] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const headerText = props.messageId ? "Edit note" : "Add a note"
  useEffect(() => {
    if (props.messageId) ApiHelper.get(`/messages/${props.messageId}`, "MessagingApi").then(n => { console.log("message api response", n), setMessage(n) });
    else setMessage({ conversationId: props.conversationId, content: "" });
    return () => {
      setMessage(null);
    };
  }, [props.messageId, props.conversationId])

  const handleChange = (text: string) => {
    setErrors([]);
    const m = { ...message } as MessageInterface;
    m.content = text;
    setMessage(m);
  }

  const validate = () => {
    const result: string[] = [];
    if (!message?.content?.trim()) result.push("Please enter a note.");
    setErrors(result);
    return result.length === 0;
  }

  async function handleSave() {
    try {
      if (validate()) {
        setIsSubmitting(true);
        let cId = props.conversationId;
        if (!cId) cId = await props.createConversation();
        const m = { ...message };
        m.conversationId = cId;
        ApiHelper.post("/messages", [m], "MessagingApi").then((data) => {
          props.onUpdate();
          const m = { ...message } as MessageInterface;
          m.content = "";
          setMessage(m);
        })
          .catch((error) => { console.error("Error calling message API:", error); })
          .finally(() => { setIsSubmitting(false); setMessage(null) })
      }
    } catch (err) {
      console.log("err in catch block when call message api", err);
    }
  };

  async function deleteNote() {
    await ApiHelper.delete(`/messages/${props.messageId}`, "MessagingApi")
    props.onUpdate()
  }

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: '100%',
          marginTop: props.type === "new" ? 16 : 0,
          marginBottom: props.type === "new" ? 2 : 16,
        }}
      >
        <TextInput
          onChangeText={text => handleChange(text)}
          placeholderTextColor={'gray'}
          style={[{
            ...globalStyles.fundInput,
            fontSize: DimensionHelper.hp(1.6),
            borderBottomWidth: 1,
            borderColor: 'lightgray',
            marginLeft: props.type === "new" ? 8 : 50,
            width: props.type === "new" ? DimensionHelper.wp(80) : props.type == 'reply' && props.messageId ? DimensionHelper.wp(60) : DimensionHelper.wp(65),
            paddingTop: DimensionHelper.hp(1.8),
          }]}
          multiline
          blurOnSubmit={true}
          onSubmitEditing={() => Keyboard.dismiss()}
          numberOfLines={4}
          value={message?.content}
          placeholder={"Add a note"}
        />
        <View
          style={{
            marginHorizontal: props.messageId ? DimensionHelper.wp(1) : DimensionHelper.wp(2.5),
            flexDirection: 'row', alignItems: 'center',
            width: props.messageId ? DimensionHelper.wp(15) : DimensionHelper.wp(5),
            justifyContent: props.messageId ? 'space-between' : 'center'
          }}
        >
          <TouchableOpacity onPress={() => handleSave()} >
            <Icon
              name={"send"}
              color={Constants.Colors.app_color}
              size={DimensionHelper.wp(5)}
            />
          </TouchableOpacity>
          {props.messageId && (
            <TouchableOpacity onPress={() => deleteNote()} >
              <DeleteIcon
                name={"delete"}
                color={Constants.Colors.app_color}
                size={DimensionHelper.wp(6.2)}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {errors && errors.length > 0 && (
        <View style={{ marginLeft: DimensionHelper.wp(15) }}>
          {errors.map((error: string) => (
            <Text key={`error-${error.toLowerCase().replace(/\s+/g, '-')}`} style={{ color: Constants.Colors.button_red }}>
              {error}
            </Text>
          ))}
        </View>
      )}
    </>
  );
}

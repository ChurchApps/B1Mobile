import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import CreateEvent from "../../src/components/eventCalendar/CreateEvent";
import { EventInterface } from "../../src/mobilehelper";

export default function CreateEventScreen() {
  const { event: eventParam, groupId } = useLocalSearchParams();
  const router = useRouter();

  // Parse the event data from the route params
  const event: EventInterface = eventParam ? JSON.parse(eventParam as string) : {};

  const handleDone = () => {
    if (groupId) {
      // Navigate back to the specific group's calendar tab
      router.navigate({
        pathname: `/(drawer)/groupDetails/[id]`,
        params: { id: groupId, activeTab: "3" } // 3 is the calendar tab
      });
    } else {
      router.back();
    }
  };

  return (
    <CreateEvent 
      event={event} 
      onDone={handleDone}
    />
  );
}
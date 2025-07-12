import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import CreateEvent from "../../src/components/eventCalendar/CreateEvent";
import { EventInterface } from "../../src/mobilehelper";

export default function CreateEventScreen() {
  const { event: eventParam } = useLocalSearchParams();
  const router = useRouter();

  // Parse the event data from the route params
  const event: EventInterface = eventParam ? JSON.parse(eventParam as string) : {};

  const handleDone = () => {
    router.back();
  };

  return (
    <CreateEvent 
      event={event} 
      onDone={handleDone}
    />
  );
}
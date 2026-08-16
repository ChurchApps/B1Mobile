import React from "react";
import { WebsiteScreen } from "@/components/WebsiteScreen";

import { useLocalSearchParams } from "expo-router";
import { useCurrentUserChurch } from "@/stores/useUserStore";

const Lessons = () => {
  const { url, title } = useLocalSearchParams<{ url: any; title: any }>();
  const currentUserChurch = useCurrentUserChurch();

  return <WebsiteScreen url={url} title={title} sessionJwt={currentUserChurch?.jwt} />;
};

export default Lessons;

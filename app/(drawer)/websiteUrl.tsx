import React from "react";
import { WebsiteScreen } from "@/components/WebsiteScreen";

import { useLocalSearchParams } from "expo-router";
import { useScreenHeader } from "@/hooks/useNavigationHeader";

const WebsiteUrl = () => {
  const { url, title } = useLocalSearchParams<{ url: any; title: any }>();

  useScreenHeader({ title: title, placeholder: "Website" });

  return <WebsiteScreen url={url} title={title} />;
};

export default WebsiteUrl;

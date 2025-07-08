import React from "react";
import { WebsiteScreen } from "@/components/WebsiteScreen";

import { useLocalSearchParams } from "expo-router";

const Bible = () => {
  const { url, title } = useLocalSearchParams<{ url: any; title: any }>();
  return <WebsiteScreen url={url} title={title} />;
};

export default Bible;

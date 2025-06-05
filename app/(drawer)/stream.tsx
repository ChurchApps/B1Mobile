import React from "react";
import { WebsiteScreen } from "@/src/components/WebsiteScreen";
import { useLocalSearchParams } from "expo-router";

const Stream = () => {
  const { url, title } = useLocalSearchParams<{ url: any; title: any }>();

  return <WebsiteScreen url={url} title={title} />;
};

export default Stream;

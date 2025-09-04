import React from "react";
import { WebsiteScreen } from "@/components/WebsiteScreen";

import { Redirect, useLocalSearchParams } from "expo-router";

const Page = () => {
  const { url, title } = useLocalSearchParams<{ url: any; title: any }>();

  if (!url) {
    return <Redirect href="/dashboard" />;
  }

  return <WebsiteScreen url={url} title={title} />;
};

export default Page;

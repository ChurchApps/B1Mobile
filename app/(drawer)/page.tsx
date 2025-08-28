import React from "react";
import { WebsiteScreen } from "@/components/WebsiteScreen";

import { useLocalSearchParams } from "expo-router";
import Dashboard from "./dashboard";

const Page = () => {
  const { url, title } = useLocalSearchParams<{ url: any; title: any }>();

  if(!url) {
    return <Dashboard />
  }

  return <WebsiteScreen url={url} title={title} />;
};

export default Page;


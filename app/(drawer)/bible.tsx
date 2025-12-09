import { WebsiteScreen } from "@/components/WebsiteScreen";
import { useLocalSearchParams } from "expo-router";
// import { BiblePageYouVersion } from "@/components/BiblePageYouVersion";

const Bible = () => {
  const { url, title } = useLocalSearchParams<{ url: any; title: any }>();
  // return <BiblePageYouVersion />;
  return <WebsiteScreen url={url} title={title} />;
};

export default Bible;

import React from "react";
import { MainHeader } from "./wrapper/MainHeader";

interface Props {
  onPress: () => void;
  title: string;
}

export function SimpleHeader(props: Props) {
  return <MainHeader title={props.title} hideBell={true} />;
}

import { router } from "expo-router";

type NotificationNavMethod =

    | "push"
    | "replace";

export interface NotificationRouteData {
  type?: string;
  chatId?: string;
  contentType?: string;
  contentId?: string;
  groupId?: string;
  [
    key: string
  ]: any;
}

let lastHandledNotificationId =
  "";

const normalizeString =
  (
    value?:
      | string
      | number
      | null,
  ) =>
    value ==
    null
      ? ""
      : String(
          value,
        );

const navigate =
  (
    method: NotificationNavMethod,
    route:
      | string
      | {
          pathname: string;
          params?: Record<
            string,
            string
          >;
        },
  ) => {
    if (
      typeof route ===
      "string"
    ) {
      if (
        method ===
        "replace"
      )
        router.replace(
          route,
        );
      else
        router.push(
          route,
        );
      return;
    }

    if (
      method ===
      "replace"
    )
      router.replace(
        route,
      );
    else
      router.push(
        route,
      );
  };

export const navigateFromNotificationData =
  (
    data?: NotificationRouteData,
    method: NotificationNavMethod = "push",
  ) => {
    if (
      !data
    )
      return false;

    if (
      data.type ===
        "chat" &&
      data.chatId
    ) {
      navigate(
        method,
        {
          pathname:
            "/messageScreenRoot",
          params:
            {
              chatId:
                normalizeString(
                  data.chatId,
                ),
            },
        },
      );
      return true;
    }

    const type =
      normalizeString(
        data.contentType ||
          data.type,
      ).toLowerCase();
    const contentId =
      normalizeString(
        data.contentId ||
          data.groupId,
      );

    if (
      !type
    )
      return false;

    switch (
      type
    ) {
      case "group":
        if (
          !contentId
        )
          return false;
        navigate(
          method,
          {
            pathname:
              "/groupDetails/[id]",
            params:
              {
                id: contentId,
                openChat:
                  "1",
                chatTab:
                  "discussions",
              },
          },
        );
        return true;
      case "groupannouncement":
        if (
          !contentId
        )
          return false;
        navigate(
          method,
          {
            pathname:
              "/groupDetails/[id]",
            params:
              {
                id: contentId,
                openChat:
                  "1",
                chatTab:
                  "announcements",
              },
          },
        );
        return true;
      case "plan":
      case "schedule":
        if (
          !contentId
        )
          return false;
        navigate(
          method,
          `/planDetails/${contentId}`,
        );
        return true;
      case "notification":
        navigate(
          method,
          "/(drawer)/notifications",
        );
        return true;
      default:
        navigate(
          method,
          "/(drawer)/notifications",
        );
        return true;
    }
  };

export const canHandleNotification =
  (
    notificationId?:
      | string
      | null,
  ) => {
    const normalizedId =
      normalizeString(
        notificationId,
      );
    return (
      normalizedId.length >
        0 &&
      normalizedId !==
        lastHandledNotificationId
    );
  };

export const markNotificationHandled =
  (
    notificationId?:
      | string
      | null,
  ) => {
    const normalizedId =
      normalizeString(
        notificationId,
      );
    if (
      normalizedId
    )
      lastHandledNotificationId =
        normalizedId;
  };

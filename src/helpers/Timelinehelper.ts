import { ApiHelper, ArrayHelper, ConversationInterface, GroupInterface, PersonInterface } from "../mobilehelper";
import { TimelinePostInterface } from "./Interfaces";

export class TimelineHelper {
  static async loadForUser() {
    const initialConversations: ConversationInterface[] = await ApiHelper.get("/conversations/posts", "MessagingApi");
    const allPosts = await TimelineHelper.loadRelatedData(initialConversations, null);
    TimelineHelper.mergeConversations(allPosts, initialConversations);
    const { people, groups } = await TimelineHelper.populatePostsAndPeople(allPosts);
    return { posts: allPosts, people, groups };
  }

  static async populatePostsAndPeople(allPosts: TimelinePostInterface[]) {
    await TimelineHelper.populateConversations(allPosts);
    const { people, groups } = await TimelineHelper.populateEntities(allPosts);
    TimelineHelper.standardizePosts(allPosts, people);
    return { people, groups };
  }

  static async loadRelatedData(initialConversations: ConversationInterface[], groupId?: string | null) {
    const promises: any = [];
    const taskIds: string[] = [];
    const eventIds: string[] = [];
    const venueIds: string[] = [];
    const sermonIds: string[] = [];
    initialConversations.forEach(conv => {
      if (conv.contentType === "task" && taskIds.indexOf(conv.contentId as string) === -1) taskIds.push(conv.contentId as string);
      if (conv.contentType === "event" && eventIds.indexOf(conv.contentId as string) === -1) eventIds.push(conv.contentId as string);
      if (conv.contentType === "venue" && venueIds.indexOf(conv.contentId as string) === -1) venueIds.push(conv.contentId as string);
      if (conv.contentType === "sermon" && sermonIds.indexOf(conv.contentId as string) === -1) sermonIds.push(conv.contentId as string);
    });
    if (groupId) {
      await promises.push(ApiHelper.get("/events/timeline/group/" + groupId + "?eventIds=" + eventIds.join(","), "ContentApi"));
    } else {
      await promises.push(ApiHelper.get("/tasks/timeline?taskIds=" + taskIds.join(","), "DoingApi"));
      await promises.push(ApiHelper.get("/events/timeline?eventIds=" + eventIds.join(","), "ContentApi"));
    }
    if (venueIds.length > 0) {
      await promises.push(ApiHelper.get("/venues/timeline?venueIds=" + venueIds.join(","), "LessonsApi"));
    }
    if (sermonIds.length > 0) {
      // No additional API call needed for sermons, handled by the anonymous call below
    }
    await promises.push(ApiHelper.getAnonymous("/sermons/timeline?sermonIds=" + sermonIds.join(","), "ContentApi"));
    const results = await Promise.all(promises);
    let allPosts: TimelinePostInterface[] = [];
    results.forEach((result: any[]) => {
      result.forEach(r => {
        allPosts.push({ postId: r.postId, postType: r.postType, groupId: r.groupId, data: r });
      });
    });
    return allPosts;
  }

  static mergeConversations(allPosts: TimelinePostInterface[], initialConversations: ConversationInterface[]) {
    allPosts.forEach(p => {
      p.conversation = undefined;
    });
    initialConversations.forEach(conv => {
      let existingPost = ArrayHelper.getOne(allPosts, "postId", conv.contentId);
      if (existingPost) {
        existingPost.conversation = conv;
        if (conv.groupId) existingPost.groupId = conv.groupId;
      } else {
        const conversation: ConversationInterface = {
          id: conv.id ?? "",
          churchId: conv.churchId ?? "",
          contentType: conv.contentType ?? "",
          contentId: conv.contentId ?? "",
          title: conv.title ?? "",
          dateCreated: conv.dateCreated ?? new Date(),
          groupId: conv.groupId ?? "",
          visibility: conv.visibility ?? "",
          firstPostId: conv.firstPostId ?? "",
          lastPostId: conv.lastPostId ?? "",
          allowAnonymousPosts: conv.allowAnonymousPosts ?? false,
          postCount: conv.postCount ?? 0,
          messages: conv.messages ?? []
        };
        allPosts.push({
          postId: conv.contentId,
          postType: conv.contentType,
          groupId: conv.groupId,
          conversation
        });
      }
    });
  }

  static async populateEntities(allPosts: TimelinePostInterface[]) {
    const peopleIds: string[] = [];
    const groupIds: string[] = [];
    allPosts.forEach(p => {
      p.conversation?.messages?.forEach(m => {
        if (m.personId && peopleIds.indexOf(m.personId) === -1) peopleIds.push(m.personId);
      });
      if (p.postType === "group" && p.conversation?.contentId && groupIds.indexOf(p.conversation.contentId) === -1) groupIds.push(p.conversation.contentId);
      if (p.postType === "event" && p.data && p.data.groupId && groupIds.indexOf(p.data.groupId) === -1) groupIds.push(p.data.groupId);
      if (p.postType === "task") {
        if (p.data.associatedWithType === "person" && peopleIds.indexOf(p.data.associatedWithId) === -1) peopleIds.push(p.data.associatedWithId);
        if (p.data.createdByType === "person" && peopleIds.indexOf(p.data.createdById) === -1) peopleIds.push(p.data.createdById);
        if (p.data.assignedToType === "person" && peopleIds.indexOf(p.data.assignedToId) === -1) peopleIds.push(p.data.assignedToId);
        if (p.data.associatedWithType === "group" && peopleIds.indexOf(p.data.associatedWithId) === -1) groupIds.push(p.data.associatedWithId);
        if (p.data.createdByType === "group" && peopleIds.indexOf(p.data.createdById) === -1) groupIds.push(p.data.createdById);
        if (p.data.assignedToType === "group" && peopleIds.indexOf(p.data.assignedToId) === -1) groupIds.push(p.data.assignedToId);
      }
    });

    let people: PersonInterface[] = [];
    let groups: GroupInterface[] = [];

    if (peopleIds.length > 0 || groupIds.length > 0) {
      const data = await ApiHelper.get("/people/timeline?personIds=" + peopleIds.join(",") + "&groupIds=" + groupIds.join(","), "MembershipApi");
      if (data.people) people = data.people;
      if (data.groups) groups = data.groups;
    }
    return { people, groups };
  }

  static async populateConversations(allPosts: TimelinePostInterface[]) {
    const conversationIds: string[] = [];
    allPosts.forEach(p => {
      if (p.conversationId && conversationIds.indexOf(p.conversationId) === -1 && !p.conversation?.id) conversationIds.push(p.conversationId);
    });
    if (conversationIds.length > 0) {
      const allConversations: ConversationInterface[] = await ApiHelper.get("/conversations/timeline/ids?ids=" + conversationIds.join(","), "MessagingApi");
      allPosts.forEach(p => {
        if (!p.conversation?.id) p.conversation = ArrayHelper.getOne(allConversations, "conversationId", p.conversationId);
      });
    }
  }

  static standardizePosts(allPosts: TimelinePostInterface[], people: PersonInterface[]) {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() - 7);

    // Batch process all posts to avoid repeated operations
    const processedPosts = allPosts.map(p => {
      // Process messages once per post
      if (p.conversation?.messages) {
        p.conversation.messages.forEach(m => {
          if (m.timeSent && typeof m.timeSent === "string") {
            m.timeSent = new Date(m.timeSent);
          }
          if (!m.person && m.personId) {
            m.person = ArrayHelper.getOne(people, "id", m.personId);
          }
        });
      }

      // Process dates once per post
      if (p.timeSent && typeof p.timeSent === "string") {
        p.timeSent = new Date(p.timeSent);
      }

      if (!p.timeSent) {
        const messages = p?.conversation?.messages;
        p.timeSent = messages && messages.length > 0 ? messages[0].timeSent || defaultDate : defaultDate;
      }

      const messages = p?.conversation?.messages;
      p.timeUpdated = messages && messages.length > 0 ? messages[messages.length - 1].timeSent : p.timeSent;

      return p;
    });

    // Single sort operation at the end
    ArrayHelper.sortBy(processedPosts, "timeUpdated", true);
  }
}

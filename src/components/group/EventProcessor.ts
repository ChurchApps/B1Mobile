import dayjs from "dayjs";
import { EventHelper } from "@churchapps/helpers/src/EventHelper";
import { EventInterface } from "../../mobilehelper";

export class EventProcessor {
  static updateTime(data: any): EventInterface[] {
    if (!data || !Array.isArray(data)) return [];

    try {
      const tz = new Date().getTimezoneOffset();
      return data.map((d: EventInterface) => {
        try {
          const ev = { ...d };
          ev.start = ev.start ? new Date(ev.start) : new Date();
          ev.end = ev.end ? new Date(ev.end) : new Date();
          ev.start.setMinutes(ev.start.getMinutes() - tz);
          ev.end.setMinutes(ev.end.getMinutes() - tz);
          return ev;
        } catch (error) {
          console.warn("Error updating time for event:", d.id, error);
          return d;
        }
      });
    } catch (error) {
      console.error("Error updating event times:", error);
      return [];
    }
  }

  static expandEvents(allEvents: EventInterface[]): EventInterface[] {
    if (!allEvents || allEvents.length === 0) return [];

    try {
      const expandedEvents: EventInterface[] = [];
      const startRange = dayjs().subtract(3, "months");
      const endRange = dayjs().add(3, "months");
      

      // Process limited events for performance
      const eventsToProcess = allEvents.slice(0, 30);

      eventsToProcess.forEach((event: any) => {
        try {
          const ev = { ...event };
          ev.start = ev.start ? dayjs.utc(ev.start) : undefined;
          ev.end = ev.end ? dayjs.utc(ev.end) : undefined;

          if (ev.start && ev.end) {
            if (event.recurrenceRule) {
              try {
                const dates = EventHelper.getRange(event, startRange.toDate(), endRange.toDate());
                if (dates && dates.length > 10) {
                }
                if (dates && dates.length > 0) {
                  // Limit recurring instances to prevent performance issues
                  const limitedDates = dates.length > 25 ? dates.slice(0, 25) : dates;
                  if (dates.length > 25) {
                  }
                  limitedDates.forEach(date => {
                    // Stop if we have too many total events
                    if (expandedEvents.length >= 150) return;
                    
                    const evInstance = { ...event };
                    const diff = ev.end.diff(ev.start);
                    evInstance.start = dayjs(date);
                    evInstance.end = evInstance.start.add(diff, "ms");
                    expandedEvents.push(evInstance);
                  });
                  EventHelper.removeExcludeDates(expandedEvents);
                }
              } catch (recurrenceError) {
                console.warn("Error processing recurrence rule for event:", event.id, recurrenceError);
                // Fallback to single event
                expandedEvents.push(ev);
              }
            } else {
              // For non-recurring events, check if they're in our date range
              const eventDate = dayjs(ev.start);
              if (eventDate.isAfter(startRange) && eventDate.isBefore(endRange)) {
                expandedEvents.push(ev);
              } else {
              }
            }
          }
        } catch (eventError) {
          console.warn("Error processing event:", event.id, eventError);
        }
      });
      return expandedEvents;
    } catch (error) {
      console.error("Error expanding events:", error);
      return [];
    }
  }

  static calculateMarkedDates(expandedEvents: EventInterface[], activeTab: number): any {
    // Only calculate when calendar tab is active and events are loaded
    if (activeTab !== 3 || !expandedEvents || expandedEvents.length === 0) {
      return {};
    }

    const marked: any = {};

    try {
      // Mark only first 30 events for performance
      expandedEvents.slice(0, 30).forEach(event => {
        if (!event.start) return;

        const dateString = dayjs(event.start).format("YYYY-MM-DD");

        if (!marked[dateString]) {
          marked[dateString] = {
            dots: [],
            events: []
          };
        }

        marked[dateString].dots.push({ color: "#0D47A1" });
        marked[dateString].events.push(event);
        marked[dateString].marked = true;
      });
    } catch (error) {
      console.error("Error calculating marked dates:", error);
    }

    return marked;
  }
}
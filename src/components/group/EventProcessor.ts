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

      eventsToProcess.forEach((event: any, index: number) => {
        try {
          const ev = { ...event };
          ev.start = ev.start ? dayjs.utc(ev.start) : undefined;
          ev.end = ev.end ? dayjs.utc(ev.end) : undefined;

          if (ev.start && ev.end) {
            if (event.recurrenceRule) {
              try {
                // Validate recurrence rule before processing
                const rule = event.recurrenceRule.toUpperCase();
                
                // Check for known problematic patterns
                if (rule.includes('FREQ=DAILY') && rule.includes('BYDAY=')) {
                  expandedEvents.push(ev); // Add single instance only
                  return;
                }
                
                // Check for conflicting BYSETPOS with incompatible frequency
                if (rule.includes('BYSETPOS=') && rule.includes('FREQ=DAILY')) {
                  expandedEvents.push(ev); // Add single instance only
                  return;
                }
                
                // Check for overly complex rules that might cause performance issues
                const ruleComplexity = (rule.match(/BY[A-Z]+=/g) || []).length;
                if (ruleComplexity > 3) {
                  expandedEvents.push(ev); // Add single instance only
                  return;
                }
                
                // Check for missing UNTIL date that could cause infinite expansion
                if (!rule.includes('UNTIL=') && !rule.includes('COUNT=')) {
                  // Add a 90-day UNTIL if missing to prevent infinite expansion
                  const untilDate = dayjs().add(90, 'days').format('YYYYMMDD[T]HHmmss[Z]');
                  event.recurrenceRule += `;UNTIL=${untilDate}`;
                }
                
                // Add timeout protection and validation
                const timeoutPromise = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('EventHelper.getRange timeout')), 1000)
                );
                
                let dates;
                try {
                  dates = EventHelper.getRange(event, startRange.toDate(), endRange.toDate());
                } catch (getRangeError) {
                  // Fallback to single event
                  expandedEvents.push(ev);
                  return;
                }
                
                // Validate and limit dates more strictly
                if (dates && dates.length > 0) {
                  // Skip events with excessive recurrence to prevent performance issues
                  if (dates.length > 50) {
                    // Add just the first instance as fallback
                    expandedEvents.push(ev);
                    return;
                  }
                  
                  // Limit recurring instances to prevent performance issues
                  const limitedDates = dates.length > 15 ? dates.slice(0, 15) : dates;
                  
                  limitedDates.forEach(date => {
                    // Stop if we have too many total events
                    if (expandedEvents.length >= 100) return;
                    
                    const evInstance = { ...event };
                    const diff = ev.end.diff(ev.start);
                    evInstance.start = dayjs(date);
                    evInstance.end = evInstance.start.add(diff, "ms");
                    expandedEvents.push(evInstance);
                  });
                  
                  try {
                    EventHelper.removeExcludeDates(expandedEvents);
                  } catch (excludeError) {
                    // Continue without exclude date removal
                  }
                }
              } catch (recurrenceError) {
                // Fallback to single event
                expandedEvents.push(ev);
              }
            } else {
              // For non-recurring events, check if they're in our date range
              const eventDate = dayjs(ev.start);
              if (eventDate.isAfter(startRange) && eventDate.isBefore(endRange)) {
                expandedEvents.push(ev);
              }
            }
          }
        } catch (eventError) {
          // Skip problematic events
        }
      });
      return expandedEvents;
    } catch (error) {
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
      // Return empty marked dates on error
    }

    return marked;
  }
}
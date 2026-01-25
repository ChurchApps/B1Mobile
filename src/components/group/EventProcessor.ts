import dayjs from "../../helpers/dayjsConfig";
import { EventHelper, EventInterface } from "@churchapps/helpers";

export class EventProcessor {
  private static monthCache = new Map<string, { events: EventInterface[]; timestamp: number }>();
  private static CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static clearCache(): void {
    console.log('Clearing EventProcessor cache');
    this.monthCache.clear();
  }

  static updateTime(data: any): EventInterface[] {
    if (!data || !Array.isArray(data)) return [];

    try {
      return data.map((d: EventInterface) => {
        try {
          const ev = { ...d };
          // API stores times in UTC, convert to local time for display
          // JavaScript Date constructor automatically handles timezone conversion
          // when parsing ISO strings, so we don't need manual offset calculation
          ev.start = ev.start ? new Date(ev.start) : new Date();
          ev.end = ev.end ? new Date(ev.end) : new Date();
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

  static expandEventsForMonth(allEvents: EventInterface[], monthString: string): EventInterface[] {
    if (!allEvents || allEvents.length === 0) return [];
    
    // Check cache first - include data hash to ensure fresh calculation when events change
    const dataHash = allEvents.map(e => `${e.id}-${e.title}-${e.description}-${e.start}-${e.end}-${e.recurrenceRule}-${e.visibility}`).join('|');
    // Use a more robust hash that includes title/description changes
    const hashCode = dataHash.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a; // Convert to 32bit integer
    }, 0);
    const cacheKey = `${monthString}-${allEvents.length}-${Math.abs(hashCode)}`;
    const cached = this.monthCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`Cache hit for ${monthString} - returning ${cached.events.length} cached events (key: ${cacheKey})`);
      return cached.events;
    }
    console.log(`Cache miss for ${monthString} - calculating events (key: ${cacheKey})`);
    
    const startTime = performance.now();
    
    try {
      const expandedEvents: EventInterface[] = [];
      const targetMonth = dayjs(monthString);
      const startRange = targetMonth.startOf('month').toDate();
      const endRange = targetMonth.endOf('month').toDate();

      // Pre-filter events to only those that could possibly be in this month
      const targetYear = targetMonth.year();
      const targetMonthNum = targetMonth.month();
      
      const relevantEvents = allEvents.filter(event => {
        if (!event.start) return false;
        
        const eventStart = new Date(event.start);
        const eventYear = eventStart.getFullYear();
        const eventMonth = eventStart.getMonth();
        
        if (event.recurrenceRule) {
          // For recurring events, do more intelligent filtering
          if (eventStart > endRange) return false;
          
          // Quick check for UNTIL clause
          const rule = event.recurrenceRule.toUpperCase();
          if (rule.includes('UNTIL=')) {
            const untilMatch = rule.match(/UNTIL=(\d{8}T?\d{6}Z?)/);
            if (untilMatch) {
              const untilDate = new Date(untilMatch[1].replace(/(\d{4})(\d{2})(\d{2})T?(\d{2})?(\d{2})?(\d{2})?Z?/, '$1-$2-$3T$4:$5:$6Z'));
              if (untilDate < startRange) return false;
            }
          }
          
          // For monthly events, check if they could possibly occur in target month
          if (rule.includes('FREQ=MONTHLY')) {
            // If event is same month/day pattern, include it
            return true;
          }
          
          // For weekly events starting way before, limit to reasonable range
          if (rule.includes('FREQ=WEEKLY')) {
            const monthsBack = (targetYear - eventYear) * 12 + (targetMonthNum - eventMonth);
            if (monthsBack > 12) return false; // Skip weekly events more than a year old
          }
          
          // For daily events, be very restrictive
          if (rule.includes('FREQ=DAILY')) {
            const daysBack = Math.floor((startRange.getTime() - eventStart.getTime()) / (24 * 60 * 60 * 1000));
            if (daysBack > 365) return false; // Skip daily events more than a year old
          }
          
          return true;
        } else {
          // For single events, exact date range check
          return eventStart >= startRange && eventStart <= endRange;
        }
      });

      console.log(`Filtered ${allEvents.length} events down to ${relevantEvents.length} relevant for ${monthString}`);

      // Process relevant events with optimizations
      for (const event of relevantEvents) {
        try {
          if (event.recurrenceRule) {
            // Limit recurring event expansion with safety timeout
            const recurrenceStartTime = performance.now();
            
            try {
              // Check for known problematic patterns first
              const rule = event.recurrenceRule.toUpperCase();
              let dates: Date[] = [];
              
              // Skip complex monthly rules that are known to be slow
              if (rule.includes('BYSETPOS=') && rule.includes('BYDAY=')) {
                console.log(`Using simple expansion for complex monthly rule: ${event.title}`);
                // For complex monthly rules, just add the event if it falls in this month
                const eventDate = new Date(event.start);
                if (eventDate.getMonth() === targetMonth.month() && 
                    eventDate.getFullYear() === targetMonth.year()) {
                  dates = [eventDate];
                } else if (eventDate < startRange) {
                  // Try to calculate just this month's occurrence
                  // For "3rd Sunday" type rules, manually calculate
                  const dayOfWeek = eventDate.getDay();
                  const weekNumber = parseInt(rule.match(/BYSETPOS=(\d+)/)?.[1] || '1');
                  
                  // Find the nth occurrence of the day in the target month
                  const firstDay = new Date(targetMonth.year(), targetMonth.month(), 1);
                  let targetDay = firstDay;
                  
                  // Find first occurrence of the day of week
                  while (targetDay.getDay() !== dayOfWeek) {
                    targetDay.setDate(targetDay.getDate() + 1);
                  }
                  
                  // Move to nth occurrence
                  targetDay.setDate(targetDay.getDate() + (weekNumber - 1) * 7);
                  
                  // Check if still in target month
                  if (targetDay.getMonth() === targetMonth.month()) {
                    dates = [targetDay];
                  }
                }
              } else {
                // Use EventHelper for simpler rules
                dates = EventHelper.getRange(event, startRange, endRange);
              }
              
              // Limit to reasonable number of instances per month
              const limitedDates = dates.slice(0, 31);
              const eventDuration = new Date(event.end).getTime() - new Date(event.start).getTime();
              
              limitedDates.forEach((date: Date) => {
                expandedEvents.push({
                  ...event,
                  start: date,
                  end: new Date(date.getTime() + eventDuration)
                });
              });
              
              const recurrenceTime = performance.now() - recurrenceStartTime;
              if (recurrenceTime > 100) {
                console.warn(`Slow recurring event processing: ${event.title} took ${recurrenceTime.toFixed(2)}ms (rule: ${event.recurrenceRule})`);
              }
            } catch (recurrenceError) {
              console.warn('Recurrence processing failed for:', event.title, recurrenceError);
              // Add single instance as fallback
              const eventDate = new Date(event.start);
              if (eventDate >= startRange && eventDate <= endRange) {
                expandedEvents.push({
                  ...event,
                  start: new Date(event.start),
                  end: new Date(event.end)
                });
              }
            }
          } else {
            // Single events - already pre-filtered
            expandedEvents.push({
              ...event,
              start: new Date(event.start),
              end: new Date(event.end)
            });
          }
        } catch (eventError) {
          console.warn('Error processing event:', event.title, eventError);
        }
      }

      // Batch process exclude dates only if we have expanded events
      if (expandedEvents.length > 0) {
        try {
          EventHelper.removeExcludeDates(expandedEvents);
        } catch (excludeError) {
          console.warn('Failed to remove exclude dates:', excludeError);
        }
      }
      
      const totalTime = performance.now() - startTime;
      console.log(`Month expansion completed in ${totalTime.toFixed(2)}ms. Found ${expandedEvents.length} events for ${monthString} (key: ${cacheKey})`);
      
      // Cache the result
      this.monthCache.set(cacheKey, {
        events: expandedEvents,
        timestamp: Date.now()
      });
      
      // Clean up old cache entries (keep only last 10 months)
      if (this.monthCache.size > 10) {
        const entries = Array.from(this.monthCache.entries());
        entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
        this.monthCache.clear();
        entries.slice(0, 10).forEach(([key, value]) => {
          this.monthCache.set(key, value);
        });
      }
      
      return expandedEvents;
    } catch (error) {
      console.error('Error in month-based event expansion:', error);
      return [];
    }
  }

  // Legacy method - now redirects to month-based expansion for current month
  static expandEvents(allEvents: EventInterface[]): EventInterface[] {
    return EventProcessor.expandEventsForMonth(allEvents, dayjs().format("YYYY-MM-DD"));
  }

  // Original complex expansion method (now unused)
  static expandEventsOld(allEvents: EventInterface[]): EventInterface[] {
    if (!allEvents || allEvents.length === 0) return [];

    try {
      const expandedEvents: EventInterface[] = [];
      const startRange = dayjs().subtract(6, "months");
      const endRange = dayjs().add(12, "months"); // Expand to 1 year in future for better event visibility
      

      // Process limited events for performance - prioritize non-recurring events first
      const nonRecurringEvents = allEvents.filter(e => !e.recurrenceRule);
      const recurringEvents = allEvents.filter(e => e.recurrenceRule);
      const eventsToProcess = [...nonRecurringEvents, ...recurringEvents].slice(0, 50);

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
    if (activeTab !== 4 || !expandedEvents || expandedEvents.length === 0) {
      return {};
    }

    const marked: any = {};

    try {
      // Mark only first 50 events for performance
      expandedEvents.slice(0, 50).forEach(event => {
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
      console.error('Error calculating marked dates:', error);
      // Return empty marked dates on error
    }

    return marked;
  }
}
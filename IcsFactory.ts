import { EventAttributes, Attendee, DateTime, createEvent } from "ics";
import * as emails from "email-addresses";

export type CalendarInviteRequest =
{
    organizer: string,
    title: string,
    description: string, 
    start: Date,
    duration: number,
    attendees: Array<string>,
    url?: string
}

export function createICSEventString(args: CalendarInviteRequest) : string {
    const reqAttds: Attendee[] = args.attendees.map(input => {
        var mapped = parseAddress(input);
        
        return {
            ...mapped,
            role: 'REQ-PARTICIPANT',
            rsvp: true
        }
    });

    const startDate: DateTime = [
        args.start.getUTCFullYear(),
        args.start.getUTCMonth() + 1, // js Date's month is 0-based. such a retard.
        args.start.getUTCDate(),
        args.start.getUTCHours(),
        args.start.getUTCMinutes()
    ];

    const event: EventAttributes = {
        start: startDate,
        startInputType: "utc",
        duration: { minutes: args.duration },
        title: args.title,
        description: args.description,
        url: args.url,
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        organizer: parseAddress(args.organizer),
        attendees: reqAttds,

        productId: 'ats.netzwelt-ph',
        calName: 'careers-netzwelt'
      };

      const { error, value } = createEvent(event);
      
      if (error) {
        throw new Error("Failed to create ICS event. Reason: " + error.message);
      }

      return value.toString();
};

// private members
export type EventParticipant =
{
    name: string, 
    email: string
}

export const parseAddress = (input: string) : EventParticipant => {
    const result = emails.parseOneAddress(input);
    return {
        name: result.name || result["address"],
        email: result["address"]
    };
};
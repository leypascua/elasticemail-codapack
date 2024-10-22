import * as coda from "@codahq/packs-sdk";
import { createMail, sendMail, createInvite } from "./ElasticEmail";
import { createHttpClient } from "./HttpClient";

export const pack = coda.newPack();

pack.addNetworkDomain("api.elasticemail.com");

pack.setSystemAuthentication({
    type: coda.AuthenticationType.CustomHeaderToken,
    headerName: "X-ElasticEmail-ApiKey"
});

pack.addFormula({
    name: "SendCalendarInvite",
    description: "Send a calendar invite via e-mail",

    parameters: [
        coda.makeParameter({
            type: coda.ParameterType.String,
            name: "organizer",
            description: "The organizer of the meeting, in a RFC5322 compliant e-mail address string ie: `The Organizer<organizer@email.com>`"
        }),
        coda.makeParameter({
            type: coda.ParameterType.String,
            name: "title",
            description: "The title of the meeting"
        }),
        coda.makeParameter({
            type: coda.ParameterType.String,
            name: "description",
            description: "The description of the meeting"
        }),        
        coda.makeParameter({
            type: coda.ParameterType.Date,
            name: "start",
            description: "The starting datetimestamp of the meeting"
        }),
        coda.makeParameter({
            type: coda.ParameterType.Number,
            name: "duration",
            description: "The meeting duration in minutes",
        }),
        coda.makeParameter({
            type: coda.ParameterType.StringArray,
            name: "attendees",
            description: "An array of RFC5322 compliant e-mail addresses ie: `The Organizer<organizer@email.com>`.",
        }),
        coda.makeParameter({
            type: coda.ParameterType.String,
            name: "url",
            description: "a (meeting room) URL",
            optional: true
        }),
    ],

    resultType: coda.ValueType.String,
    codaType: coda.ValueHintType.Attachment,

    execute: async function ([organizer, title, description, start, duration, attendees, url], context) {
        const http = createHttpClient(context);
        const mail = createInvite({
            organizer,
            title: title,
            description,
            start: new Date(start.toISOString()),
            duration,
            attendees,
            url
        });

        return sendMail(http, mail);
    }
});

pack.addFormula({
    name: "SendElasticEmail",
    description: "Send an e-mail using the ElasticEmail API service",

    parameters: [
        coda.makeParameter({
            type: coda.ParameterType.String,
            name: "recipient",
            description: "The recipient's e-mail address"
        }),
        coda.makeParameter({
            type: coda.ParameterType.String,
            name: "sender",
            description: "The sender's e-mail address"
        }),
        coda.makeParameter({
            type: coda.ParameterType.String,
            name: "subject",
            description: "The e-mail subject"
        }),
        coda.makeParameter({
            type: coda.ParameterType.Html,
            name: "htmlBody",
            description: "The e-mail body in HTML"
        }),
        coda.makeParameter({
            type: coda.ParameterType.String,
            name: "replyTo",
            description: "The e-mail address to use in replyTo",
            optional: true
        }),
        coda.makeParameter({
            type: coda.ParameterType.String,
            name: "bcc",
            description: "The e-mail address to use in bcc",
            optional: true
        })
    ],

    resultType: coda.ValueType.String,
    codaType: coda.ValueHintType.Html,

    execute: async function ([recipient, sender, subject, htmlBody, replyTo, bcc], context) {
        
        const http = createHttpClient(context);
        const mail = createMail(sender, recipient, subject, htmlBody, bcc, replyTo);

        return sendMail(http, mail);
    }
});
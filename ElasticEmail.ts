import { HttpClient } from "./HttpClient";
import { CalendarInviteRequest, createICSEventString } from "./IcsFactory";

const url = "https://api.elasticemail.com/v4/emails/transactional";

export type MailMessage =
{
    sender: string,
    recipients: Array<string>,
    subject: string, 
    htmlBody: string,
    replyTo?: string, 
    bcc?: Array<string>,
    attachments?: Array<AttachmentData>
};

export type AttachmentData = 
{
    base64Content: string,
    name: string,
    contentType: string
}

export function createInvite(r: CalendarInviteRequest) : MailMessage {
    const mail = createMailMessage(r.organizer, r.attendees, r.title, r.description);
    const icsString = createICSEventString(r);

    mail.attachments.push({
        base64Content: btoa(icsString),
        name: "meeting.ics",
        contentType: "text/calendar;method=REQUEST"
    });

    return mail;
}

export function createMail(sender: string, recipient: string, subject: string, htmlBody: string, bcc?: string, replyTo?: string) : MailMessage {
    return createMailMessage(sender, [recipient], subject, htmlBody, bcc, replyTo);
};

export async function sendMail(http: HttpClient, args: MailMessage) : Promise<string> {
    
    const createAttachment = (file: AttachmentData) => {
        const result: MessageAttachment = {
            BinaryContent: file.base64Content,
            Name: file.name,
            ContentType: file.contentType
        };
        
        return result;
    };
    
    const body = {
        Recipients: {
            To: args.recipients,
            BCC: args.bcc || []
        },

        Content: {
            From: args.sender,
            ReplyTo: args.replyTo || args.sender,
            Subject: args.subject,
            Body: [
                {
                    ContentType: "HTML",
                    Content: args.htmlBody,
                    Charset: "utf-8"
                }
            ],
            Attachments: (args.attachments || []).map(createAttachment)
        }        
    };
    
    const response = await http.sendPost(url, body);

    if (response.status != 200) {
        throw new Error(`[${response.status}] ${response.body}`);
    }

    return `[${response.status}] ${response.body.MessageID}`;
};

// private members
type MessageAttachment = 
{
    BinaryContent: string,
    Name: string,
    ContentType: string
}

function createMailMessage(sender: string, recipients: Array<string>, subject: string, htmlBody: string, bcc?: string, replyTo?: string) : MailMessage {
    return {
        sender,
        recipients,
        subject,
        htmlBody,
        replyTo,
        bcc: bcc === null? [] : [bcc],
        attachments: []
    };
}
import * as coda from "@codahq/packs-sdk";

export type HttpClientResponse =
{
    status: number, 
    body: any
}

export interface HttpClient 
{
    sendPost(url: string, body: any) : Promise<HttpClientResponse>;
}

class CodaHttpClient implements HttpClient
{
    c: coda.ExecutionContext;

    constructor(c: coda.ExecutionContext) {
        this.c = c;
    }

    async sendPost(url: string, body: any) : Promise<HttpClientResponse> {
        const response = await this.c.fetcher.fetch({
            method: "POST",
            url,
            body: JSON.stringify(body)
        });

        const result: HttpClientResponse = {
            status: response.status,
            body: response.body
        };

        return result;
    }
}

export function createHttpClient(c: coda.ExecutionContext) : HttpClient {
    return new CodaHttpClient(c);
};
import {assert} from "chai";
import {describe, it} from "mocha";
import { EventParticipant, parseAddress } from "../IcsFactory";

describe("ICS Factory", () => {
    it("works", () => {
        let result = parseAddress("Foo Bar<foo@bar.com>");

        assert(result.name === "Foo Bar");
        assert(result.email === "foo@bar.com");
    });

    it("should work", () => {
        let result = parseAddress("foo@bar.com");

        assert(result.email === "foo@bar.com");
        assert(result.name === "foo@bar.com", "expected 'foo', actual: " + result.name);
    });
});
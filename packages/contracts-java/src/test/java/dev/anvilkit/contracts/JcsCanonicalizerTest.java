package dev.anvilkit.contracts;

import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

final class JcsCanonicalizerTest {
    @Test void canonicalizesRfcSample() throws Exception {
        String input = "{\"numbers\":[333333333.33333329,1e30,4.50,2e-3,1e-27],\"string\":\"€$\\u000f\\nA'B\\\"\\\\\\\\\\\"/\",\"literals\":[null,true,false]}";
        String expected = "{\"literals\":[null,true,false],\"numbers\":[333333333.3333333,1e+30,4.5,0.002,1e-27],\"string\":\"€$\\u000f\\nA'B\\\"\\\\\\\\\\\"/\"}";
        assertEquals(expected, new String(JcsCanonicalizer.canonicalize(input.getBytes(StandardCharsets.UTF_8)), StandardCharsets.UTF_8));
    }

    @Test void usesUtf16PropertyOrder() throws Exception {
        String input = "{\"€\":\"Euro\",\"\\r\":\"CR\",\"דּ\":\"Hebrew\",\"1\":\"One\",\"😀\":\"Emoji\",\"\":\"Control\",\"ö\":\"Latin\"}";
        String expected = "{\"\\r\":\"CR\",\"1\":\"One\",\"\":\"Control\",\"ö\":\"Latin\",\"€\":\"Euro\",\"😀\":\"Emoji\",\"דּ\":\"Hebrew\"}";
        assertEquals(expected, new String(JcsCanonicalizer.canonicalize(input.getBytes(StandardCharsets.UTF_8)), StandardCharsets.UTF_8));
    }

    @Test void strictAdmissionRunsFirst() {
        for (String input : new String[]{"{\"value\":-0}", "{\"a\":1,\"a\":2}", "{\"value\":\"\\ud800\"}"}) {
            assertThrows(Exception.class, () -> JcsCanonicalizer.canonicalize(input.getBytes(StandardCharsets.UTF_8)), input);
        }
    }
}

import { describe, expect, it } from "vitest";
import { composeSvg, frameDimensions, nestSvg } from "./frame";

const RAW = '<?xml version="1.0" standalone="no"?>\r\n<svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><rect/></svg>';

describe("nestSvg", () => {
  it("drops the prolog and positions the root svg", () => {
    expect(nestSvg(RAW, 80, 80, 1000)).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" x="80" y="80" width="1000" height="1000"><rect/></svg>',
    );
  });
});

describe("composeSvg", () => {
  it("adds a quiet zone without a frame", () => {
    const svg = composeSvg(RAW, {
      background: "#ffffff",
      frame: { enabled: false, color: "#000", textColor: "#fff", text: "Scan me" },
    });
    expect(svg).toContain('viewBox="0 0 1160 1160"');
    expect(svg).not.toContain("<text");
  });

  it("draws the frame and escapes the call-to-action", () => {
    const svg = composeSvg(RAW, {
      background: "#ffffff",
      frame: { enabled: true, color: "#166534", textColor: "#ffffff", text: "Scan <me> & go" },
    });
    const { width, height } = frameDimensions(true);
    expect(svg).toContain(`viewBox="0 0 ${width} ${height}"`);
    expect(svg).toContain("Scan &lt;me&gt; &amp; go");
  });
});

"use client";

import { Box, Card, Heading, Stack, Text } from "@sanity/ui";

const POINTS: { title: string; body: string }[] = [
  {
    title: "Publish makes it live",
    body: "Changes stay a draft until you press Publish. The live site picks them up within about a minute.",
  },
  {
    title: "Empty means unchanged",
    body: "Any field you leave empty keeps what the site shows today, so you only need to fill in what you want to change.",
  },
  {
    title: "Photos",
    body: "Each photo shows the one on the site now. Upload a new one to replace it, and say what it shows in the description and caption.",
  },
  {
    title: "Check it on the page",
    body: "“Open on site”, in the menu beside Publish, shows the live page in a new tab.",
  },
  {
    title: "Undo",
    body: "Every published version is kept. Open the clock icon at the top right of a page to see or restore an earlier one.",
  },
  {
    title: "Figures and claims",
    body: "Specifications, dates and program details should match what engineering and contracts have approved for public release.",
  },
];

/** A short guide in the studio's menu. */
export function HelpPane() {
  return (
    <Box padding={4} style={{ maxWidth: 640 }}>
      <Stack gap={4}>
        <Heading size={2}>How editing works</Heading>
        {POINTS.map((p) => (
          <Card key={p.title} padding={4} radius={2} border>
            <Stack gap={3}>
              <Text weight="semibold">{p.title}</Text>
              <Text muted size={2}>
                {p.body}
              </Text>
            </Stack>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

"use client";

import { Card, Flex, Stack, Text } from "@sanity/ui";
import type { StringInputProps } from "sanity";

/**
 * Shows the photo the site uses now (a file in the site's own folder, filled in by the import), so
 * editors see what an upload would replace instead of a file path.
 */
export function LegacyPhotoInput(props: StringInputProps) {
  const src = props.value;
  if (!src) return null;
  return (
    <Card padding={3} radius={2} border tone="transparent">
      <Flex gap={3} align="center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" style={{ width: 160, height: 107, objectFit: "cover", borderRadius: 3, flex: "none" }} />
        <Stack gap={2}>
          <Text size={1} weight="semibold">
            The photo on the site now
          </Text>
          <Text size={1} muted>
            Upload a photo above to replace it.
          </Text>
        </Stack>
      </Flex>
    </Card>
  );
}

/** A small thumbnail for lists, from a site path or an uploaded image's URL. */
export function thumbnail(src: string | undefined) {
  if (!src) return undefined;
  return function Thumb() {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  };
}

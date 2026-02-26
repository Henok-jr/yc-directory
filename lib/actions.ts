"use server";

import { auth } from "@/auth";
import { parseServerActionResponse } from "@/lib/utils";
import { writeClient } from "@/sanity/lib/write-client";
import { client } from "@/sanity/lib/client";
import { STARTUP_FOR_EDIT_QUERY } from "@/sanity/lib/queries";
import slugify from "slugify";

export const createPitch = async (
  state: any,
  form: FormData,
  pitch: string
) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  const { title, description, category, contactEmail, link } = Object.fromEntries(
    Array.from(form).filter(([key]) => key !== "pitch")
  );

  const slug = slugify(title as string, { lower: true, strict: true });

  try {
    const startup = {
      title,
      description,
      category,
      contactEmail,
      image: link,
      slug: {
        _type: "slug",
        current: slug,
      },
      author: {
        _type: "reference",
        _ref: session?.id,
      },
      // Store pitch as Portable Text block so PortableText can render it on the frontend
      pitch: [
        {
          _type: "block",
          style: "normal",
          children: [
            {
              _type: "span",
              text: pitch,
            },
          ],
        },
      ],
    };

    const result = await writeClient.create({ _type: "startup", ...startup });

    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
    });
  } catch (error) {
    console.log(error);

    return parseServerActionResponse({
      error: JSON.stringify(error),
      status: "ERROR",
    });
  }
};

export const updatePitch = async (
  state: any,
  form: FormData,
  pitch: string,
  startupId: string
) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  if (!startupId)
    return parseServerActionResponse({
      error: "Missing startup id",
      status: "ERROR",
    });

  const existing = await client
    .withConfig({ useCdn: false })
    .fetch(STARTUP_FOR_EDIT_QUERY, { id: startupId });

  if (!existing)
    return parseServerActionResponse({
      error: "Startup not found",
      status: "ERROR",
    });

  const ownerId = existing?.author?._id;
  if (!ownerId || ownerId !== session.id)
    return parseServerActionResponse({
      error: "Not authorized",
      status: "ERROR",
    });

  const { title, description, category, contactEmail, link } = Object.fromEntries(
    Array.from(form).filter(([key]) => key !== "pitch")
  );

  const nextTitle = title as string;
  const nextSlug = slugify(nextTitle, { lower: true, strict: true });

  try {
    const result = await writeClient
      .patch(startupId)
      .set({
        title: nextTitle,
        description,
        category,
        contactEmail,
        image: link,
        slug: { _type: "slug", current: nextSlug },
        pitch: [
          {
            _type: "block",
            style: "normal",
            children: [{ _type: "span", text: pitch }],
          },
        ],
      })
      .commit();

    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
    });
  } catch (error) {
    console.log(error);
    return parseServerActionResponse({
      error: JSON.stringify(error),
      status: "ERROR",
    });
  }
};

export const deleteStartup = async (startupId: string) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  if (!startupId)
    return parseServerActionResponse({
      error: "Missing startup id",
      status: "ERROR",
    });

  const existing = await client
    .withConfig({ useCdn: false })
    .fetch(STARTUP_FOR_EDIT_QUERY, { id: startupId });

  if (!existing)
    return parseServerActionResponse({
      error: "Startup not found",
      status: "ERROR",
    });

  const ownerId = existing?.author?._id;
  if (!ownerId || ownerId !== session.id)
    return parseServerActionResponse({
      error: "Not authorized",
      status: "ERROR",
    });

  try {
    await writeClient.delete(startupId);
    return parseServerActionResponse({ error: "", status: "SUCCESS" });
  } catch (error) {
    console.log(error);
    return parseServerActionResponse({
      error: JSON.stringify(error),
      status: "ERROR",
    });
  }
};

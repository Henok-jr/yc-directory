"use server";

import { auth } from "@/auth";
import { parseServerActionResponse } from "@/lib/utils"
import { writeClient } from "@/sanity/lib/write-client";
import slugify from 'slugify';

export const createPitch = async (
    state: any, 
    form: FormData, 
    pitch: string ) => {
       const session = await auth();

       if(!session) 
        return parseServerActionResponse( { 
    error: 'Not signed in', 
    status: 'ERROR'
});

const { title, description, category, email, link } = Object.fromEntries(
  Array.from(form).filter(([key]) => key !== "pitch")
);

const slug = slugify(title as string, {lower: true, strict: true})

try{
const startup = {
    title,
    description,
    category,
    contactEmail: email,
    image: link,
    slug: {
        _type: "slug",
        current: slug,
    },
    author: {
        _type: 'reference',
        _ref: session?.id,
    },
    // Store pitch as Portable Text block so PortableText can render it on the frontend
    pitch: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: pitch,
          },
        ],
      },
    ],
};

const result = await writeClient.create({ _type: "startup", ...startup})

return parseServerActionResponse({
    ... result,
    error: '',
    status: 'SUCCESS',
})
} catch(error){
    console.log(error);
    
    return parseServerActionResponse({ 
        error: JSON.stringify(error), 
        status: "ERROR"
    });
}
};

export const updateStartup = async (
  startupId: string,
  form: FormData,
  pitch: string
) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: 'Not signed in',
      status: 'ERROR',
    });

  if (!startupId)
    return parseServerActionResponse({
      error: 'Missing startup id',
      status: 'ERROR',
    });

  const { title, description, category, email, link } = Object.fromEntries(
    Array.from(form).filter(([key]) => key !== 'pitch')
  );

  const slug = slugify(title as string, { lower: true, strict: true });

  try {
    // Author check (only creator can edit)
    const existing = await writeClient.getDocument(startupId);
    const authorRef = (existing as any)?.author?._ref;

    if (!authorRef || authorRef !== session.id) {
      return parseServerActionResponse({
        error: 'Not authorized',
        status: 'ERROR',
      });
    }

    const updated = await writeClient
      .patch(startupId)
      .set({
        title,
        description,
        category,
        contactEmail: email,
        image: link,
        slug: { _type: 'slug', current: slug },
        pitch: [
          {
            _type: 'block',
            style: 'normal',
            children: [{ _type: 'span', text: pitch }],
          },
        ],
      })
      .commit();

    return parseServerActionResponse({
      ...updated,
      error: '',
      status: 'SUCCESS',
    });
  } catch (error) {
    console.log(error);
    return parseServerActionResponse({
      error: JSON.stringify(error),
      status: 'ERROR',
    });
  }
};

export const deleteStartup = async (startupId: string) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: 'Not signed in',
      status: 'ERROR',
    });

  if (!startupId)
    return parseServerActionResponse({
      error: 'Missing startup id',
      status: 'ERROR',
    });

  try {
    const existing = await writeClient.getDocument(startupId);
    const authorRef = (existing as any)?.author?._ref;

    if (!authorRef || authorRef !== session.id) {
      return parseServerActionResponse({
        error: 'Not authorized',
        status: 'ERROR',
      });
    }

    await writeClient.delete(startupId);

    return parseServerActionResponse({
      error: '',
      status: 'SUCCESS',
    });
  } catch (error) {
    console.log(error);
    return parseServerActionResponse({
      error: JSON.stringify(error),
      status: 'ERROR',
    });
  }
};

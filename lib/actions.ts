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

const { title, description, category, link } = Object.fromEntries(
  Array.from(form).filter(([key]) => key !== "pitch")
);

const slug = slugify(title as string, {lower: true, strict: true})

try{
const startup = {
    title,
    description,
    category,
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

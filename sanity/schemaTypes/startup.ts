import { defineField, defineType } from 'sanity';

export const startup = defineType({
  name: 'startup',
  title: 'Startup',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),

    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
    }),

    defineField({
      name: 'author',
      type: 'reference',
      to: { type: 'author' },
    }),

    defineField({
      name: 'views',
      type: 'number',
    }),

    defineField({
      name: 'description',
      type: 'text',
    }),

    defineField({
      name: 'category',
      type: 'string',
      validation: (Rule) =>
        Rule.min(1).max(20).required().error('Please enter a category'),
    }),

    defineField({
      name: 'image',
      type: 'url',
      validation: (Rule) => Rule.required(),
    }),

    // ✅ MARKDOWN-COMPATIBLE FIELD (Portable Text)
    defineField({
      name: 'pitch',
      title: 'Pitch',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Code', value: 'code' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                  },
                ],
              },
            ],
          },
        },
      ],
    }),
  ],
});
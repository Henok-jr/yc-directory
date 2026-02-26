"use client";

import React, { useState, useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "./ui/textarea";
import MDEditor from "@uiw/react-md-editor";
import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { formSchema } from "@/lib/validation";
import { z } from 'zod';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createPitch, updatePitch } from "@/lib/actions";

type StartupFormProps = {
  startupId?: string
  initialValues?: {
    title?: string
    description?: string
    category?: string
    contactEmail?: string
    link?: string
    pitch?: string
  }
  mode?: 'create' | 'edit'
}

const StartupForm = ({ startupId, initialValues, mode = 'create' }: StartupFormProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pitch, setPitch] = useState(initialValues?.pitch ?? "");
  const { toast } = useToast(); 
  const router = useRouter();

  const handleFormSubmit = async (prevState: any, formData: FormData) => {
    setErrors({});

    try {
      const formValues = {
        title: (formData.get("title") as string) ?? "",
        description: (formData.get("description") as string) ?? "",
        category: (formData.get("category") as string) ?? "",
        contactEmail: (formData.get("contactEmail") as string) ?? "",
        link: (formData.get("link") as string) ?? "",
        pitch,
      };

      await formSchema.parseAsync(formValues);

      const result =
        mode === 'edit'
          ? await updatePitch(prevState, formData, pitch, startupId as string)
          : await createPitch(prevState, formData, pitch);

      if (result.status === 'SUCCESS') {
        router.push(`/startup/${result._id ?? startupId}`)
      }

      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErorrs = error.flatten().fieldErrors;
        setErrors(fieldErorrs as unknown as Record<string, string>);

        toast({
          title: 'Error',
          description: 'Please check your inputs and try again',
          variant: 'destructive',
        });
        return { ...prevState, error: 'Validation failed', status: 'ERROR' };
      }

      toast({
        title: 'Error',
        description: 'An unexpected error has occured',
        variant: 'destructive',
      });

      return {
        ...prevState,
        error: 'An unexpected error has occured',
        status: "ERROR",
      };
    }
  };

  const [state, formAction, isPending] = useActionState(handleFormSubmit, {
    error: "",
    status: "INITIAL",
  });

  return (
    <form action={formAction} className="startup-form">
      <div>
        <label htmlFor="title" className="startup-form_label">
          Title
        </label>
        <Input
          id="title"
          name="title"
          className="startup-form_input"
          required
          placeholder="Startup Title"
          defaultValue={initialValues?.title}
          onChange={() =>
            setErrors((prev) => {
              const copy = { ...prev };
              delete copy.title;
              return copy;
            })
          }
        />
        {errors.title && <p className="startup-form_error">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="startup-form_label">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          className="startup-form_textarea"
          required
          placeholder="Startup Description"
          defaultValue={initialValues?.description}
          onChange={() =>
            setErrors((prev) => {
              const copy = { ...prev };
              delete copy.description;
              return copy;
            })
          }
        />
        {errors.description && (
          <p className="startup-form_error">{errors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="startup-form_label">
          Category
        </label>
        <Input
          id="category"
          name="category"
          className="startup-form_input"
          required
          placeholder="Startup category (Tech, Health, Education ...)"
          defaultValue={initialValues?.category}
          onChange={() =>
            setErrors((prev) => {
              const copy = { ...prev };
              delete copy.category;
              return copy;
            })
          }
        />
        {errors.category && (
          <p className="startup-form_error">{errors.category}</p>
        )}
      </div>

      <div>
        <label htmlFor="link" className="startup-form_label">
          Image URL
        </label>
        <Input
          id="link"
          name="link"
          className="startup-form_input"
          required
          placeholder="Startup Image URL"
          defaultValue={initialValues?.link}
          onChange={() =>
            setErrors((prev) => {
              const copy = { ...prev };
              delete copy.link;
              return copy;
            })
          }
        />
        {errors.link && <p className="startup-form_error">{errors.link}</p>}
      </div>

      <div>
        <label htmlFor="contactEmail" className="startup-form_label">
          Contact Email
        </label>
        <Input
          id="contactEmail"
          name="contactEmail"
          type="email"
          className="startup-form_input"
          required
          placeholder="Contact Email"
          defaultValue={initialValues?.contactEmail}
          onChange={() =>
            setErrors((prev) => {
              const copy = { ...prev };
              delete copy.contactEmail;
              return copy;
            })
          }
        />
        {errors.contactEmail && (
          <p className="startup-form_error">{errors.contactEmail}</p>
        )}
      </div>

      <div data-color-mode="light">
        <label htmlFor="pitch" className="startup-form_label">
          Pitch
        </label>
        <MDEditor
          value={pitch}
          onChange={(value) => {
            setPitch((value as string) ?? "");
            setErrors((prev) => {
              const copy = { ...prev };
              delete copy.pitch;
              return copy;
            });
          }}
          id="pitch"
          preview="edit"
          height={300}
          style={{ borderRadius: 20, overflow: "hidden" }}
          textareaProps={{
            placeholder: "Briefly describe your idea and what problem it solves",
          }}
          previewOptions={{
            disallowedElements: ["style"],
          }}
        />
        {errors.pitch && <p className="startup-form_error">{errors.pitch}</p>}
      </div>

      <Button
        type="submit"
        className="startup-form_btn text-white"
        disabled={isPending}
      >
        {isPending
          ? mode === 'edit'
            ? 'Saving...'
            : 'Submitting ...'
          : mode === 'edit'
            ? 'Save changes'
            : 'Submit your pitch'}
        <Send className="size-6 ml-2" />
      </Button>
    </form>
  );
};

export default StartupForm;
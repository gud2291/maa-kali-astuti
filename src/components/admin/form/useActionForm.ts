"use client";

import { createElement, useEffect, useTransition } from "react";
import {
  useForm,
  type DefaultValues,
  type UseFormReturn,
  type Path,
  type FieldValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ActionResult } from "@/lib/domain/errors";
import { toast } from "@/components/admin/ui/toast";
import { errorText } from "@/components/admin/errors";
import { TextField } from "./TextField";
import { TextArea } from "./TextArea";
import { NumberField } from "./NumberField";
import { MoneyField } from "./MoneyField";
import { SelectField } from "./SelectField";
import { SwitchField } from "./SwitchField";
import { CheckboxField } from "./CheckboxField";
import { DateField } from "./DateField";
import { LocaleTabs } from "./LocaleTabs";
import { FormBar } from "./FormBar";

export type UseActionFormOptions<TSchema extends z.ZodType<FieldValues>, TData> = {
  schema: TSchema;
  defaultValues?: DefaultValues<z.infer<TSchema>>;
  action: (values: z.infer<TSchema>) => Promise<ActionResult<TData>>;
  onSuccess?: (data: TData) => void;
  successMessage?: string;
};

export type UseActionFormReturn<TSchema extends z.ZodType<FieldValues>> = {
  form: UseFormReturn<z.infer<TSchema>>;
  submit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  pending: boolean;
};

export function useActionForm<TSchema extends z.ZodType<FieldValues>, TData>({
  schema,
  defaultValues,
  action,
  onSuccess,
  successMessage,
}: UseActionFormOptions<TSchema, TData>): UseActionFormReturn<TSchema> {
  const [pending, startTransition] = useTransition();

  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onBlur",
  });

  const submit = form.handleSubmit((values: z.infer<TSchema>) => {
    startTransition(async () => {
      try {
        const res = await action(values);
        if (res.ok) {
          toast.ok(successMessage ?? "Saved");
          form.reset(values);
          onSuccess?.(res.data);
        } else {
          if (res.fieldErrors) {
            for (const [key, msg] of Object.entries(res.fieldErrors)) {
              form.setError(key as Path<z.infer<TSchema>>, { message: msg });
            }
          }
          toast.err(errorText(res.code));
        }
      } catch {
        toast.err(errorText("INTERNAL"));
      }
    });
  });

  return { form, submit, pending };
}

export function useLeaveGuard(dirty: boolean): void {
  useEffect(() => {
    if (!dirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [dirty]);
}

const demoFormSchema = z.object({
  name: z.string().min(1, "Product name is required").max(60, "Maximum 60 characters"),
  sku: z.string().min(1, "SKU identifier is required"),
  price: z.number().int().min(1, "Price must be at least ₹1"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  category: z.string().min(1, "Please select a category"),
  publishDate: z.string().min(1, "Publish date is required"),
  isActive: z.boolean().default(true),
  featured: z.boolean().default(false),
  descriptionEn: z
    .string()
    .min(1, "English description is required")
    .max(300, "Maximum 300 characters"),
  descriptionHi: z.string().default(""),
});

type DemoFormData = z.infer<typeof demoFormSchema>;

export function KitDemoForm(): React.JSX.Element {
  const { form, submit, pending } = useActionForm({
    schema: demoFormSchema,
    defaultValues: {
      name: "Mahakali Kavach",
      sku: "MK-KAVACH-01",
      price: 2100,
      stock: 15,
      category: "kavach",
      publishDate: "2026-10-01",
      isActive: true,
      featured: true,
      descriptionEn: "Blessed and energized silver kavach consecrated through Vedic rituals.",
      descriptionHi: "",
    },
    action: async (values: DemoFormData) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return { ok: true, data: values };
    },
    successMessage: "Demo changes saved successfully",
  });

  const isDirty = form.formState.isDirty;
  useLeaveGuard(isDirty);

  const hiValue = form.watch("descriptionHi");
  const isHiEmpty = !hiValue || hiValue.trim() === "";

  // Plain createElement: this module is a `.ts` file (no JSX).
  const h = createElement;
  const control = form.control;

  return h(
    "form",
    { onSubmit: submit, className: "space-y-6" },
    h(
      "div",
      { className: "grid grid-cols-1 gap-5 sm:grid-cols-2" },
      h(TextField<DemoFormData>, {
        name: "name",
        control,
        label: "Product Name",
        hint: "Visible to customers in the catalog",
        required: true,
        maxLength: 60,
        showCount: true,
      }),
      h(TextField<DemoFormData>, {
        name: "sku",
        control,
        label: "SKU Identifier",
        hint: "Unique inventory code",
        required: true,
      }),
    ),
    h(
      "div",
      { className: "grid grid-cols-1 gap-5 sm:grid-cols-3" },
      h(MoneyField<DemoFormData>, {
        name: "price",
        control,
        label: "Price (INR)",
        hint: "Whole rupees",
        required: true,
      }),
      h(NumberField<DemoFormData>, {
        name: "stock",
        control,
        label: "Stock Units",
        hint: "Current quantity available",
        required: true,
      }),
      h(SelectField<DemoFormData>, {
        name: "category",
        control,
        label: "Category",
        placeholder: "Choose category...",
        options: [
          { value: "kavach", label: "Kavach & Amulets" },
          { value: "yantras", label: "Sacred Yantras" },
          { value: "mala", label: "Rosaries & Malas" },
          { value: "puja", label: "Puja Essentials" },
        ],
        required: true,
      }),
    ),
    h(
      "div",
      { className: "grid grid-cols-1 gap-5 sm:grid-cols-3 items-start" },
      h(DateField<DemoFormData>, {
        name: "publishDate",
        control,
        label: "Publish Date",
        hint: "Catalog release date",
        required: true,
      }),
      h(
        "div",
        { className: "pt-2" },
        h(SwitchField<DemoFormData>, {
          name: "isActive",
          control,
          label: "Active in Store",
          description: "Customers can browse and purchase",
        }),
      ),
      h(
        "div",
        { className: "pt-2" },
        h(CheckboxField<DemoFormData>, {
          name: "featured",
          control,
          label: "Featured Product",
          description: "Highlight on homepage showcase",
        }),
      ),
    ),
    h(
      "div",
      { className: "rounded-btn bg-cream p-4 shadow-ring-sand" },
      h(
        "h4",
        { className: "mb-3 font-display text-[16px] font-semibold text-ink" },
        "Bilingual Descriptions",
      ),
      h(LocaleTabs, {
        hiEmpty: isHiEmpty,
        en: h(TextArea<DemoFormData>, {
          name: "descriptionEn",
          control,
          label: "Description (English)",
          hint: "Detailed product overview",
          rows: 3,
          maxLength: 300,
          showCount: true,
          required: true,
        }),
        hi: h(TextArea<DemoFormData>, {
          name: "descriptionHi",
          control,
          label: "विवरण (हिंदी)",
          hint: "उत्पाद का हिंदी विवरण",
          rows: 3,
          maxLength: 300,
          showCount: true,
        }),
      }),
    ),
    h(FormBar, {
      pending,
      dirty: isDirty,
      cancelHref: "/admin/kit",
      saveLabel: "Save Product",
    }),
  );
}

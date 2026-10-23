import { z } from "zod";

export const receiveSchema = z.object({
  propertyTag: z
    .string()
    .trim()
    .min(1, "Property tag is required.")
    .transform((value) => value.toUpperCase()),
  serialNumber: z.string().trim().min(1, "Serial number is required."),
  name: z.string().trim().min(1, "Item name is required."),
  location: z.string().trim().min(1, "Location is required."),
});

export const issueSchema = z.object({
  propertyTag: z
    .string()
    .trim()
    .min(1, "Property tag is required.")
    .transform((value) => value.toUpperCase()),
  custodian: z.string().trim().min(1, "Custodian is required."),
  location: z.string().trim().min(1, "Location is required."),
});

export const borrowSchema = z.object({
  propertyTag: z
    .string()
    .trim()
    .min(1, "Property tag is required.")
    .transform((value) => value.toUpperCase()),
  borrower: z.string().trim().min(1, "Borrowers name is required."),
  location: z.string().trim().min(1, "Location is required."),
});

export const returnSchema = z.object({
  propertyTag: z
    .string()
    .trim()
    .min(1, "Select an item to return.")
    .transform((value) => value.toUpperCase()),
});

export const pullOutSchema = z.object({
  propertyTag: z
    .string()
    .trim()
    .min(1, "Select an item to pull out.")
    .transform((value) => value.toUpperCase()),
  repairLocation: z.string().trim().min(1, "Repair location is required."),
  reason: z.string().trim().min(1, "Repair reason is required."),
});

export const repairSchema = z.object({
  propertyTag: z
    .string()
    .trim()
    .min(1, "Select an item to complete repair.")
    .transform((value) => value.toUpperCase()),
});

export const editSchema = z.object({
  propertyTag: z
    .string()
    .trim()
    .min(1, "Property tag is required.")
    .transform((value) => value.toUpperCase()),
  serialNumber: z.string().trim(),
  name: z.string().trim().min(1, "Name is required."),
  location: z.string().trim().min(1, "Location is required."),
});

export type EditFormData = z.infer<typeof editSchema>;

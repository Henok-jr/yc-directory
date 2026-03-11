const isValidApiVersion = (v: string | undefined) => {
  if (!v) return false;
  // Sanity API versions are date strings like 2024-01-01
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
};

export const apiVersion = isValidApiVersion(process.env.NEXT_PUBLIC_SANITY_API_VERSION)
  ? (process.env.NEXT_PUBLIC_SANITY_API_VERSION as string)
  : "2024-01-01";

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
)

export const token = process.env.SANITY_WRITE_TOKEN;

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}

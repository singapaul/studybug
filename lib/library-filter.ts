export type AccessFilter = "all" | "free" | "pro";

export interface FilterableSubject {
  name: string;
  isFree: boolean;
}

/** Filter library subjects by a name query and free/pro access. Pure + client-safe. */
export function filterLibrarySubjects<T extends FilterableSubject>(
  subjects: T[],
  query: string,
  access: AccessFilter,
): T[] {
  const q = query.trim().toLowerCase();
  return subjects.filter((s) => {
    const matchesQuery = q === "" || s.name.toLowerCase().includes(q);
    const matchesAccess =
      access === "all" || (access === "free" ? s.isFree : !s.isFree);
    return matchesQuery && matchesAccess;
  });
}

export function updateClinicalNoteTemplate(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    templateId: string;
    templateKey?: string;
    title?: string;
    category?: string | null;
    subjective?: string | null;
    objective?: string | null;
    assessment?: string | null;
    plan?: string | null;
    isActive?: boolean;
  }) {
    const assignments: string[] = [];
    const params: unknown[] = [input.templateId];

    for (const [field, column] of [
      ['templateKey', 'template_key'],
      ['title', 'title'],
      ['category', 'category'],
      ['subjective', 'subjective'],
      ['objective', 'objective'],
      ['assessment', 'assessment'],
      ['plan', 'plan'],
      ['isActive', 'is_active'],
    ] as const) {
      if (Object.hasOwn(input, field)) {
        params.push(input[field] ?? null);
        assignments.push(`${column} = $${params.length}`);
      }
    }

    const result = await db.query(
      `
        UPDATE clinical_note_templates
        SET ${assignments.join(',\n            ')}
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING *
      `,
      params
    );

    return result.rows[0] ?? null;
  };
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/session";
import { run } from "@/lib/action";
import { deleteResponse } from "./response.service";

export async function deleteResponseAction(id: string) {
  return run(async () => {
    const user = await requireUser();
    const { formId } = await deleteResponse(z.string().min(1).parse(id), user.id);
    revalidatePath(`/dashboard/forms/${formId}/responses`);
    revalidatePath("/dashboard");
  });
}
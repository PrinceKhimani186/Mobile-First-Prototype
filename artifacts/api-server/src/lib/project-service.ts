import { db, projectsTable, type Project } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    return createClient(url, key, { auth: { persistSession: false } });
  } catch {
    return null;
  }
}

export interface ProjectLookupDetails {
  userId?: string;
  email: string;
  enrollmentId?: string;
  query: string;
  found: boolean;
  project?: Project | null;
  reason?: string;
}

/**
 * Ensures a project record exists for the given user email.
 * If no project exists in projectsTable, queries Supabase/enrollment data
 * and auto-provisions a new project in projectsTable.
 */
export async function getOrProvisionProject(
  emailInput: string,
  log?: any
): Promise<{ project: Project | null; details: ProjectLookupDetails }> {
  const normalizedEmail = emailInput.trim().toLowerCase();
  const queryDesc = `SELECT * FROM projects WHERE lower(email) = '${normalizedEmail}'`;

  let userId: string | undefined;
  let enrollmentId: string | undefined;
  let supabaseRecord: any = null;

  // 1. Fetch user & enrollment details from Supabase if available
  const supabase = getSupabase();
  if (supabase) {
    try {
      // Lookup user ID from app_users
      const { data: userData } = await supabase
        .from("app_users")
        .select("id, email, full_name")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (userData?.id) {
        userId = String(userData.id);
      }

      // Lookup enrollment ID from customer_enrollment
      const { data: enrollData } = await supabase
        .from("customer_enrollment")
        .select("*")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (enrollData) {
        enrollmentId = String(enrollData.id ?? "");
        supabaseRecord = enrollData;
      }
    } catch (err) {
      if (log) log.warn({ err, email: normalizedEmail }, "Supabase lookup during project check encountered non-fatal error");
    }
  }

  // 2. Query local Postgres projectsTable
  try {
    const [existingProject] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.email, normalizedEmail));

    if (existingProject) {
      const details: ProjectLookupDetails = {
        userId,
        email: normalizedEmail,
        enrollmentId,
        query: queryDesc,
        found: true,
        project: existingProject,
      };

      if (log) {
        log.info(
          {
            userId: userId ?? "N/A",
            email: normalizedEmail,
            enrollmentId: enrollmentId ?? "N/A",
            projectId: existingProject.projectId,
            currentStage: existingProject.currentStage,
            query: queryDesc,
            found: true,
          },
          "Project lookup successful: existing record found"
        );
      }

      return { project: existingProject, details };
    }
  } catch (dbErr) {
    if (log) {
      log.warn({ dbErr, email: normalizedEmail }, "PostgreSQL query failed (database offline or connection error)");
    }
  }

  // 3. Project not found in projectsTable — log exact reason
  const notFoundReason = `No project row found in projectsTable for email: ${normalizedEmail}. Auto-provisioning project...`;
  if (log) {
    log.info(
      {
        userId: userId ?? "N/A",
        email: normalizedEmail,
        enrollmentId: enrollmentId ?? "N/A",
        query: queryDesc,
        found: false,
        reason: notFoundReason,
      },
      "Project lookup: no project found. Initiating auto-creation..."
    );
  }

  // 4. Auto-provision project record in projectsTable
  const generatedProjectId = `AS-${String(Date.now()).slice(-3)}`;
  const customerName = supabaseRecord?.full_name || supabaseRecord?.fullName || normalizedEmail.split("@")[0];
  const phone = supabaseRecord?.phone || "";
  const selectedPackage = supabaseRecord?.selected_package || supabaseRecord?.package || "";
  const gameTemplate = supabaseRecord?.game_type || supabaseRecord?.gameType || "";
  const appName = supabaseRecord?.app_name || supabaseRecord?.appName || "";
  const source = supabaseRecord?.source || "Direct";

  try {
    const [newProject] = await db
      .insert(projectsTable)
      .values({
        projectId: generatedProjectId,
        customerName,
        email: normalizedEmail,
        phone,
        package: selectedPackage,
        gameTemplate,
        appName,
        source,
        currentStage: "Brand Review",
      })
      .returning();

    const details: ProjectLookupDetails = {
      userId,
      email: normalizedEmail,
      enrollmentId,
      query: queryDesc,
      found: true,
      project: newProject,
    };

    if (log) {
      log.info(
        {
          userId: userId ?? "N/A",
          email: normalizedEmail,
          enrollmentId: enrollmentId ?? "N/A",
          projectId: newProject.projectId,
          customerName: newProject.customerName,
          currentStage: newProject.currentStage,
          query: `INSERT INTO projects (project_id, email, ...) VALUES ('${generatedProjectId}', '${normalizedEmail}', ...)`,
          found: true,
          provisioned: true,
        },
        "Project auto-provisioning successful: project created and linked to user"
      );
    }

    return { project: newProject, details };
  } catch (insertErr) {
    const failureReason = `Failed to insert project into projectsTable: ${insertErr instanceof Error ? insertErr.message : String(insertErr)}`;
    if (log) {
      log.error(
        {
          userId: userId ?? "N/A",
          email: normalizedEmail,
          enrollmentId: enrollmentId ?? "N/A",
          query: queryDesc,
          found: false,
          reason: failureReason,
        },
        "Project auto-provisioning failed"
      );
    }

    // Fallback in-memory Project object for local development when DB is offline
    const fallbackProject: Project = {
      id: 9999,
      projectId: generatedProjectId,
      customerName,
      email: normalizedEmail,
      phone,
      package: selectedPackage,
      gameTemplate,
      appName,
      source,
      currentStage: "Brand Review",
      revisionData: null,
      publishingData: null,
      notes: "Fallback in-memory project record",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      project: fallbackProject,
      details: {
        userId,
        email: normalizedEmail,
        enrollmentId,
        query: queryDesc,
        found: false,
        reason: failureReason,
        project: fallbackProject,
      },
    };
  }
}

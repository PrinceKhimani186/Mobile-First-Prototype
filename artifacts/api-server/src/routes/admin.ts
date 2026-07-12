import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, projectsTable, PROJECT_STAGES, adminUsersTable, projectAssignmentsTable } from "@workspace/db";
import { eq, desc, sql, and, inArray, not } from "drizzle-orm";
import crypto from "crypto";

const router: IRouter = Router();

// ─── Hashing Helpers ──────────────────────────────────────────────────────────
const SALT_LEN = 16;
const KEY_LEN  = 64;

function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LEN).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LEN, (err, key) => {
      if (err) reject(err);
      else resolve(`${salt}:${key.toString("hex")}`);
    });
  });
}

function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return Promise.resolve(false);
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LEN, (err, key) => {
      if (err) reject(err);
      else {
        try {
          resolve(crypto.timingSafeEqual(Buffer.from(hash, "hex"), key));
        } catch {
          resolve(false);
        }
      }
    });
  });
}

// ─── Auth middlewares ────────────────────────────────────────────────────────
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const session = req.session as { adminAuth?: boolean; adminUser?: any };
  if (session.adminAuth && session.adminUser) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const session = req.session as { adminAuth?: boolean; adminUser?: any };
  if (session.adminAuth && session.adminUser && session.adminUser.role === "super_admin") {
    next();
  } else {
    res.status(403).json({ error: "Access Denied: Super Admin only" });
  }
}

// Helper to check project assignment for PMs
async function verifyProjectAssignment(adminUserId: number, projectId: number): Promise<boolean> {
  const assignments = await db
    .select()
    .from(projectAssignmentsTable)
    .where(
      and(
        eq(projectAssignmentsTable.projectId, projectId),
        eq(projectAssignmentsTable.adminUserId, adminUserId)
      )
    )
    .limit(1);
  return assignments.length > 0;
}

// ─── Login ────────────────────────────────────────────────────────────────────
router.post("/admin/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Seed default accounts if table is empty
    const usersCount = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(adminUsersTable);
    if ((usersCount[0]?.count ?? 0) === 0) {
      const saHash = await hashPassword("appsquad2024");
      const pmHash = await hashPassword("appsquad2024");
      const [sa] = await db.insert(adminUsersTable).values({
        name: "Super Admin",
        email: "admin@appsquadinc.com",
        passwordHash: saHash,
        role: "super_admin",
        status: "active",
      }).returning();
      const [pm] = await db.insert(adminUsersTable).values({
        name: "Sample Manager",
        email: "manager@appsquadinc.com",
        passwordHash: pmHash,
        role: "project_manager",
        status: "active",
      }).returning();
      req.log.info("Seeded Super Admin (admin@appsquadinc.com) and sample Project Manager (manager@appsquadinc.com)");
      // Assign first existing project to the sample manager (non-fatal)
      try {
        const [firstProject] = await db.select({ id: projectsTable.id }).from(projectsTable).limit(1);
        if (firstProject && pm && sa) {
          await db.insert(projectAssignmentsTable).values({ projectId: firstProject.id, adminUserId: pm.id, assignedBy: sa.id });
        }
      } catch { /* non-fatal */ }
    }

    // 2. Lookup user
    const [user] = await db
      .select()
      .from(adminUsersTable)
      .where(eq(adminUsersTable.email, normalizedEmail))
      .limit(1);

    if (!user) {
      req.log.warn({ email: normalizedEmail }, "Admin login failed: User not found");
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    if (user.status !== "active") {
      req.log.warn({ email: normalizedEmail }, "Admin login blocked: Account inactive");
      res.status(403).json({ error: "Account is inactive. Please contact a Super Admin." });
      return;
    }

    // 3. Verify password
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      req.log.warn({ email: normalizedEmail }, "Admin login failed: Wrong password");
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // 4. Set Session
    const session = req.session as any;
    session.adminAuth = true;
    session.adminUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    req.log.info({ email: normalizedEmail, role: user.role }, "Admin logged in successfully");
    res.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Unexpected error during admin login");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Logout ───────────────────────────────────────────────────────────────────
router.post("/admin/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// ─── Auth check ───────────────────────────────────────────────────────────────
router.get("/admin/auth", (req: Request, res: Response) => {
  const session = req.session as { adminAuth?: boolean; adminUser?: any };
  res.json({
    authenticated: !!session.adminAuth,
    user: session.adminUser || null,
  });
});

// ─── List projects ────────────────────────────────────────────────────────────
router.get("/admin/projects", requireAdmin, async (req: Request, res: Response) => {
  const session = (req.session as any).adminUser;

  try {
    let projectsQuery;
    if (session.role === "super_admin") {
      // Super admin sees all projects
      projectsQuery = db.select().from(projectsTable).orderBy(desc(projectsTable.createdAt));
    } else {
      // PM only sees assigned projects
      projectsQuery = db
        .select({
          id: projectsTable.id,
          projectId: projectsTable.projectId,
          customerName: projectsTable.customerName,
          email: projectsTable.email,
          phone: projectsTable.phone,
          package: projectsTable.package,
          gameTemplate: projectsTable.gameTemplate,
          appName: projectsTable.appName,
          source: projectsTable.source,
          currentStage: projectsTable.currentStage,
          notes: projectsTable.notes,
          createdAt: projectsTable.createdAt,
          updatedAt: projectsTable.updatedAt,
        })
        .from(projectsTable)
        .innerJoin(projectAssignmentsTable, eq(projectsTable.id, projectAssignmentsTable.projectId))
        .where(eq(projectAssignmentsTable.adminUserId, session.id))
        .orderBy(desc(projectsTable.createdAt));
    }

    const projects = await projectsQuery;

    // Fetch all project assignments to display assigned PM names for each project
    const assignments = await db
      .select({
        projectId: projectAssignmentsTable.projectId,
        pmId: adminUsersTable.id,
        pmName: adminUsersTable.name,
      })
      .from(projectAssignmentsTable)
      .innerJoin(adminUsersTable, eq(projectAssignmentsTable.adminUserId, adminUsersTable.id));

    // Map PM names into projects
    const projectsWithPms = projects.map((p) => {
      const pmAssignments = assignments.filter((a) => a.projectId === p.id);
      return {
        ...p,
        assignedPms: pmAssignments.map((a) => ({ id: a.pmId, name: a.pmName })),
      };
    });

    res.json({ projects: projectsWithPms });
  } catch (err) {
    req.log.error({ err }, "Failed to list projects");
    res.status(500).json({ error: "Failed to list projects" });
  }
});

// ─── Get project ──────────────────────────────────────────────────────────────
router.get("/admin/projects/:id", requireAdmin, async (req: Request, res: Response) => {
  const session = (req.session as any).adminUser;
  const id = parseInt(String(req.params.id), 10);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid project ID" });
    return;
  }

  try {
    // 1. Authorization check
    if (session.role !== "super_admin") {
      const assigned = await verifyProjectAssignment(session.id, id);
      if (!assigned) {
        res.status(403).json({ error: "Access Denied: You are not assigned to this project" });
        return;
      }
    }

    // 2. Fetch project details
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id));

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    // 3. Fetch assignments
    const assignedPms = await db
      .select({
        id: adminUsersTable.id,
        name: adminUsersTable.name,
        email: adminUsersTable.email,
        role: adminUsersTable.role,
      })
      .from(projectAssignmentsTable)
      .innerJoin(adminUsersTable, eq(projectAssignmentsTable.adminUserId, adminUsersTable.id))
      .where(eq(projectAssignmentsTable.projectId, id));

    res.json({ project, assignedPms });
  } catch (err) {
    req.log.error({ err }, "Failed to get project");
    res.status(500).json({ error: "Failed to get project" });
  }
});

// ─── Update project stage ──────────────────────────────────────────────────────
router.put("/admin/projects/:id/stage", requireAdmin, async (req: Request, res: Response) => {
  const session = (req.session as any).adminUser;
  const id = parseInt(String(req.params.id), 10);
  const { stage } = req.body as { stage?: string };

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid project ID" });
    return;
  }

  if (!stage || !(PROJECT_STAGES as readonly string[]).includes(stage)) {
    res.status(400).json({ error: "Invalid stage" });
    return;
  }

  try {
    // 1. Authorization check
    if (session.role !== "super_admin") {
      const assigned = await verifyProjectAssignment(session.id, id);
      if (!assigned) {
        res.status(403).json({ error: "Access Denied: You are not assigned to this project" });
        return;
      }
    }

    // 2. Update stage
    const [updated] = await db
      .update(projectsTable)
      .set({ currentStage: stage, updatedAt: new Date() })
      .where(eq(projectsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    req.log.info({ id, stage, adminUser: session.email }, "Admin updated project stage");
    res.json({ ok: true, project: updated });
  } catch (err) {
    req.log.error({ err }, "Failed to update project stage");
    res.status(500).json({ error: "Failed to update stage" });
  }
});

// ─── Update project details ────────────────────────────────────────────────────
router.put("/admin/projects/:id", requireAdmin, async (req: Request, res: Response) => {
  const session = (req.session as any).adminUser;
  const id = parseInt(String(req.params.id), 10);
  const { customerName, phone, package: pkg, gameTemplate, appName, notes } =
    req.body as Record<string, string>;

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid project ID" });
    return;
  }

  try {
    // 1. Authorization check
    if (session.role !== "super_admin") {
      const assigned = await verifyProjectAssignment(session.id, id);
      if (!assigned) {
        res.status(403).json({ error: "Access Denied: You are not assigned to this project" });
        return;
      }
    }

    // 2. Update project
    const [updated] = await db
      .update(projectsTable)
      .set({
        ...(customerName !== undefined ? { customerName } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(pkg !== undefined ? { package: pkg } : {}),
        ...(gameTemplate !== undefined ? { gameTemplate } : {}),
        ...(appName !== undefined ? { appName } : {}),
        ...(notes !== undefined ? { notes } : {}),
        updatedAt: new Date(),
      })
      .where(eq(projectsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.json({ ok: true, project: updated });
  } catch (err) {
    req.log.error({ err }, "Failed to update project");
    res.status(500).json({ error: "Failed to update project" });
  }
});

// ─── Create project manually ────────────────────────────────────────────────────
router.post("/admin/projects", requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { customerName, email, phone, package: pkg, gameTemplate, appName, source, currentStage } =
      req.body as Record<string, string>;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const projectId = await generateProjectId();

    const [project] = await db
      .insert(projectsTable)
      .values({
        projectId,
        customerName: customerName || "",
        email,
        phone: phone || "",
        package: pkg || "",
        gameTemplate: gameTemplate || "",
        appName: appName || "",
        source: source || "Direct",
        currentStage: currentStage || "Project Received",
        notes: "",
      })
      .onConflictDoUpdate({
        target: projectsTable.email,
        set: {
          customerName: customerName || "",
          phone: phone || "",
          package: pkg || "",
          gameTemplate: gameTemplate || "",
          appName: appName || "",
          source: source || "Direct",
          updatedAt: new Date(),
        },
      })
      .returning();

    res.json({ ok: true, project });
  } catch (err) {
    req.log.error({ err }, "Failed to create project");
    res.status(500).json({ error: "Failed to create project" });
  }
});

// ─── Delete project ────────────────────────────────────────────────────────────
router.delete("/admin/projects/:id", requireSuperAdmin, async (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id), 10);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid project ID" });
    return;
  }

  try {
    const [deleted] = await db
      .delete(projectsTable)
      .where(eq(projectsTable.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    req.log.info({ id }, "Super admin deleted project");
    res.json({ ok: true, deleted });
  } catch (err) {
    req.log.error({ err }, "Failed to delete project");
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// ─── User Management (Super Admin only) ────────────────────────────────────────
router.get("/admin/users", requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const users = await db
      .select({
        id: adminUsersTable.id,
        name: adminUsersTable.name,
        email: adminUsersTable.email,
        role: adminUsersTable.role,
        status: adminUsersTable.status,
        createdAt: adminUsersTable.createdAt,
        updatedAt: adminUsersTable.updatedAt,
        assignedProjectCount: sql<number>`cast(count(${projectAssignmentsTable.id}) as int)`,
      })
      .from(adminUsersTable)
      .leftJoin(projectAssignmentsTable, eq(projectAssignmentsTable.adminUserId, adminUsersTable.id))
      .groupBy(adminUsersTable.id)
      .orderBy(desc(adminUsersTable.createdAt));
    res.json({ users });
  } catch (err) {
    req.log.error({ err }, "Failed to list admin users");
    res.status(500).json({ error: "Failed to list admin users" });
  }
});

router.post("/admin/users", requireSuperAdmin, async (req: Request, res: Response) => {
  const { name, email, password, role, status } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: "super_admin" | "project_manager";
    status?: "active" | "inactive";
  };

  if (!name || !email || !password || !role) {
    res.status(400).json({ error: "Name, email, password and role are required" });
    return;
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await hashPassword(password);

    const [user] = await db
      .insert(adminUsersTable)
      .values({
        name,
        email: normalizedEmail,
        passwordHash,
        role,
        status: status || "active",
      })
      .returning({
        id: adminUsersTable.id,
        name: adminUsersTable.name,
        email: adminUsersTable.email,
        role: adminUsersTable.role,
        status: adminUsersTable.status,
      });

    res.json({ ok: true, user });
  } catch (err: any) {
    if (err.code === "23505" || err.message?.includes("unique constraint")) {
      res.status(409).json({ error: "A user with this email already exists" });
      return;
    }
    req.log.error({ err }, "Failed to create admin user");
    res.status(500).json({ error: "Failed to create admin user" });
  }
});

router.put("/admin/users/:id", requireSuperAdmin, async (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id), 10);
  const { name, email, password, role, status } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: "super_admin" | "project_manager";
    status?: "active" | "inactive";
  };

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  try {
    const passwordHash = password ? await hashPassword(password) : undefined;
    const normalizedEmail = email ? email.trim().toLowerCase() : undefined;

    const [updated] = await db
      .update(adminUsersTable)
      .set({
        ...(name !== undefined ? { name } : {}),
        ...(normalizedEmail !== undefined ? { email: normalizedEmail } : {}),
        ...(passwordHash !== undefined ? { passwordHash } : {}),
        ...(role !== undefined ? { role } : {}),
        ...(status !== undefined ? { status } : {}),
        updatedAt: new Date(),
      })
      .where(eq(adminUsersTable.id, id))
      .returning({
        id: adminUsersTable.id,
        name: adminUsersTable.name,
        email: adminUsersTable.email,
        role: adminUsersTable.role,
        status: adminUsersTable.status,
      });

    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ ok: true, user: updated });
  } catch (err: any) {
    if (err.code === "23505" || err.message?.includes("unique constraint")) {
      res.status(409).json({ error: "A user with this email already exists" });
      return;
    }
    req.log.error({ err }, "Failed to update admin user");
    res.status(500).json({ error: "Failed to update admin user" });
  }
});

// ─── Admin Stats (Super Admin only) ──────────────────────────────────────────
router.get("/admin/stats", requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const [pmResult] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(adminUsersTable)
      .where(and(eq(adminUsersTable.role, "project_manager"), eq(adminUsersTable.status, "active")));

    const assignedIds = db.select({ id: projectAssignmentsTable.projectId }).from(projectAssignmentsTable);
    const [unassignedResult] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(projectsTable)
      .where(not(inArray(projectsTable.id, assignedIds)));

    res.json({
      projectManagerCount: pmResult?.count ?? 0,
      unassignedProjectCount: unassignedResult?.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get admin stats");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// ─── Delete Admin User (Super Admin only) ────────────────────────────────────
router.delete("/admin/users/:id", requireSuperAdmin, async (req: Request, res: Response) => {
  const session = (req.session as any).adminUser;
  const id = parseInt(String(req.params.id), 10);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  if (id === session.id) {
    res.status(400).json({ error: "You cannot delete your own account" });
    return;
  }

  try {
    const [user] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.id, id));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.role === "super_admin") {
      const [{ count }] = await db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(adminUsersTable)
        .where(eq(adminUsersTable.role, "super_admin"));
      if ((count ?? 0) <= 1) {
        res.status(400).json({ error: "Cannot delete the last Super Admin account" });
        return;
      }
    }

    await db.delete(adminUsersTable).where(eq(adminUsersTable.id, id));
    req.log.info({ id, deletedBy: session.email }, "Admin user deleted");
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete admin user");
    res.status(500).json({ error: "Failed to delete admin user" });
  }
});

// ─── Project Assignments (Super Admin only) ──────────────────────────────────
router.post("/admin/projects/:id/assignments", requireSuperAdmin, async (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id), 10);
  const { adminUserIds } = req.body as { adminUserIds?: number[] };

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid project ID" });
    return;
  }

  if (!Array.isArray(adminUserIds)) {
    res.status(400).json({ error: "adminUserIds must be an array" });
    return;
  }

  const session = (req.session as any).adminUser;

  try {
    // Check if project exists
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id));

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    // Clear old assignments for this project
    await db.delete(projectAssignmentsTable).where(eq(projectAssignmentsTable.projectId, id));

    // Insert new assignments
    if (adminUserIds.length > 0) {
      const valuesToInsert = adminUserIds.map((pmId) => ({
        projectId: id,
        adminUserId: pmId,
        assignedBy: session.id,
      }));
      await db.insert(projectAssignmentsTable).values(valuesToInsert);
    }

    req.log.info({ id, pmIds: adminUserIds }, "Updated project assignments");
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to update assignments");
    res.status(500).json({ error: "Failed to update assignments" });
  }
});

router.get("/admin/projects/:id/assignments", requireAdmin, async (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id), 10);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid project ID" });
    return;
  }

  try {
    const assignedPms = await db
      .select({
        id: adminUsersTable.id,
        name: adminUsersTable.name,
        email: adminUsersTable.email,
        role: adminUsersTable.role,
      })
      .from(projectAssignmentsTable)
      .innerJoin(adminUsersTable, eq(projectAssignmentsTable.adminUserId, adminUsersTable.id))
      .where(eq(projectAssignmentsTable.projectId, id));

    res.json({ assignedPms });
  } catch (err) {
    req.log.error({ err }, "Failed to get assignments");
    res.status(500).json({ error: "Failed to get assignments" });
  }
});

export async function generateProjectId(): Promise<string> {
  const result = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(projectsTable);
  const total = result[0]?.count ?? 0;
  return `AS-${String(total + 1).padStart(3, "0")}`;
}

export default router;

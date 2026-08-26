"use client";

import { useEffect, useState } from "react";

import { StatCard } from "@/components/dashboard/stat-card";

import { getErrorMessage } from "@/types/api";

import {
  getCurrentUserFromApi,
  getMembersFromApi,
  addMemberToApi,
  updateMemberRoleToApi,
} from "@/features/auth/api";

interface Member {
  id: string;
  email: string;
  createdAt: string;
  plan: string;
  organizationId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
}

export default function DashboardPage() {
  const [user, setUser] =
    useState<{ user: Member } | null>(null);

  const [members, setMembers] =
    useState<Member[]>([]);

  const [email, setEmail] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [memberError, setMemberError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [adding, setAdding] =
    useState(false);

  const [updatingRole, setUpdatingRole] =
    useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [
        userData,
        membersData,
      ] = await Promise.all([
        getCurrentUserFromApi(),
        getMembersFromApi(),
      ]);

      setUser(userData);

      setMembers(
        membersData.members ?? []
      );
    } catch (err: unknown) {
      console.error(err);

      setError(
        getErrorMessage(
          err,
          "Error cargando dashboard",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initializeDashboard() {
      try {
        const [
          userData,
          membersData,
        ] = await Promise.all([
          getCurrentUserFromApi(),
          getMembersFromApi(),
        ]);

        if (cancelled) {
          return;
        }

        setUser(userData);

        setMembers(
          membersData.members ?? []
        );
      } catch (err: unknown) {
        if (cancelled) {
          return;
        }

        console.error(err);

        setError(
          getErrorMessage(
            err,
            "Error cargando dashboard",
          ),
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initializeDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAddMember(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setMemberError(
        "Introduce un email"
      );
      return;
    }

    try {
      setAdding(true);
      setMemberError(null);

      await addMemberToApi(
        normalizedEmail
      );

      setEmail("");

      await loadData();
    } catch (err: unknown) {
      console.error(err);

      setMemberError(
        getErrorMessage(
          err,
          "Error enviando la invitación",
        ),
      );
    } finally {
      setAdding(false);
    }
  }

  async function handleRoleChange(
    memberId: string,
    role: "ADMIN" | "MEMBER"
  ) {
    try {
      setUpdatingRole(memberId);
      setMemberError(null);

      await updateMemberRoleToApi(
        memberId,
        role
      );

      await loadData();
    } catch (err: unknown) {
      console.error(err);

      setMemberError(
        getErrorMessage(
          err,
          "Error cambiando el rol",
        ),
      );
    } finally {
      setUpdatingRole(null);
    }
  }

  const currentUserRole =
    user?.user?.role;

  const canManageMembers =
    currentUserRole === "OWNER" ||
    currentUserRole === "ADMIN";

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">
          Dashboard
        </h1>

        <p className="mt-2 text-muted-foreground">
          Bienvenido a AWS SaaS Starter Kit.
        </p>
      </div>

      <div className="rounded-xl border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Backend conectado
        </h2>

        {error && (
          <p className="text-red-500">
            {error}
          </p>
        )}

        {user && (
          <pre className="overflow-auto text-sm">
            {JSON.stringify(
              user,
              null,
              2
            )}
          </pre>
        )}

        {loading &&
          !user &&
          !error && (
            <p>
              Cargando usuario...
            </p>
          )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Usuarios"
          value={members.length}
        />

        <StatCard
          title="Organizaciones"
          value={1}
        />

        <StatCard
          title="API Requests"
          value={1}
        />

        <StatCard
          title="Plan"
          value={
            user?.user?.plan ??
            "Free"
          }
        />
      </div>

      <section className="rounded-xl border p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            Miembros
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Usuarios pertenecientes a tu organización.
          </p>
        </div>

        {canManageMembers && (
          <form
            onSubmit={handleAddMember}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="email@ejemplo.com"
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
              disabled={adding}
            />

            <button
              type="submit"
              disabled={adding}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {adding
                ? "Enviando..."
                : "Enviar invitación"}
            </button>
          </form>
        )}

        {memberError && (
          <p className="mt-3 text-sm text-red-500">
            {memberError}
          </p>
        )}

        <div className="mt-6 space-y-3">
          {members.map(
            (member) => (
              <div
                key={member.id}
                className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {member.email}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {member.plan}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {member.role ===
                  "OWNER" ? (
                    <span className="rounded-md border px-3 py-2 text-sm font-medium">
                      OWNER
                    </span>
                  ) : canManageMembers ? (
                    <select
                      value={member.role}
                      disabled={
                        updatingRole ===
                        member.id
                      }
                      onChange={(event) =>
                        handleRoleChange(
                          member.id,
                          event.target
                            .value as
                            | "ADMIN"
                            | "MEMBER"
                        )
                      }
                      className="rounded-md border bg-background px-3 py-2 text-sm disabled:opacity-50"
                    >
                      <option value="MEMBER">
                        MEMBER
                      </option>

                      <option value="ADMIN">
                        ADMIN
                      </option>
                    </select>
                  ) : (
                    <span className="rounded-md border px-3 py-2 text-sm">
                      {member.role}
                    </span>
                  )}
                </div>
              </div>
            )
          )}

          {!loading &&
            members.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay miembros.
              </p>
            )}
        </div>
      </section>
    </main>
  );
}

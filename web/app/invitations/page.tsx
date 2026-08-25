"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getInvitationsFromApi,
  acceptInvitationToApi,
} from "@/features/auth/api";

interface Invitation {
  id: string;
  email: string;
  organizationId: string;
  role: "ADMIN" | "MEMBER";
  status: "PENDING" | "ACCEPTED" | "EXPIRED";
  createdAt: string;
  expiresAt: string;
}

export default function InvitationsPage() {
  const router = useRouter();

  const [invitations, setInvitations] =
    useState<Invitation[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [accepting, setAccepting] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  async function loadInvitations() {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getInvitationsFromApi();

      setInvitations(
        data.invitations ?? []
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ??
          "Error cargando invitaciones"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvitations();
  }, []);

  async function handleAccept(
    invitationId: string
  ) {
    try {
      setAccepting(invitationId);
      setError(null);
      setSuccess(null);

      await acceptInvitationToApi(
        invitationId
      );

      setSuccess(
        "Invitación aceptada correctamente."
      );

      setInvitations((current) =>
        current.filter(
          (invitation) =>
            invitation.id !==
            invitationId
        )
      );

      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ??
          "Error aceptando invitación"
      );
    } finally {
      setAccepting(null);
    }
  }

  function formatDate(
    value: string
  ) {
    return new Intl.DateTimeFormat(
      "es-ES",
      {
        dateStyle: "medium",
      }
    ).format(new Date(value));
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8">
          <button
            type="button"
            onClick={() =>
              router.push("/dashboard")
            }
            className="mb-6 text-sm text-muted-foreground transition hover:text-foreground"
          >
            ← Volver al dashboard
          </button>

          <h1 className="text-3xl font-bold tracking-tight">
            Invitaciones
          </h1>

          <p className="mt-2 text-muted-foreground">
            Revisa las invitaciones pendientes
            para tu cuenta.
          </p>
        </div>

        {loading && (
          <div className="rounded-xl border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Cargando invitaciones...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
            <p className="text-sm text-red-500">
              {error}
            </p>

            <button
              type="button"
              onClick={loadInvitations}
              className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && success && (
          <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/5 p-5">
            <p className="text-sm text-green-600">
              {success}
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          invitations.length === 0 && (
            <div className="rounded-xl border p-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border text-xl">
                ✓
              </div>

              <h2 className="text-lg font-semibold">
                No tienes invitaciones pendientes
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Cuando alguien te invite a una
                organización, aparecerá aquí.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/dashboard")
                }
                className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Ir al dashboard
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          invitations.length > 0 && (
            <div className="space-y-4">
              {invitations.map(
                (invitation) => (
                  <article
                    key={invitation.id}
                    className="rounded-xl border p-6"
                  >
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-lg font-semibold">
                            Invitación a una organización
                          </h2>

                          <p className="mt-1 text-sm text-muted-foreground">
                            Has recibido una
                            invitación para
                            unirte a una
                            organización.
                          </p>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Email:
                            </span>{" "}
                            <span className="font-medium">
                              {invitation.email}
                            </span>
                          </div>

                          <div>
                            <span className="text-muted-foreground">
                              Rol:
                            </span>{" "}
                            <span className="font-medium">
                              {invitation.role}
                            </span>
                          </div>

                          <div>
                            <span className="text-muted-foreground">
                              Estado:
                            </span>{" "}
                            <span className="font-medium">
                              Pendiente
                            </span>
                          </div>

                          <div>
                            <span className="text-muted-foreground">
                              Expira:
                            </span>{" "}
                            <span className="font-medium">
                              {formatDate(
                                invitation.expiresAt
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <button
                          type="button"
                          disabled={
                            accepting ===
                            invitation.id
                          }
                          onClick={() =>
                            handleAccept(
                              invitation.id
                            )
                          }
                          className="w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                          {accepting ===
                          invitation.id
                            ? "Aceptando..."
                            : "Aceptar invitación"}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
      </div>
    </main>
  );
}

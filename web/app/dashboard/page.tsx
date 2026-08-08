"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { getCurrentUserFromApi } from "@/features/auth/api";

export default function DashboardPage() {

  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {

    async function loadUser() {

      try {
        const data = await getCurrentUserFromApi();

        setUser(data);

      } catch (err: any) {

        console.error(err);

        setError(
          err.message ?? "Error cargando usuario"
        );
      }
    }


    loadUser();

  }, []);



  return (
    <>
      <div className="mb-8">

        <h1 className="text-4xl font-bold">
          Dashboard
        </h1>


        <p className="mt-2 text-muted-foreground">
          Bienvenido a AWS SaaS Starter Kit.
        </p>

      </div>


      <div className="mb-8 rounded-xl border p-6">

        <h2 className="text-xl font-semibold mb-4">
          Backend conectado
        </h2>


        {error && (
          <p className="text-red-500">
            {error}
          </p>
        )}


        {user && (
          <pre className="text-sm">
            {JSON.stringify(
              user,
              null,
              2
            )}
          </pre>
        )}


        {!user && !error && (
          <p>
            Cargando usuario...
          </p>
        )}

      </div>



      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Usuarios"
          value={1}
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
          value="Free"
        />

      </div>

    </>
  );
}

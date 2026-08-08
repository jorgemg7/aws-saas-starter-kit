import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="py-24">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 text-center">

        <span className="rounded-full border px-4 py-1 text-sm">
          🚀 Production Ready AWS Starter Kit
        </span>

        <h1 className="mt-8 text-5xl font-extrabold tracking-tight">
          Build your SaaS on AWS in minutes
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Deploy a production-ready serverless architecture with
          Terraform, Cognito, Lambda, API Gateway and DynamoDB.
        </p>

        <div className="mt-10 flex gap-4">
          <Button size="lg">
            Get Started
          </Button>

          <Button size="lg" variant="outline">
            View on GitHub
          </Button>
        </div>
      </div>
    </section>
  );
}

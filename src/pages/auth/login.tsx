import Button from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "react-daisyui";
import { useForm } from "react-hook-form";
import { loginSchema } from "./schema";
import { InputField } from "@/components/ui/input";
import { useLogin } from "./hooks";

export default function LoginPage() {
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });
  const login = useLogin();

  return (
    <form onSubmit={form.handleSubmit((v) => login.mutate(v))}>
      <Card className="w-full max-w-md" bordered>
        <Card.Body>
          <Card.Title tag="h2">Login</Card.Title>
          <p className="text-base-content/60">
            Enter username and password below to log in to your account
          </p>

          <InputField
            form={form}
            name="username"
            title="Username"
            placeholder="Enter your username"
          />

          <InputField
            form={form}
            name="password"
            title="Password"
            type="password"
            placeholder="Enter your password"
          />

          <Card.Actions className="mt-4">
            <Button
              type="submit"
              color="primary"
              className="w-full md:w-auto min-w-[100px]"
              loading={login.isPending}
            >
              Login
            </Button>
          </Card.Actions>
        </Card.Body>
      </Card>
    </form>
  );
}

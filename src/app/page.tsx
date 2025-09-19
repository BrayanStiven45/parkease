import LoginForm from "@/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-sm space-y-4">
                <LoginForm />
                <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-semibold text-primary hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}

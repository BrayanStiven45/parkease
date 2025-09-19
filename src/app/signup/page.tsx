import SignUpForm from "@/components/auth/signup-form";
import Link from "next/link";

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-sm space-y-4">
                <SignUpForm />
                 <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/" className="font-semibold text-primary hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}

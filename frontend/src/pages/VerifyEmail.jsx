import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    ShipWheelIcon,
    CheckCircleIcon,
    XCircleIcon,
    Loader2Icon,
    RefreshCwIcon,
} from "lucide-react";
import { verifyEmail, resendVerificationEmail } from "../lib/api.js";
import { useQueryClient } from "@tanstack/react-query";

const VerifyEmail = () => {
    const { token } = useParams();
    const queryClient = useQueryClient();

    const [status, setStatus] = useState("verifying"); // verifying | success | error
    const [message, setMessage] = useState("");

    // Resend-link state (shown in error state)
    const [resendEmail, setResendEmail] = useState("");
    const [resendStatus, setResendStatus] = useState("idle"); // idle | loading | sent | error

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("No verification token found in the URL.");
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const data = await verifyEmail(token);
                if (cancelled) return;
                setStatus("success");
                setMessage(data.message || "Email verified successfully!");

                // Invalidate cached auth state then do a HARD redirect so the
                // browser picks up the new JWT cookie on the fresh page load.
                await queryClient.invalidateQueries({ queryKey: ["authUser"] });
                setTimeout(() => {
                    window.location.href = "/";
                }, 2500);
            } catch (err) {
                if (cancelled) return;
                setStatus("error");
                setMessage(
                    err?.response?.data?.message ||
                    "Something went wrong. The link may have expired."
                );
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [token, queryClient]);

    const handleResend = async (e) => {
        e.preventDefault();
        if (!resendEmail.trim()) return;
        setResendStatus("loading");
        try {
            await resendVerificationEmail(resendEmail.trim().toLowerCase());
            setResendStatus("sent");
        } catch {
            setResendStatus("error");
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-base-200 p-4"
            data-theme="forest"
        >
            {/* Ambient glow */}
            <div
                className="pointer-events-none fixed inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(var(--p)/0.12) 0%, transparent 70%)",
                }}
            />

            <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300 relative z-10">
                <div className="card-body items-center text-center gap-6 p-8">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <ShipWheelIcon className="size-8 text-primary" />
                        <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                            YapChat
                        </span>
                    </div>

                    {/* Status Icon */}
                    {status === "verifying" && (
                        <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center ring-4 ring-primary/25">
                            <Loader2Icon className="w-10 h-10 text-primary animate-spin" />
                        </div>
                    )}
                    {status === "success" && (
                        <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center ring-4 ring-success/25 animate-bounce">
                            <CheckCircleIcon className="w-10 h-10 text-success" />
                        </div>
                    )}
                    {status === "error" && (
                        <div className="w-20 h-20 rounded-full bg-error/15 flex items-center justify-center ring-4 ring-error/25">
                            <XCircleIcon className="w-10 h-10 text-error" />
                        </div>
                    )}

                    {/* Heading */}
                    <div className="space-y-2">
                        {status === "verifying" && (
                            <>
                                <h1 className="text-2xl font-bold">Verifying your email…</h1>
                                <p className="text-base-content/60 text-sm">
                                    Just a moment while we confirm your address.
                                </p>
                            </>
                        )}
                        {status === "success" && (
                            <>
                                <h1 className="text-2xl font-bold text-success">All verified! 🎉</h1>
                                <p className="text-base-content/70 text-sm">{message}</p>
                                <p className="text-base-content/50 text-xs">
                                    Redirecting you to the app…
                                </p>
                            </>
                        )}
                        {status === "error" && (
                            <>
                                <h1 className="text-2xl font-bold text-error">Link invalid or expired</h1>
                                <p className="text-base-content/70 text-sm">{message}</p>
                            </>
                        )}
                    </div>

                    {/* Actions for error state */}
                    {status === "error" && (
                        <div className="flex flex-col gap-4 w-full">

                            {/* Resend a fresh link */}
                            {resendStatus !== "sent" ? (
                                <form onSubmit={handleResend} className="flex flex-col gap-2 w-full">
                                    <p className="text-xs text-base-content/50 text-left">
                                        Enter your email to get a fresh link:
                                    </p>
                                    <input
                                        type="email"
                                        required
                                        placeholder="you@example.com"
                                        value={resendEmail}
                                        onChange={(e) => setResendEmail(e.target.value)}
                                        className="input input-bordered input-sm w-full"
                                    />
                                    {resendStatus === "error" && (
                                        <p className="text-xs text-error text-left">
                                            Failed to send. Please try again.
                                        </p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={resendStatus === "loading"}
                                        className="btn btn-primary btn-sm w-full gap-2"
                                    >
                                        {resendStatus === "loading" ? (
                                            <>
                                                <span className="loading loading-spinner loading-xs" />
                                                Sending…
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCwIcon className="w-4 h-4" />
                                                Resend verification email
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="alert alert-success py-2 text-sm w-full">
                                    <CheckCircleIcon className="w-4 h-4" />
                                    <span>A new link has been sent! Check your inbox.</span>
                                </div>
                            )}

                            <div className="divider my-0 text-xs text-base-content/30">or</div>

                            <a href="/signup" className="btn btn-outline btn-sm w-full">
                                Create a new account
                            </a>
                            <a href="/login" className="btn btn-ghost btn-sm">
                                Back to login
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;

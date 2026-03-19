import { ShipWheelIcon, MailIcon, RefreshCwIcon, CheckCircleIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { resendVerificationEmail } from "../lib/api.js";

const EmailVerificationPending = () => {
    const location = useLocation();
    // email is optionally passed as location state from the signup mutation
    const email = location.state?.email || "";

    const [resendStatus, setResendStatus] = useState("idle"); // idle | loading | success | error
    const [resendError, setResendError] = useState("");

    const handleResend = async () => {
        if (!email) return;
        setResendStatus("loading");
        setResendError("");
        try {
            await resendVerificationEmail(email);
            setResendStatus("success");
        } catch (err) {
            setResendError(err?.response?.data?.message || "Failed to resend. Try again.");
            setResendStatus("error");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4" data-theme="forest">
            {/* Ambient glow */}
            <div
                className="pointer-events-none fixed inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(var(--p)/0.12) 0%, transparent 70%)",
                }}
            />

            <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300 relative z-10">
                <div className="card-body items-center text-center gap-5 p-8">
                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-1">
                        <ShipWheelIcon className="size-8 text-primary" />
                        <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                            YapChat
                        </span>
                    </div>

                    {/* Icon */}
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center ring-4 ring-primary/25 animate-pulse">
                            <MailIcon className="w-10 h-10 text-primary" />
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold">Check your inbox 📬</h1>
                        <p className="text-base-content/70 text-sm leading-relaxed">
                            We've sent a verification link to{" "}
                            {email ? (
                                <span className="font-semibold text-primary">{email}</span>
                            ) : (
                                "your email address"
                            )}
                            . Click the link to activate your account.
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="bg-base-200 rounded-xl p-4 w-full text-left space-y-3">
                        {[
                            "Open the email from YapChat",
                            'Click the "Verify my email →" button',
                            "You'll be logged in automatically",
                        ].map((step, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                                    {i + 1}
                                </span>
                                <span className="text-sm text-base-content/80">{step}</span>
                            </div>
                        ))}
                    </div>

                    {/* Resend section */}
                    {email && (
                        <div className="w-full space-y-2">
                            {resendStatus === "success" ? (
                                <div className="alert alert-success py-2 text-sm">
                                    <CheckCircleIcon className="w-4 h-4" />
                                    <span>Verification email resent!</span>
                                </div>
                            ) : (
                                <>
                                    {resendStatus === "error" && (
                                        <div className="alert alert-error py-2 text-sm">
                                            <span>{resendError}</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={handleResend}
                                        disabled={resendStatus === "loading"}
                                        className="btn btn-outline btn-sm w-full gap-2"
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
                                </>
                            )}
                        </div>
                    )}

                    <p className="text-xs text-base-content/50 mt-1">
                        Wrong account?{" "}
                        <Link to="/signup" className="text-primary hover:underline">
                            Sign up with a different email
                        </Link>
                    </p>

                    <div className="divider my-0 text-xs text-base-content/30">already verified?</div>

                    <Link to="/login" className="btn btn-primary w-full btn-sm">
                        Go to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationPending;

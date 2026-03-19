import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { signup } from "../lib/api.js";

const useSignUp = () => {
  const navigate = useNavigate();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (_data, variables) => {
      // Redirect to the "check your email" page and pass the email for the resend button
      navigate("/verify-email-pending", { state: { email: variables.email } });
    },
  });

  return { isPending, error, signupMutation: mutate };
};

export default useSignUp;
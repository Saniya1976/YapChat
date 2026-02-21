import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from "../lib/api.js";
import { useChatStore } from "../store/useChatStore.js";

const useLogout = () => {
  const queryClient = useQueryClient();
  const { disconnect } = useChatStore();

  const { mutate: logoutMutation } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      disconnect();
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
    }
  });

  return { logoutMutation };
};
export default useLogout
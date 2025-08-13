import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { getOutgoingFriendReqs, getRecommendedUsers, getUserFriends, sendFriendRequest } from '../lib/api.js';

const Home = () => {
  const queryClient=useQueryClient();
  const[outgoingRequestsIds,setOutgoingRequestsIds]=useState();

  const{data:friends=[],isLoading:loadingFriends}=useQuery(
   { queryKey:[friends],
    queryFn:getUserFriends
}
  );
const{data:recommendedUsers=[],isLoading:loadingUsers}=useQuery(
   { queryKey:[users],
    queryFn:getRecommendedUsers
}
  );
  const{data:getOutgoingFriendReqs=[]}=useQuery(
   { queryKey:[outgoingFriendReqs],
    queryFn:getOutgoingFriendReqs
  }
  );
  const {mutate:sendRequestMutation,isPending}=useMutation({
    mutationFn:sendFriendRequest,
    onSuccess:()=>queryClient.invalidateQueries({queryKey:["outgoingFriendReqs"]})
  });
  return (
    <div>
    
    </div>
  )
}

export default Home

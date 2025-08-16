import React from 'react'
import { useParams } from 'react-router-dom';

const Chat = () => {
  const { id } = useParams();
  console.log("Chat ID:", id);
  return (
    <div>
      CHAT
    </div>
  )
}

export default Chat
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { io } from "socket.io-client";

import { Message, IMessage } from "../Message";
import { api } from "../../services/api";
import { styles } from "./styles";

const messagesQueue: IMessage[] = [];

const socket = io(String(api.defaults.baseURL));
socket.on("new_message", (newMessage: IMessage) => {
  messagesQueue.push(newMessage);
});

export function MessageList() {
  const [currentMessages, setCurrentMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    async function fetchMessages() {
      const messagesResponse = await api.get<IMessage[]>("/messages/last3");
      setCurrentMessages(messagesResponse.data);
    }

    fetchMessages();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (messagesQueue.length > 0) {
        setCurrentMessages((prevState) => [
          messagesQueue[0],
          prevState[0],
          prevState[1],
        ]);

        messagesQueue.shift();
      }
    }, 3000);

    return () => clearInterval(timer);
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="never"
    >
      {currentMessages.map((message) => (
        <Message key={message.id} data={message} />
      ))}
    </ScrollView>
  );
}
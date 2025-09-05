import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send, User } from "lucide-react";
import { Loader2, MousePointer2 } from "lucide-react"; // assuming MousePointer2 exists

interface Message {
  messages: {
    content: string;
    role: string;
  }[];
}

const MessageCard = ({
  prompt,
  handleSubmit,
  handleInputChange,
  isPending,
}: {
  prompt: string;
  handleSubmit: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPending: boolean;
}) => {
  const [content, setContent] = useState<string>("");

  const handleTextInpaint = () => {
    setContent(prompt);
    handleSubmit();
  };

  return (
    <div>
      <Card className="w-full max-w-2xl mx-auto mt-5">
        <CardContent className="p-4 h-[100px] overflow-y-auto">
          {/* {messages.map((message, index) => (
            <div key={index} className="flex items-start mb-4">
              {message.role === "user" && <User />}
              <div
                className={`p-2 rounded-lg ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))} */}

          {content && (
            <div className="flex items-start mb-4">
              <User />
              <div
                className={`p-2 rounded-lg 
                  bg-primary text-primary-foreground
                `}
              >
                {content}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex w-full space-x-2">
            <Input
              value={prompt ? prompt : content}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-grow"
            />
            <div className=" flex justify-center">
              <Button
                variant="secondary"
                className="  flex items-center bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold px-4 py-2"
                onClick={handleTextInpaint}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MousePointer2 className="h-4 w-4 mr-2" />
                )}
                {isPending ? "Generating..." : "Inpaint image"}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MessageCard;

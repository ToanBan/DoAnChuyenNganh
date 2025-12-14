'use client'
import { createContext, useState, useEffect } from "react";

export const PostsContext = createContext<any | undefined>(undefined);

export const PostsProvider = ({ children }: { children: React.ReactNode }) => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/posts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log(data.message);
      setPosts(data.message);
    } catch (error) {
      console.error(error);
      return;
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);
  return (
    <PostsContext.Provider value={{ posts, fetchPosts }}>
      {children}
    </PostsContext.Provider>
  );
};

'use client'
import React, { use, useEffect, useState } from "react";
import PostCreator from "@/components/PostCreator";
import SidebarForum from "@/app/components/share/siderbar_forum";
import PostCard from "@/components/PostCard";
const PostUserForum = ({ params }: { params: Promise<{ slug: string }> }) => {
  const resolvedParams = use(params); 
  const forumId = resolvedParams.slug;
  const [posts, setPosts] = useState([]);

  const GetPostForum = async() => {
    try {
      const res = await fetch(`http://localhost:5000/api/forum/${forumId}`, {
        method:"GET",
        headers:{
          "Content-Type":"application/json"
        }, 
        credentials:"include"
      })

      if(res.ok){
        const data = await res.json();
        setPosts(data.message)
      }
    } catch (error) {
      console.error(error);
      return setPosts([]);
    }
  }

  useEffect(()=> {
    GetPostForum();
  },[])

  return (
    <main className="bg-light min-vh-100 py-5">
      <div className="container-fluid">
        <div className="row">
          <SidebarForum forumId={forumId} />
          <div className="col-9">
            <PostCreator forumId={forumId} />
            <PostCard posts={posts}/>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PostUserForum;

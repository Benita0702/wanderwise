import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/blog.css";

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:1337/api/blogs")
      .then((res) => {
        setBlogs(res.data.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="blog-page">
      <h2>Travel Tips & Blogs</h2>
      <div className="blog-grid">
        {blogs.map((blog) => {
          const contentText =
            blog.Content?.[0]?.children?.[0]?.text || "No content available";

          return (
            <div key={blog.id} className="blog-card">
              {/* Since no image field exists, remove image block */}
              <h3>{blog.Title}</h3>
              <p>{contentText.slice(0, 100)}...</p>
              <button>Read More</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlogPage;

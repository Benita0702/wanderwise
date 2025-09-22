import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import renderRichText from "../utils/renderRichText";

const BlogDetails = () => {
  const { id } = useParams(); // URL param
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(
          `http://localhost:1337/api/blogs?filters[id]=${id}&populate=*`
        );
        const data = await response.json();
        console.log("API response:", data); // 🔎 Debug log

        if (data.data.length > 0) {
          const item = data.data[0];
          setBlog({
            id: item.id,
            title: item.Title || "Untitled",
            content: item.Content || null, // ✅ keep content as JSON
            date: item.publishedDate
              ? new Date(item.publishedDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "No date",
            image:
              item.Image && item.Image.length > 0
                ? item.Image[0].url
                : null, // ✅ keep your existing logic
          });
        } else {
          setBlog(null);
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) return <p className="text-center">Loading...</p>;
  if (!blog) return <p className="text-center text-red-500">Blog not found</p>;

  return (
    <section className="py-16 px-8">
      <Link to="/blogs" className="text-blue-500 hover:underline">
        ← Back to Blogs
      </Link>

      {/* ✅ 2-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 items-start">
        {/* Left: Image */}
        <div>
          {blog.image ? (
            <img
              src={`http://localhost:1337${blog.image}`}
              alt={blog.title}
              className="w-full rounded-lg"
            />
          ) : (
            <p className="text-gray-400">No image available</p>
          )}
        </div>

        {/* Right: Text */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
          <p className="text-gray-500 mb-6">📅 {blog.date}</p>

          {/* ✅ Properly render rich text JSON */}
          <div className="prose max-w-none">
            {blog.content ? renderRichText(blog.content) : "No content available"}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogDetails;

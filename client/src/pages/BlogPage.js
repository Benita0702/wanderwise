import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import renderRichText from "../utils/renderRichText";
import { STRAPI_URL } from "../api"; // ✅ import your Strapi URL

const authors = ["Priya Sharma", "Rahul Gupta", "Anita Nair"];

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/blogs?populate=*");
        const data = await response.json();
        console.log("Raw API data:", data);

        // ✅ Normalize with image support
        const normalized = data.data.map((item, index) => {
          const img = item.Image?.[0];
          return {
            id: item.id,
            title: item.Title || "Untitled",
            content: item.Content || null,
            author: authors[index % authors.length],
            date: item.publishedDate
              ? new Date(item.publishedDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "No date",
            image: img
              ? `${STRAPI_URL}${
                  img.formats?.medium?.url ||
                  img.formats?.small?.url ||
                  img.formats?.thumbnail?.url ||
                  img.url
                }`
              : null,
          };
        });

        console.log("Normalized blogs:", normalized);
        setBlogs(normalized);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <section className="py-16 px-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Travel Stories</h1>
      <p className="text-center text-gray-600 mb-12">
        Explore real travel stories, tips, and inspiration from fellow travelers
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden"
          >
            {/* ✅ Blog Image */}
            {blog.image && (
              <img
                src={blog.image}
                alt={blog.title}
                className="h-48 w-full object-cover"
              />
            )}

            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>

              <div className="text-sm text-gray-600 line-clamp-2 mb-4">
                {blog.content
                  ? renderRichText(blog.content)
                  : "No content available"}
              </div>

              <div className="flex items-center justify-between text-gray-500 text-sm mb-3">
                <span>👤 {blog.author}</span>
                <span>📅 {blog.date}</span>
              </div>

              <Link
                to={`/blog/${blog.id}`}
                className="text-blue-500 hover:underline"
              >
                Read More →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BlogPage;

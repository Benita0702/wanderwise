import { STRAPI_URL } from "../../api";
import { Calendar, User } from "lucide-react";
import { Link } from "react-router-dom";

const authors = ["Priya Sharma", "Rahul Gupta", "Anita Nair"];

export function TravelStories({ blogs, renderRichText }) {
  return (
    <section className="py-12 px-8 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-8">
        Travel Stories & Inspiration
      </h2>
      <p className="text-center text-gray-600 mb-10">
        Get inspired by real travel stories and expert guides from fellow travelers
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogs.slice(0, 3).map((blog, index) => (
          <div
            key={blog.id}
            className="bg-white rounded-xl shadow hover:shadow-xl overflow-hidden transition-transform hover:scale-105"
          >
            {/* Blog Image */}
            {blog.Image?.[0] && (
              <div className="relative">
                <img
                  src={`${STRAPI_URL}${
                    blog.Image[0].formats?.medium?.url ||
                    blog.Image[0].formats?.small?.url ||
                    blog.Image[0].formats?.thumbnail?.url ||
                    blog.Image[0].url
                  }`}
                  alt={blog.Title || "Blog image"}
                  className="h-48 w-full object-cover"
                />
                {blog.Category && (
                  <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow">
                    {blog.Category}
                  </span>
                )}
              </div>
            )}

            {/* Blog Content */}
            <div className="p-5">
              <h3 className="font-semibold text-lg mb-2">{blog.Title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {renderRichText(blog.Content)}
              </p>

              {/* Blog Meta Info */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{authors[index % authors.length]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{blog.Date || blog.publishedDate || "15 Jan 2025"}</span>
                </div>
              </div>

              {/* Read More */}
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

      {/* Load More */}
      <div className="flex justify-center mt-8">
        <Link
          to="/blogs"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Load More
        </Link>
      </div>
    </section>
  );
}

import { STRAPI_URL } from "../../api";

export function TravelStories({ blogs, renderRichText }) {
  return (
    <section className="py-12 px-8 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-8">
        Travel Inspiration
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="bg-white rounded-xl shadow hover:shadow-xl overflow-hidden transition-transform hover:scale-105"
          >
            {blog.Image?.data?.[0] && (
              <img
                src={`${STRAPI_URL}${blog.Image.data[0].attributes.url}`}
                alt={blog.Title}
                className="h-40 w-full object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg">{blog.Title}</h3>
              <p className="text-sm text-gray-600 line-clamp-3">
                {renderRichText(blog.Content)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

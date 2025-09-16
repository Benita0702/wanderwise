import { STRAPI_URL } from "../../api";

export function Testimonials({ testimonials, renderRichText }) {
  return (
    <section className="py-12 px-8">
      <h2 className="text-3xl font-bold text-center mb-8">
        What Our Travelers Say
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((test) => (
          <div
            key={test.id}
            className="bg-blue-50 p-6 rounded-xl shadow hover:shadow-md"
          >
            {test.Photo?.data && (
              <img
                src={`${STRAPI_URL}${test.Photo.data.attributes.url}`}
                alt={test.Name}
                className="h-16 w-16 object-cover rounded-full mb-3 mx-auto"
              />
            )}
            <p className="italic">“{renderRichText(test.Feedback)}”</p>
            <p className="mt-2 font-semibold text-center">
              – {test.Name} ⭐{"⭐".repeat(test.Rating || 0)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
